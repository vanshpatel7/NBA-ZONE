from flask import Flask, request, jsonify
from flask_cors import CORS
from generate_team_differentials import generate_team_differentials
from nba_api.live.nba.endpoints import scoreboard
from nba_api.stats.endpoints import leaguedashteamstats, leaguestandings, teamgamelog, leaguegamefinder, teamplayerdashboard, boxscoretraditionalv2, playergamelog, playercareerstats, teamdashboardbygeneralsplits
from nba_api.stats.static import teams
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
import time
import json
import os
import atexit
import pandas as pd

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Cache / Rate Limiting prevention
last_request_time = 0
MIN_REQUEST_INTERVAL = 1.0  # 1 second between calls to be safe
TEAM_RANKINGS_TTL = 60 * 30  # 30 minutes
TEAM_TOTALS_TTL = 60 * 30  # 30 minutes for team totals cache
DEFAULT_SEASON = "2025-26"
team_rankings_cache = {}
team_totals_cache = {}  # Cache for team season totals (usage rates)

def _format_rank(rank):
    if rank is None:
        return "-"
    rank = int(rank)
    if rank <= 0:
        return "-"
    if rank == 1:
        return "1st"
    if rank == 2:
        return "2nd"
    if rank == 3:
        return "3rd"
    return f"{rank}th"

def _pick_column(columns, candidates):
    for col in candidates:
        if col in columns:
            return col
    return None

def _normalize_team_name(value):
    if not value:
        return ""
    return str(value).strip().lower().replace(".", "")

def _build_team_abbr_map():
    mapping = {}
    for team in teams.get_teams():
        full_name = team.get("full_name")
        abbr = team.get("abbreviation")
        if full_name and abbr:
            mapping[_normalize_team_name(full_name)] = abbr
    return mapping

def _extract_team_stats_frame(stats):
    frames = stats.get_data_frames()
    if not frames:
        return pd.DataFrame()
    for frame in frames:
        cols = set(frame.columns)
        if 'TEAM_ABBREVIATION' in cols and ('PTS' in cols or 'PTS_PG' in cols):
            return frame
    return frames[0]

def get_live_scoreboard():
    global last_request_time
    now = time.time()
    if now - last_request_time < MIN_REQUEST_INTERVAL:
        time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
    
    last_request_time = time.time()
    
    # This endpoint gets today's live scores
    board = scoreboard.ScoreBoard()
    return board.get_dict()

@app.route('/games', methods=['GET'])
def get_games():
    # Helper to mimic the structure your Java app expects
    # The balldontlie API returned { "data": [ ... ] }
    # We will try to map nba_api data to that structure
    
    # Note: nba_api ScoreBoard endpoint usually returns TODAY's games.
    # If specific dates are requested, we might need a different endpoint.
    # However, 'nba_api.live.nba.endpoints.scoreboard' is best for live updates.
    # For historical or specific date data, we would use 'leaguegamefinder'.
    # Given the project seems to focus on "Today's Games" or "Live Updates",
    # we'll start with the ScoreBoard endpoint for simplicity.
    
    # If specific dates are requested via ?dates[]=YYYY-MM-DD, 
    # Handling that with `leaguegamefinder` is more complex because it's distinct from live data.
    # For now, let's implement the live/today view which seems to be the priority.
    
    try:
        data = get_live_scoreboard()
        games_list = []
        
        # Structure from nba_api look like:
        # 'scoreboard': { 'gameDate': '...', 'games': [ ... ] }
        
        if 'scoreboard' in data and 'games' in data['scoreboard']:
            for g in data['scoreboard']['games']:
                # Map to format expected by Java Game class
                # Java Game class fields: id, date, season, status, period, time, postseason,
                # homeTeamScore, visitorTeamScore, homeTeam, visitorTeam
                
                game_obj = {
                    "id": g['gameId'],
                    "date": data['scoreboard']['gameDate'], # YYYY-MM-DD
                    "season": 2024, # Hardcoded or derived
                    "status": g['gameStatusText'],
                    "period": g['period'],
                    "time": g['gameStatusText'], # repeated for now
                    "postseason": False,
                    "home_team_score": g['homeTeam']['score'],
                    "visitor_team_score": g['awayTeam']['score'],
                    "home_team": {
                        "id": g['homeTeam']['teamId'],
                        "full_name": g['homeTeam']['teamName'] + " " + g['homeTeam']['teamCity'], # Approximation
                        "name": g['homeTeam']['teamName'],
                        "abbreviation": g['homeTeam']['teamTricode'],
                        "city": g['homeTeam']['teamCity']
                    },
                    "visitor_team": {
                        "id": g['awayTeam']['teamId'],
                        "full_name": g['awayTeam']['teamName'] + " " + g['awayTeam']['teamCity'],
                        "name": g['awayTeam']['teamName'],
                        "abbreviation": g['awayTeam']['teamTricode'],
                        "city": g['awayTeam']['teamCity']
                    }
                }
                games_list.append(game_obj)
                
        return jsonify({"data": games_list})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"data": [], "error": str(e)}), 500

@app.route('/games/finals', methods=['GET'])
def get_final_games():
    try:
        data = get_live_scoreboard()
        games_list = []
        game_date = None

        if 'scoreboard' in data:
            game_date = data['scoreboard'].get('gameDate')
            for g in data['scoreboard'].get('games', []):
                status_text = g.get('gameStatusText', '')
                if 'Final' in status_text:
                    games_list.append({
                        "game_id": g.get('gameId'),
                        "game_date": game_date,
                        "status": status_text
                    })

        return jsonify({"games": games_list, "count": len(games_list), "game_date": game_date})
    except Exception as e:
        print(f"Error fetching final games: {e}")
        return jsonify({"games": [], "error": str(e)}), 500

