#!/usr/bin/env python3
"""
Generate NBA team stats JSON data for the My Team page.
This script fetches live data from the NBA API and saves it as static JSON.
"""

from nba_api.stats.endpoints import leaguegamefinder, commonteamroster, teamplayerdashboard
import json
import os
import time

# All 30 NBA teams with their IDs
NBA_TEAMS = {
    'ATL': 1610612737, 'BOS': 1610612738, 'BKN': 1610612751, 'CHA': 1610612766,
    'CHI': 1610612741, 'CLE': 1610612739, 'DAL': 1610612742, 'DEN': 1610612743,
    'DET': 1610612765, 'GSW': 1610612744, 'HOU': 1610612745, 'IND': 1610612754,
    'LAC': 1610612746, 'LAL': 1610612747, 'MEM': 1610612763, 'MIA': 1610612748,
    'MIL': 1610612749, 'MIN': 1610612750, 'NOP': 1610612740, 'NYK': 1610612752,
    'OKC': 1610612760, 'ORL': 1610612753, 'PHI': 1610612755, 'PHX': 1610612756,
    'POR': 1610612757, 'SAC': 1610612758, 'SAS': 1610612759, 'TOR': 1610612761,
    'UTA': 1610612762, 'WAS': 1610612764
}

SEASON = '2024-25'

def get_recent_games(team_id, limit=5):
    """Fetch recent games for a team."""
    try:
        finder = leaguegamefinder.LeagueGameFinder(
            team_id_nullable=team_id, 
            season_nullable=SEASON
        )
        data = finder.get_dict()
        result_sets = data.get('resultSets', [])
        
        if not result_sets:
            return []
            
        headers = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])[:limit]
        
        # Get column indices
        date_idx = headers.index('GAME_DATE') if 'GAME_DATE' in headers else -1
        matchup_idx = headers.index('MATCHUP') if 'MATCHUP' in headers else -1
        wl_idx = headers.index('WL') if 'WL' in headers else -1
        pts_idx = headers.index('PTS') if 'PTS' in headers else -1
        
        games = []
        for row in rows:
            game_date = row[date_idx] if date_idx >= 0 else ''
            matchup = row[matchup_idx] if matchup_idx >= 0 else ''
            wl = row[wl_idx] if wl_idx >= 0 else ''
            pts = row[pts_idx] if pts_idx >= 0 else 0
            
            # Parse matchup to get opponent and home/away
            is_home = 'vs.' in matchup
            opp_abbr = matchup.split(' ')[-1] if matchup else 'OPP'
            
            games.append({
                'date': game_date,
                'opponent': f"{'vs' if is_home else 'at'} {opp_abbr}",
                'result': f"{'W' if wl == 'W' else 'L'} {pts}",
                'win': wl == 'W'
            })
        
        return games
    except Exception as e:
        print(f"Error fetching games for team {team_id}: {e}")
        return []

def get_roster(team_id):
    """Fetch roster for a team."""
    try:
        roster = commonteamroster.CommonTeamRoster(team_id=team_id, season=SEASON)
        data = roster.get_dict()
        result_sets = data.get('resultSets', [])
        
        if not result_sets:
            return []
            
        headers = result_sets[0].get('headers', [])
        rows = result_sets[0].get('rowSet', [])[:10]  # Top 10 players
        
        # Get column indices
        player_idx = headers.index('PLAYER') if 'PLAYER' in headers else -1
        pos_idx = headers.index('POSITION') if 'POSITION' in headers else -1
        
        players = []
        for row in rows:
            player_name = row[player_idx] if player_idx >= 0 else 'Unknown'
            position = row[pos_idx] if pos_idx >= 0 else 'N/A'
            
            players.append({
                'name': player_name,
                'pos': position[:2] if position else 'N/A',  # Shorten position
                'ppg': 0,  # Will be filled by player stats
                'rpg': 0,
                'apg': 0
            })
        
        return players
    except Exception as e:
        print(f"Error fetching roster for team {team_id}: {e}")
        return []

