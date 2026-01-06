from flask import Flask, request, jsonify
from flask_cors import CORS
from nba_api.live.nba.endpoints import scoreboard
from nba_api.stats.endpoints import leaguestandings, teamgamelog, leaguegamefinder, teamplayerdashboard, boxscoretraditionalv2, playergamelog
from nba_api.stats.static import teams
from datetime import datetime, timedelta
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Cache / Rate Limiting prevention
last_request_time = 0
MIN_REQUEST_INTERVAL = 1.0  # 1 second between calls to be safe

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
        # Fetch 2024-25 standings
        standings = leaguestandings.LeagueStandings(season='2024-25')
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

if __name__ == '__main__':
    print("Starting NBA Python Service on port 5001...")
    app.run(host='0.0.0.0', port=5001)