def _parse_minutes(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str) and ':' in value:
        parts = value.split(':', 1)
        try:
            minutes = int(parts[0])
            seconds = int(parts[1])
            return round(minutes + (seconds / 60.0), 2)
        except ValueError:
            return None
    try:
        return float(value)
    except ValueError:
        return None

@app.route('/games/<game_id>/boxscore', methods=['GET'])
def get_game_boxscore(game_id):
    try:
        global last_request_time
        now = time.time()
        if now - last_request_time < MIN_REQUEST_INTERVAL:
            time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
        last_request_time = time.time()

        box = boxscoretraditionalv2.BoxScoreTraditionalV2(game_id=game_id)
        data = box.get_dict()

        players = []
        teams = []
        for rs in data.get('resultSets', []):
            if rs.get('name') == 'PlayerStats':
                headers = rs.get('headers', [])
                rows = rs.get('rowSet', [])

                def idx(col):
                    try:
                        return headers.index(col)
                    except ValueError:
                        return -1

                player_id_idx = idx('PLAYER_ID')
                player_name_idx = idx('PLAYER_NAME')
                team_id_idx = idx('TEAM_ID')
                team_abbr_idx = idx('TEAM_ABBREVIATION')
                min_idx = idx('MIN')
                pts_idx = idx('PTS')
                reb_idx = idx('REB')
                ast_idx = idx('AST')
                stl_idx = idx('STL')
                blk_idx = idx('BLK')
                tov_idx = idx('TO')
                fgm_idx = idx('FGM')
                fga_idx = idx('FGA')
                fg_pct_idx = idx('FG_PCT')
                fg3m_idx = idx('FG3M')
                fg3a_idx = idx('FG3A')
                fg3_pct_idx = idx('FG3_PCT')
                ftm_idx = idx('FTM')
                fta_idx = idx('FTA')
                ft_pct_idx = idx('FT_PCT')

                for row in rows:
                    players.append({
                        "player_id": row[player_id_idx] if player_id_idx >= 0 else None,
                        "player_name": row[player_name_idx] if player_name_idx >= 0 else None,
                        "team_id": row[team_id_idx] if team_id_idx >= 0 else None,
                        "team_abbr": row[team_abbr_idx] if team_abbr_idx >= 0 else None,
                        "min": _parse_minutes(row[min_idx]) if min_idx >= 0 else None,
                        "pts": row[pts_idx] if pts_idx >= 0 else None,
                        "reb": row[reb_idx] if reb_idx >= 0 else None,
                        "ast": row[ast_idx] if ast_idx >= 0 else None,
                        "stl": row[stl_idx] if stl_idx >= 0 else None,
                        "blk": row[blk_idx] if blk_idx >= 0 else None,
                        "tov": row[tov_idx] if tov_idx >= 0 else None,
                        "fgm": row[fgm_idx] if fgm_idx >= 0 else None,
                        "fga": row[fga_idx] if fga_idx >= 0 else None,
                        "fg_pct": row[fg_pct_idx] if fg_pct_idx >= 0 else None,
                        "fg3m": row[fg3m_idx] if fg3m_idx >= 0 else None,
                        "fg3a": row[fg3a_idx] if fg3a_idx >= 0 else None,
                        "fg3_pct": row[fg3_pct_idx] if fg3_pct_idx >= 0 else None,
                        "ftm": row[ftm_idx] if ftm_idx >= 0 else None,
                        "fta": row[fta_idx] if fta_idx >= 0 else None,
                        "ft_pct": row[ft_pct_idx] if ft_pct_idx >= 0 else None
                    })
                break
            if rs.get('name') == 'TeamStats':
                headers = rs.get('headers', [])
                rows = rs.get('rowSet', [])

                def idx(col):
                    try:
                        return headers.index(col)
                    except ValueError:
                        return -1

                team_id_idx = idx('TEAM_ID')
                team_abbr_idx = idx('TEAM_ABBREVIATION')
                pts_idx = idx('PTS')

                for row in rows:
                    teams.append({
                        "team_id": row[team_id_idx] if team_id_idx >= 0 else None,
                        "team_abbr": row[team_abbr_idx] if team_abbr_idx >= 0 else None,
                        "pts": row[pts_idx] if pts_idx >= 0 else None
                    })

        return jsonify({"game_id": game_id, "players": players, "teams": teams, "count": len(players)})
    except Exception as e:
        print(f"Error fetching boxscore for game {game_id}: {e}")
        return jsonify({"game_id": game_id, "players": [], "error": str(e)}), 500