def get_player_stats(team_id):
    """Fetch player stats for a team."""
    try:
        dashboard = teamplayerdashboard.TeamPlayerDashboard(team_id=team_id, season=SEASON)
        data = dashboard.get_dict()
        result_sets = data.get('resultSets', [])
        
        stats = {}
        for rs in result_sets:
            name = rs.get('name', '')
            if 'Player' in name:
                headers = rs.get('headers', [])
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
                    player_name = row[name_idx] if name_idx >= 0 else ''
                    gp = row[gp_idx] if gp_idx >= 0 else 1
                    if gp == 0:
                        gp = 1
                    
                    # Calculate per-game stats
                    pts_total = row[pts_idx] if pts_idx >= 0 else 0
                    reb_total = row[reb_idx] if reb_idx >= 0 else 0
                    ast_total = row[ast_idx] if ast_idx >= 0 else 0
                    stl_total = row[stl_idx] if stl_idx >= 0 else 0
                    blk_total = row[blk_idx] if blk_idx >= 0 else 0
                    
                    stats[player_name] = {
                        'ppg': round(pts_total / gp, 1),
                        'rpg': round(reb_total / gp, 1),
                        'apg': round(ast_total / gp, 1),
                        'spg': round(stl_total / gp, 1),
                        'bpg': round(blk_total / gp, 1)
                    }
                break
        
        return stats
    except Exception as e:
        print(f"Error fetching player stats for team {team_id}: {e}")
        return {}

def generate_team_data(abbr, team_id):
    """Generate complete data for a single team."""
    print(f"Fetching data for {abbr}...")
    
    # Get recent games
    games = get_recent_games(team_id)
    time.sleep(0.5)  # Rate limiting
    
    # Get roster
    roster = get_roster(team_id)
    time.sleep(0.5)
    
    # Get player stats
    player_stats = get_player_stats(team_id)
    time.sleep(0.5)
    
    # Merge stats into roster
    for player in roster:
        if player['name'] in player_stats:
            stats = player_stats[player['name']]
            player['ppg'] = stats['ppg']
            player['rpg'] = stats['rpg']
            player['apg'] = stats['apg']
    
    # Sort roster by PPG (top scorers first)
    roster.sort(key=lambda x: x['ppg'], reverse=True)
    
    # Generate leaders based on stats
    leaders = []
    if roster:
        # Points leader
        pts_leader = max(roster, key=lambda x: x['ppg'])
        leaders.append({
            'category': 'Points',
            'name': pts_leader['name'].split()[-1],  # Last name
            'value': f"{pts_leader['ppg']} PPG"
        })
        
        # Rebounds leader
        reb_leader = max(roster, key=lambda x: x['rpg'])
        leaders.append({
            'category': 'Rebounds',
            'name': reb_leader['name'].split()[-1],
            'value': f"{reb_leader['rpg']} RPG"
        })
        
        # Assists leader
        ast_leader = max(roster, key=lambda x: x['apg'])
        leaders.append({
            'category': 'Assists',
            'name': ast_leader['name'].split()[-1],
            'value': f"{ast_leader['apg']} APG"
        })
    
    return {
        'lastGames': games[:5],
        'leaders': leaders,
        'roster': roster[:5]  # Top 5 players by PPG
    }

def main():
    output_dir = 'src/main/resources/static/data'
    os.makedirs(output_dir, exist_ok=True)
    
    all_team_stats = {}
    
    # Generate data for all teams (or just a subset for testing)
    for abbr, team_id in NBA_TEAMS.items():
        try:
            team_data = generate_team_data(abbr, team_id)
            all_team_stats[abbr] = team_data
            print(f"  ✓ {abbr}: {len(team_data['lastGames'])} games, {len(team_data['roster'])} players")
        except Exception as e:
            print(f"  ✗ {abbr}: Error - {e}")
            all_team_stats[abbr] = {'lastGames': [], 'leaders': [], 'roster': []}
    
    # Save to JSON file
    output_file = os.path.join(output_dir, 'team_stats.json')
    with open(output_file, 'w') as f:
        json.dump(all_team_stats, f, indent=2)
    
    print(f"\nSaved team stats to {output_file}")

if __name__ == '__main__':
    main()
