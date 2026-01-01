from flask import Flask, request, jsonify
from nba_api.live.nba.endpoints import scoreboard
from nba_api.stats.endpoints import leaguestandings
import time
import datetime

app = Flask(__name__)

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

if __name__ == '__main__':
    print("Starting NBA Python Service on port 5001...")
    app.run(host='0.0.0.0', port=5001)