@app.route('/standings', methods=['GET'])
def get_standings():
    try:
        # Fetch current 2025-26 standings
        standings = leaguestandings.LeagueStandings(season='2025-26')
        data = standings.get_dict()
        
        # Current 'standings.js' expects: { east: [], west: [] }
        # nba_api returns a 'Standings' result set with 'Conference' column
        
        east = []
        west = []
        
        headers = data['resultSets'][0]['headers']
        rows = data['resultSets'][0]['rowSet']
        
            # Safe get_val that returns None if col doesn't exist
        def get_val_safe(row, col):
            try:
                idx = headers.index(col)
                return row[idx]
            except ValueError:
                return None

        for row in rows:
            conf = get_val_safe(row, 'Conference')
            
            # Determine abbreviation (fallback logic since TeamSlug/TeamAbbreviation might vary)
            city = get_val_safe(row, 'TeamCity')
            name = get_val_safe(row, 'TeamName')
            full_name = f"{city} {name}"
            
            # Simple heuristic for abbreviation if 'ClinchIndicator' or others aren't perfect
            # For now, let's just use the first 3 letters of the city or name uppercased
            # This is not perfect (e.g. BKN vs BRO, OKC vs OKL) but better than crashing
            abbrev = name[:3].upper() # Fallback
            
            team_obj = {
                "id": get_val_safe(row, 'TeamID'),
                "name": name,
                "fullName": full_name,
                "abbreviation": abbrev, 
                "wins": get_val_safe(row, 'WINS'),
                "losses": get_val_safe(row, 'LOSSES'),
                "last10": get_val_safe(row, 'L10'),
                "streak": get_val_safe(row, 'strCurrentStreak')
            }
            
            if conf == 'East':
                east.append(team_obj)
            elif conf == 'West':
                west.append(team_obj)
                
        return jsonify({"east": east, "west": west})

    except Exception as e:
        print(f"Error fetching standings: {e}")
        return jsonify({"east": [], "west": [], "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "up"})

# NBA Team abbreviation to ID mapping
NBA_TEAM_IDS = {
    'ATL': 1610612737, 'BOS': 1610612738, 'BKN': 1610612751, 'CHA': 1610612766,
    'CHI': 1610612741, 'CLE': 1610612739, 'DAL': 1610612742, 'DEN': 1610612743,
    'DET': 1610612765, 'GSW': 1610612744, 'HOU': 1610612745, 'IND': 1610612754,
    'LAC': 1610612746, 'LAL': 1610612747, 'MEM': 1610612763, 'MIA': 1610612748,
    'MIL': 1610612749, 'MIN': 1610612750, 'NOP': 1610612740, 'NYK': 1610612752,
    'OKC': 1610612760, 'ORL': 1610612753, 'PHI': 1610612755, 'PHX': 1610612756,
    'POR': 1610612757, 'SAC': 1610612758, 'SAS': 1610612759, 'TOR': 1610612761,
    'UTA': 1610612762, 'WAS': 1610612764
}

# Reverse mapping: ID to abbreviation
NBA_ID_TO_ABBREV = {v: k for k, v in NBA_TEAM_IDS.items()}

@app.route('/teams/<int:team_id>/games', methods=['GET'])
def get_team_games(team_id):
    """
    Get recent completed games for a specific team using LeagueGameFinder.
    Returns the last N games with scores and results.
    """
    try:
        limit = request.args.get('limit', 5, type=int)
        
        # Rate limiting
        global last_request_time
        now = time.time()
        if now - last_request_time < MIN_REQUEST_INTERVAL:
            time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
        last_request_time = time.time()
        
        # Get games from the last 60 days using LeagueGameFinder (has current season data)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=60)
        
        finder = leaguegamefinder.LeagueGameFinder(
            team_id_nullable=team_id,
            date_from_nullable=start_date.strftime('%m/%d/%Y'),
            date_to_nullable=end_date.strftime('%m/%d/%Y')
        )
        
        data = finder.get_dict()
        games_list = []
        
        if 'resultSets' in data and len(data['resultSets']) > 0:
            headers = data['resultSets'][0]['headers']
            rows = data['resultSets'][0]['rowSet']
            
            # Get column indices
            def get_idx(col):
                try:
                    return headers.index(col)
                except ValueError:
                    return -1
            
            game_id_idx = get_idx('GAME_ID')
            game_date_idx = get_idx('GAME_DATE')
            matchup_idx = get_idx('MATCHUP')
            wl_idx = get_idx('WL')
            pts_idx = get_idx('PTS')
            plus_minus_idx = get_idx('PLUS_MINUS')
            
            # Get the team's abbreviation
            team_abbrev = NBA_ID_TO_ABBREV.get(team_id, 'UNK')
            
            # Process last N games (rows are already in reverse chronological order)
            for i, row in enumerate(rows[:limit]):
                game_date = row[game_date_idx] if game_date_idx >= 0 else ''
                matchup = row[matchup_idx] if matchup_idx >= 0 else ''
                wl = row[wl_idx] if wl_idx >= 0 else ''
                pts = row[pts_idx] if pts_idx >= 0 else 0
                
                # Parse matchup to get opponent and home/away
                # Format is like "OKC vs. MIN" (home) or "OKC @ DAL" (away)
                is_home = ' vs. ' in matchup
                if is_home:
                    parts = matchup.split(' vs. ')
                    opponent_abbrev = parts[1] if len(parts) > 1 else 'UNK'
                else:
                    parts = matchup.split(' @ ')
                    opponent_abbrev = parts[1] if len(parts) > 1 else 'UNK'
                
                # Calculate opponent score using plus/minus
                opp_pts = 0
                if plus_minus_idx >= 0 and row[plus_minus_idx] is not None:
                    plus_minus = row[plus_minus_idx]
                    opp_pts = pts - plus_minus
                
                # Format date nicely
                try:
                    date_obj = datetime.strptime(game_date, '%Y-%m-%d')
                    formatted_date = date_obj.strftime('%b %d')
                except:
                    formatted_date = game_date
                
                game_obj = {
                    "id": row[game_id_idx] if game_id_idx >= 0 else i,
                    "date": game_date,
                    "formatted_date": formatted_date,
                    "matchup": matchup,
                    "result": wl,
                    "win": wl == 'W',
                    "team_score": pts,
                    "opponent_score": int(opp_pts) if opp_pts else 0,
                    "opponent": opponent_abbrev,
                    "is_home": is_home,
                    "display_opponent": f"{'vs' if is_home else 'at'} {opponent_abbrev}",
                    "display_result": f"{'W' if wl == 'W' else 'L'} {pts}-{int(opp_pts) if opp_pts else '?'}"
                }
                games_list.append(game_obj)
        
        return jsonify({"data": games_list, "team_id": team_id})
        
    except Exception as e:
        print(f"Error fetching team games: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"data": [], "error": str(e)}), 500

@app.route('/teams/<int:team_id>/leaders', methods=['GET'])
def get_team_leaders(team_id):
    """
    Get live team leaders (top performers) by PPG, RPG, APG.
    Returns the top scorer, rebounder, and assists leader with current season stats.
    """
    try:
        # Rate limiting
        global last_request_time
        now = time.time()
        if now - last_request_time < MIN_REQUEST_INTERVAL:
            time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
        last_request_time = time.time()
        
        # Fetch team player stats for current season (2025-26)
        dashboard = teamplayerdashboard.TeamPlayerDashboard(
            team_id=team_id,
            season='2025-26'
        )
        
        data = dashboard.get_dict()
        
        # Find the PlayersSeasonTotals result set
        players = []
        for rs in data.get('resultSets', []):
            if 'Player' in rs.get('name', ''):
                headers = rs['headers']
                rows = rs.get('rowSet', [])
                
                # Get column indices
                name_idx = headers.index('PLAYER_NAME') if 'PLAYER_NAME' in headers else -1
                gp_idx = headers.index('GP') if 'GP' in headers else -1
                pts_idx = headers.index('PTS') if 'PTS' in headers else -1
                reb_idx = headers.index('REB') if 'REB' in headers else -1
                ast_idx = headers.index('AST') if 'AST' in headers else -1
                stl_idx = headers.index('STL') if 'STL' in headers else -1
                blk_idx = headers.index('BLK') if 'BLK' in headers else -1
                
                for row in rows:
                    gp = row[gp_idx] if gp_idx >= 0 else 1
                    if gp > 0:
                        players.append({
                            'name': row[name_idx] if name_idx >= 0 else 'Unknown',
                            'ppg': round(row[pts_idx] / gp, 1) if pts_idx >= 0 else 0,
                            'rpg': round(row[reb_idx] / gp, 1) if reb_idx >= 0 else 0,
                            'apg': round(row[ast_idx] / gp, 1) if ast_idx >= 0 else 0,
                            'spg': round(row[stl_idx] / gp, 1) if stl_idx >= 0 else 0,
                            'bpg': round(row[blk_idx] / gp, 1) if blk_idx >= 0 else 0,
                            'gp': gp
                        })
                break
        
        if not players:
            return jsonify({"leaders": [], "roster": [], "error": "No player data found"}), 404
        
        # Find leaders in each category
        pts_leader = max(players, key=lambda x: x['ppg'])
        reb_leader = max(players, key=lambda x: x['rpg'])
        ast_leader = max(players, key=lambda x: x['apg'])
        
        # Format leader's name (just last name for display)
        def get_last_name(full_name):
            parts = full_name.split()
            return parts[-1] if parts else full_name
        
        leaders = [
            {
                "category": "Points",
                "name": get_last_name(pts_leader['name']),
                "full_name": pts_leader['name'],
                "value": f"{pts_leader['ppg']} PPG"
            },
            {
                "category": "Rebounds",
                "name": get_last_name(reb_leader['name']),
                "full_name": reb_leader['name'],
                "value": f"{reb_leader['rpg']} RPG"
            },
            {
                "category": "Assists",
                "name": get_last_name(ast_leader['name']),
                "full_name": ast_leader['name'],
                "value": f"{ast_leader['apg']} APG"
            }
        ]
        
        # Sort roster by PPG for the top 5 players
        roster = sorted(players, key=lambda x: x['ppg'], reverse=True)[:5]
        
        return jsonify({
            "leaders": leaders,
            "roster": roster,
            "team_id": team_id
        })
        
    except Exception as e:
        print(f"Error fetching team leaders: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"leaders": [], "roster": [], "error": str(e)}), 500

def _format_pct(value):
    if value is None:
        return 0.0
    if value <= 1.1:
        return round(value * 100, 1)
    return round(value, 1)

def _get_numeric(source, col, default=0.0):
    if not col:
        return default
    value = source.get(col) if isinstance(source, dict) else source[col]
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return default
    try:
        return float(value)
    except (TypeError, ValueError):
        return default

def _build_team_rankings(season):
    name_to_abbr = _build_team_abbr_map()
    base_stats = leaguedashteamstats.LeagueDashTeamStats(
        season=season,
        per_mode_detailed='PerGame',
        measure_type_detailed_defense='Base',
        season_type_all_star='Regular Season',
        league_id_nullable='00'
    )
    opp_stats = leaguedashteamstats.LeagueDashTeamStats(
        season=season,
        per_mode_detailed='PerGame',
        measure_type_detailed_defense='Opponent',
        season_type_all_star='Regular Season',
        league_id_nullable='00'
    )

    df_base = _extract_team_stats_frame(base_stats)
    df_opp = _extract_team_stats_frame(opp_stats)

    base_cols = df_base.columns
    opp_cols = df_opp.columns

    team_id_col = _pick_column(base_cols, ['TEAM_ID'])
    team_abbr_col = _pick_column(base_cols, ['TEAM_ABBREVIATION'])
    team_name_col = _pick_column(base_cols, ['TEAM_NAME'])
    wins_col = _pick_column(base_cols, ['W'])
    losses_col = _pick_column(base_cols, ['L'])

    pts_col = _pick_column(base_cols, ['PTS', 'PTS_PG'])
    fg_pct_col = _pick_column(base_cols, ['FG_PCT'])
    fg3_pct_col = _pick_column(base_cols, ['FG3_PCT'])
    ft_pct_col = _pick_column(base_cols, ['FT_PCT'])
    ast_col = _pick_column(base_cols, ['AST'])
    tov_col = _pick_column(base_cols, ['TOV'])
    blk_col = _pick_column(base_cols, ['BLK'])
    stl_col = _pick_column(base_cols, ['STL'])
    reb_col = _pick_column(base_cols, ['REB'])

    opp_team_id_col = _pick_column(opp_cols, ['TEAM_ID'])
    opp_team_abbr_col = _pick_column(opp_cols, ['TEAM_ABBREVIATION'])
    opp_pts_col = _pick_column(opp_cols, ['OPP_PTS', 'PTS', 'PTS_PG'])
    opp_fg_pct_col = _pick_column(opp_cols, ['OPP_FG_PCT', 'FG_PCT'])
    opp_fg3_pct_col = _pick_column(opp_cols, ['OPP_FG3_PCT', 'FG3_PCT'])

    if not all([pts_col, fg_pct_col, fg3_pct_col, ft_pct_col, ast_col, tov_col, blk_col, stl_col, reb_col]):
        raise ValueError(f"Missing required base stat columns from NBA stats response. Columns: {list(base_cols)}")
    if not all([opp_pts_col, opp_fg_pct_col, opp_fg3_pct_col]):
        raise ValueError(f"Missing required opponent stat columns from NBA stats response. Columns: {list(opp_cols)}")

    df_base['PTS_RANK'] = df_base[pts_col].rank(ascending=False, method='min').astype(int)
    df_base['FG_PCT_RANK'] = df_base[fg_pct_col].rank(ascending=False, method='min').astype(int)
    df_base['FG3_PCT_RANK'] = df_base[fg3_pct_col].rank(ascending=False, method='min').astype(int)
    df_base['FT_PCT_RANK'] = df_base[ft_pct_col].rank(ascending=False, method='min').astype(int)
    df_base['AST_RANK'] = df_base[ast_col].rank(ascending=False, method='min').astype(int)
    df_base['TOV_RANK'] = df_base[tov_col].rank(ascending=True, method='min').astype(int)
    df_base['BLK_RANK'] = df_base[blk_col].rank(ascending=False, method='min').astype(int)
    df_base['STL_RANK'] = df_base[stl_col].rank(ascending=False, method='min').astype(int)
    df_base['REB_RANK'] = df_base[reb_col].rank(ascending=False, method='min').astype(int)

    df_opp['OPP_PTS_RANK'] = df_opp[opp_pts_col].rank(ascending=True, method='min').astype(int)
    df_opp['OPP_FG_PCT_RANK'] = df_opp[opp_fg_pct_col].rank(ascending=True, method='min').astype(int)
    df_opp['OPP_FG3_PCT_RANK'] = df_opp[opp_fg3_pct_col].rank(ascending=True, method='min').astype(int)

    opp_by_team_id = {}
    opp_by_team_abbr = {}
    if opp_team_id_col:
        opp_by_team_id = df_opp.set_index(opp_team_id_col).to_dict(orient='index')
    if opp_team_abbr_col:
        opp_by_team_abbr = df_opp.set_index(opp_team_abbr_col).to_dict(orient='index')

    teams_data = {}
    for _, row in df_base.iterrows():
        team_id = int(row[team_id_col]) if team_id_col and not pd.isna(row[team_id_col]) else None
        team_name = row[team_name_col] if team_name_col else None
        if team_abbr_col:
            team_abbr = row[team_abbr_col]
        else:
            team_abbr = name_to_abbr.get(_normalize_team_name(team_name), team_name)
        opp_row = None
        if team_id is not None and team_id in opp_by_team_id:
            opp_row = opp_by_team_id[team_id]
        elif team_abbr in opp_by_team_abbr:
            opp_row = opp_by_team_abbr[team_abbr]
        else:
            opp_row = {}

        teams_data[team_abbr] = {
            'teamId': team_id,
            'teamName': team_name if team_name else team_abbr,
            'teamAbbr': team_abbr,
            'wins': int(row[wins_col]) if wins_col else 0,
            'losses': int(row[losses_col]) if losses_col else 0,
            'offense': {
                'ppg': round(_get_numeric(row, pts_col), 1),
                'ppgRank': _format_rank(row['PTS_RANK']),
                'fgPct': _format_pct(_get_numeric(row, fg_pct_col)),
                'fgPctRank': _format_rank(row['FG_PCT_RANK']),
                'fg3Pct': _format_pct(_get_numeric(row, fg3_pct_col)),
                'fg3PctRank': _format_rank(row['FG3_PCT_RANK']),
                'ftPct': _format_pct(_get_numeric(row, ft_pct_col)),
                'ftPctRank': _format_rank(row['FT_PCT_RANK']),
                'ast': round(_get_numeric(row, ast_col), 1),
                'astRank': _format_rank(row['AST_RANK']),
                'to': round(_get_numeric(row, tov_col), 1),
                'toRank': _format_rank(row['TOV_RANK'])
            },
            'defense': {
                'oppg': round(_get_numeric(opp_row, opp_pts_col), 1),
                'oppgRank': _format_rank(opp_row.get('OPP_PTS_RANK', 0)),
                'ofgPct': _format_pct(_get_numeric(opp_row, opp_fg_pct_col)),
                'ofgPctRank': _format_rank(opp_row.get('OPP_FG_PCT_RANK', 0)),
                'o3fgPct': _format_pct(_get_numeric(opp_row, opp_fg3_pct_col)),
                'o3fgPctRank': _format_rank(opp_row.get('OPP_FG3_PCT_RANK', 0)),
                'blk': round(_get_numeric(row, blk_col), 1),
                'blkRank': _format_rank(row['BLK_RANK']),
                'stl': round(_get_numeric(row, stl_col), 1),
                'stlRank': _format_rank(row['STL_RANK']),
                'reb': round(_get_numeric(row, reb_col), 1),
                'rebRank': _format_rank(row['REB_RANK'])
            }
        }

    return {
        'lastUpdated': datetime.utcnow().isoformat() + 'Z',
        'season': season,
        'teams': teams_data
    }

@app.route('/team-rankings', methods=['GET'])
def get_team_rankings():
    season = request.args.get('season', DEFAULT_SEASON)
    now = time.time()
    cached = team_rankings_cache.get(season)
    if cached and now - cached['timestamp'] < TEAM_RANKINGS_TTL:
        return jsonify(cached['data'])

    try:
        data = _build_team_rankings(season)
        team_rankings_cache[season] = {"timestamp": now, "data": data}
        return jsonify(data)
    except Exception as e:
        print(f"Error fetching team rankings: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"teams": {}, "error": str(e)}), 500

@app.route('/team-differentials/refresh', methods=['POST'])
def refresh_team_differentials():
    try:
        output = generate_team_differentials()
        return jsonify({"status": "ok", "output": output})
    except Exception as e:
        print(f"Error refreshing team differentials: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "error": str(e)}), 500

@app.route('/players/<int:player_id>/gamelog', methods=['GET'])
def get_player_gamelog(player_id):
    try:
        limit = request.args.get('limit', 5, type=int)

        global last_request_time
        now = time.time()
        if now - last_request_time < MIN_REQUEST_INTERVAL:
            time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
        last_request_time = time.time()

        log = playergamelog.PlayerGameLog(player_id=player_id)
        data = log.get_dict()

        games = []
        if 'resultSets' in data and len(data['resultSets']) > 0:
            headers = data['resultSets'][0]['headers']
            rows = data['resultSets'][0]['rowSet']

            def idx(col):
                try:
                    return headers.index(col)
                except ValueError:
                    return -1

            game_id_idx = idx('Game_ID')
            game_date_idx = idx('GAME_DATE')
            matchup_idx = idx('MATCHUP')
            wl_idx = idx('WL')
            min_idx = idx('MIN')
            pts_idx = idx('PTS')
            reb_idx = idx('REB')
            ast_idx = idx('AST')
            stl_idx = idx('STL')
            blk_idx = idx('BLK')
            fgm_idx = idx('FGM')
            fga_idx = idx('FGA')
            fg_pct_idx = idx('FG_PCT')

            for row in rows[:limit]:
                games.append({
                    "game_id": row[game_id_idx] if game_id_idx >= 0 else None,
                    "game_date": row[game_date_idx] if game_date_idx >= 0 else None,
                    "matchup": row[matchup_idx] if matchup_idx >= 0 else None,
                    "wl": row[wl_idx] if wl_idx >= 0 else None,
                    "min": row[min_idx] if min_idx >= 0 else None,
                    "pts": row[pts_idx] if pts_idx >= 0 else None,
                    "reb": row[reb_idx] if reb_idx >= 0 else None,
                    "ast": row[ast_idx] if ast_idx >= 0 else None,
                    "stl": row[stl_idx] if stl_idx >= 0 else None,
                    "blk": row[blk_idx] if blk_idx >= 0 else None,
                    "fgm": row[fgm_idx] if fgm_idx >= 0 else None,
                    "fga": row[fga_idx] if fga_idx >= 0 else None,
                    "fg_pct": row[fg_pct_idx] if fg_pct_idx >= 0 else None
                })

        return jsonify({"player_id": player_id, "games": games, "count": len(games)})
    except Exception as e:
        print(f"Error fetching player gamelog: {e}")
        return jsonify({"player_id": player_id, "games": [], "error": str(e)}), 500

# Constants for usage rate calculations
FTA_FACTOR = 0.44  # Standard NBA free throw possession factor

def _get_team_season_totals(team_id, season):
    """
    Fetch team season totals for usage rate calculations.
    Uses caching to avoid rate limiting.
    """
    cache_key = f"{team_id}_{season}"
    now = time.time()
    
    # Check cache first
    if cache_key in team_totals_cache:
        cached = team_totals_cache[cache_key]
        if now - cached['timestamp'] < TEAM_TOTALS_TTL:
            return cached['data']
    
    # Rate limiting
    global last_request_time
    if now - last_request_time < MIN_REQUEST_INTERVAL:
        time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
    last_request_time = time.time()
    
    try:
        # Fetch team dashboard stats
        dashboard = teamdashboardbygeneralsplits.TeamDashboardByGeneralSplits(
            team_id=team_id,
            season=season,
            per_mode_detailed='Totals',
            season_type_all_star='Regular Season'
        )
        data = dashboard.get_dict()
        
        # Find Overall team stats
        for rs in data.get('resultSets', []):
            if rs.get('name') == 'OverallTeamDashboard':
                headers = rs.get('headers', [])
                rows = rs.get('rowSet', [])
                
                if rows:
                    row = rows[0]
                    
                    def get_idx(col):
                        try:
                            return headers.index(col)
                        except ValueError:
                            return -1
                    
                    totals = {
                        'team_min': row[get_idx('MIN')] if get_idx('MIN') >= 0 else 0,
                        'team_fga': row[get_idx('FGA')] if get_idx('FGA') >= 0 else 0,
                        'team_fta': row[get_idx('FTA')] if get_idx('FTA') >= 0 else 0,
                        'team_tov': row[get_idx('TOV')] if get_idx('TOV') >= 0 else 0,
                        'team_fgm': row[get_idx('FGM')] if get_idx('FGM') >= 0 else 0,
                        'team_reb': row[get_idx('REB')] if get_idx('REB') >= 0 else 0,
                        'team_oreb': row[get_idx('OREB')] if get_idx('OREB') >= 0 else 0,
                        'team_dreb': row[get_idx('DREB')] if get_idx('DREB') >= 0 else 0,
                        'games_played': row[get_idx('GP')] if get_idx('GP') >= 0 else 0
                    }
                    
                    # Cache the result
                    team_totals_cache[cache_key] = {'timestamp': now, 'data': totals}
                    return totals
        
        return None
    except Exception as e:
        print(f"Error fetching team totals for {team_id}: {e}")
        return None

def _get_player_season_totals(player_id, season):
    """
    Fetch player season totals for usage rate calculations.
    """
    global last_request_time
    now = time.time()
    if now - last_request_time < MIN_REQUEST_INTERVAL:
        time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
    last_request_time = time.time()
    
    try:
        career = playercareerstats.PlayerCareerStats(player_id=player_id, per_mode36='Totals')
        data = career.get_dict()
        
        # Find current season stats
        for rs in data.get('resultSets', []):
            if rs.get('name') == 'SeasonTotalsRegularSeason':
                headers = rs.get('headers', [])
                rows = rs.get('rowSet', [])
                
                def get_idx(col):
                    try:
                        return headers.index(col)
                    except ValueError:
                        return -1
                
                season_idx = get_idx('SEASON_ID')
                team_id_idx = get_idx('TEAM_ID')
                
                # Find the matching season (most recent if not exact match)
                target_row = None
                for row in reversed(rows):  # Most recent seasons are at the end
                    if season_idx >= 0:
                        row_season = row[season_idx]
                        # Season format in API is like "2025-26" or "2024-25"
                        if row_season == season or row_season.replace('-', '-') == season:
                            target_row = row
                            break
                
                # Fallback to most recent season
                if not target_row and rows:
                    target_row = rows[-1]
                
                if target_row:
                    return {
                        'team_id': target_row[team_id_idx] if team_id_idx >= 0 else None,
                        'min': target_row[get_idx('MIN')] if get_idx('MIN') >= 0 else 0,
                        'fga': target_row[get_idx('FGA')] if get_idx('FGA') >= 0 else 0,
                        'fta': target_row[get_idx('FTA')] if get_idx('FTA') >= 0 else 0,
                        'tov': target_row[get_idx('TOV')] if get_idx('TOV') >= 0 else 0,
                        'ast': target_row[get_idx('AST')] if get_idx('AST') >= 0 else 0,
                        'reb': target_row[get_idx('REB')] if get_idx('REB') >= 0 else 0,
                        'fgm': target_row[get_idx('FGM')] if get_idx('FGM') >= 0 else 0,
                        'gp': target_row[get_idx('GP')] if get_idx('GP') >= 0 else 0
                    }
        
        return None
    except Exception as e:
        print(f"Error fetching player season totals for {player_id}: {e}")
        return None

def _calculate_usage_rates(player_stats, team_stats):
    """
    Calculate NBA-standard usage rates.
    Returns dict with usg_pct, ast_pct, reb_pct, tov_pct (all as percentages 0-100).
    """
    result = {
        'usg_pct': None,
        'ast_pct': None,
        'reb_pct': None,
        'tov_pct': None
    }
    
    if not player_stats or not team_stats:
        return result
    
    # Player stats
    mp = float(player_stats.get('min', 0) or 0)
    fga = float(player_stats.get('fga', 0) or 0)
    fta = float(player_stats.get('fta', 0) or 0)
    tov = float(player_stats.get('tov', 0) or 0)
    ast = float(player_stats.get('ast', 0) or 0)
    reb = float(player_stats.get('reb', 0) or 0)
    fgm = float(player_stats.get('fgm', 0) or 0)
    
    # Team stats
    tm = float(team_stats.get('team_min', 0) or 0)
    tfga = float(team_stats.get('team_fga', 0) or 0)
    tfta = float(team_stats.get('team_fta', 0) or 0)
    ttov = float(team_stats.get('team_tov', 0) or 0)
    tfgm = float(team_stats.get('team_fgm', 0) or 0)
    treb = float(team_stats.get('team_reb', 0) or 0)
    
    # Estimate opponent rebounds as ~44% of total available rebounds (league average)
    # This is a reasonable approximation when on-court splits aren't available
    opp_reb = treb * 0.79  # Opponent gets roughly 44/(44+56) of remaining rebounds
    
    # Edge case: player didn't play
    if mp <= 0:
        return result
    
    # Team factor (team minutes / 5 players)
    team_factor = tm / 5.0 if tm > 0 else 0
    
    # USG% = 100 * ((FGA + 0.44*FTA + TOV) * (TM/5)) / (MP * (TFGA + 0.44*TFTA + TTOV))
    player_possessions = fga + FTA_FACTOR * fta + tov
    team_possessions = tfga + FTA_FACTOR * tfta + ttov
    
    if team_possessions > 0 and mp > 0:
        usg_denom = mp * team_possessions
        if usg_denom > 0:
            usg_pct = 100 * (player_possessions * team_factor) / usg_denom
            result['usg_pct'] = round(min(max(usg_pct, 0), 100), 1)
    
    # AST% = 100 * AST / (((MP / (Tm_MP / 5)) * Tm_FG) - FG)
    # This is the official Basketball Reference formula
    if team_factor > 0 and mp > 0:
        teammate_fgm_while_on_court = ((mp / team_factor) * tfgm) - fgm
        if teammate_fgm_while_on_court > 0:
            ast_pct = 100 * ast / teammate_fgm_while_on_court
            result['ast_pct'] = round(min(max(ast_pct, 0), 100), 1)
    
    # REB% = 100 * (REB * (TM/5)) / (MP * (TREB + OPPREB))
    total_available_reb = treb + opp_reb
    if total_available_reb > 0 and mp > 0:
        reb_denom = mp * total_available_reb
        if reb_denom > 0:
            reb_pct = 100 * (reb * team_factor) / reb_denom
            result['reb_pct'] = round(min(max(reb_pct, 0), 100), 1)
    
    # TOV% = 100 * TOV / (FGA + 0.44*FTA + TOV) - player only, no team stats needed
    if player_possessions > 0:
        tov_pct = 100 * tov / player_possessions
        result['tov_pct'] = round(min(max(tov_pct, 0), 100), 1)
    
    return result

@app.route('/players/<int:player_id>/usage-rates', methods=['GET'])
def get_player_usage_rates(player_id):
    """
    Get usage rates (USG%, AST%, REB%, TOV%) for a player.
    Uses NBA-standard formulas with season totals.
    """
    try:
        season = request.args.get('season', DEFAULT_SEASON)
        
        # Fetch player season totals
        player_stats = _get_player_season_totals(player_id, season)
        
        if not player_stats:
            return jsonify({
                "player_id": player_id,
                "error": "Player stats not found",
                "usg_pct": None,
                "ast_pct": None,
                "reb_pct": None,
                "tov_pct": None,
                "data_source": "none",
                "estimated": True
            }), 404
        
        # Fetch team season totals
        team_id = player_stats.get('team_id')
        team_stats = None
        data_source = "season_totals"
        estimated = False
        
        if team_id:
            team_stats = _get_team_season_totals(team_id, season)
        
        if not team_stats:
            # Fallback: estimate team totals from player stats
            # Use league average estimates
            gp = player_stats.get('gp', 1) or 1
            team_stats = {
                'team_min': 240 * gp,  # 48 min * 5 players * games
                'team_fga': 88 * gp,   # League avg ~88 FGA/game
                'team_fta': 22 * gp,   # League avg ~22 FTA/game
                'team_tov': 14 * gp,   # League avg ~14 TOV/game
                'team_fgm': 41 * gp,   # League avg ~41 FGM/game
                'team_reb': 44 * gp    # League avg ~44 REB/game
            }
            data_source = "estimated"
            estimated = True
        
        # Calculate usage rates
        usage_rates = _calculate_usage_rates(player_stats, team_stats)
        
        return jsonify({
            "player_id": player_id,
            "season": season,
            "usg_pct": usage_rates['usg_pct'],
            "ast_pct": usage_rates['ast_pct'],
            "reb_pct": usage_rates['reb_pct'],
            "tov_pct": usage_rates['tov_pct'],
            "data_source": data_source,
            "estimated": estimated,
            "player_stats": {
                "min": player_stats.get('min'),
                "fga": player_stats.get('fga'),
                "fta": player_stats.get('fta'),
                "tov": player_stats.get('tov'),
                "ast": player_stats.get('ast'),
                "reb": player_stats.get('reb'),
                "fgm": player_stats.get('fgm')
            }
        })
        
    except Exception as e:
        print(f"Error calculating usage rates for player {player_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "player_id": player_id,
            "error": str(e),
            "usg_pct": None,
            "ast_pct": None,
            "reb_pct": None,
            "tov_pct": None,
            "data_source": "error",
            "estimated": True
        }), 500


# =============================================================================
# SCHEDULED DATA REFRESH
# =============================================================================

# Path to static data files (relative to this script)
STATIC_DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'resources', 'static', 'data')

def refresh_standings_data():
    """
    Fetch current standings from NBA API and update the static JSON file.
    This runs on startup and is scheduled for midnight daily.
    """
    print(f"[{datetime.now()}] Starting standings data refresh...")
    
    try:
        # Rate limiting
        global last_request_time
        now = time.time()
        if now - last_request_time < MIN_REQUEST_INTERVAL:
            time.sleep(MIN_REQUEST_INTERVAL - (now - last_request_time))
        last_request_time = time.time()
        
        # Fetch current standings
        standings = leaguestandings.LeagueStandings(season='2025-26')
        data = standings.get_dict()
        
        east = []
        west = []
        
        headers = data['resultSets'][0]['headers']
        rows = data['resultSets'][0]['rowSet']
        
        def get_val_safe(row, col):
            try:
                idx = headers.index(col)
                return row[idx]
            except ValueError:
                return None

        for row in rows:
            conf = get_val_safe(row, 'Conference')
            city = get_val_safe(row, 'TeamCity')
            name = get_val_safe(row, 'TeamName')
            full_name = f"{city} {name}"
            abbrev = name[:3].upper()
            
            team_obj = {
                "id": get_val_safe(row, 'TeamID'),
                "name": name,
                "fullName": full_name,
                "abbreviation": abbrev, 
                "wins": get_val_safe(row, 'WINS'),
                "losses": get_val_safe(row, 'LOSSES'),
                "last10": get_val_safe(row, 'L10'),
                "streak": get_val_safe(row, 'strCurrentStreak') or "N/A"
            }
            
            if conf == 'East':
                east.append(team_obj)
            elif conf == 'West':
                west.append(team_obj)
        
        # Sort by wins descending
        east.sort(key=lambda x: (x['wins'] or 0), reverse=True)
        west.sort(key=lambda x: (x['wins'] or 0), reverse=True)
        
        # Save to static JSON file
        standings_data = {
            "east": east,
            "west": west,
            "lastUpdated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Ensure directory exists
        os.makedirs(STATIC_DATA_DIR, exist_ok=True)
        standings_file = os.path.join(STATIC_DATA_DIR, 'standings.json')
        
        with open(standings_file, 'w') as f:
            json.dump(standings_data, f, indent=2)
        
        print(f"[{datetime.now()}] ✓ Standings refreshed successfully! ({len(east)} East, {len(west)} West teams)")
        return True
        
    except Exception as e:
        print(f"[{datetime.now()}] ✗ Error refreshing standings: {e}")
        return False


def run_startup_refresh():
    """Run data refresh tasks on startup."""
    print("\n" + "="*60)
    print("RUNNING STARTUP DATA REFRESH")
    print("="*60)
    
    # Refresh standings
    refresh_standings_data()
    
    print("="*60 + "\n")


# Initialize scheduler for nightly refresh
scheduler = BackgroundScheduler()

def init_scheduler():
    """Initialize the background scheduler for nightly data refresh."""
    # Schedule standings refresh at midnight (00:00) every day
    scheduler.add_job(
        func=refresh_standings_data,
        trigger=CronTrigger(hour=0, minute=0),  # 12:00 AM
        id='nightly_standings_refresh',
        name='Nightly standings data refresh',
        replace_existing=True
    )
    
    scheduler.start()
    print(f"[{datetime.now()}] ✓ Scheduler initialized - standings will refresh nightly at 12:00 AM")
    
    # Shut down scheduler when exiting
    atexit.register(lambda: scheduler.shutdown())


if __name__ == '__main__':
    print("Starting NBA Python Service on port 5001...")
    
    # Run startup data refresh
    run_startup_refresh()
    
    # Initialize nightly scheduler
    init_scheduler()
    
    # Start Flask app
    app.run(host='0.0.0.0', port=5001)
