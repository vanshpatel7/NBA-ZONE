#!/usr/bin/env python3
"""
Generate recent team point differentials (last N games) for My Team page.
Uses NBA stats once during generation and writes static JSON for the frontend.
"""

from nba_api.stats.endpoints import leaguegamefinder, teamgamelog
from nba_api.stats.static import teams
import json
import os
from datetime import datetime, timedelta

SEASON = "2025-26"
SEASON_TYPE = "Regular Season"
GAMES_PER_TEAM = 10
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "resources", "static", "data")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "team_differentials.json")

def _build_opponent_label(matchup):
    if not matchup:
        return ""
    parts = matchup.split()
    if len(parts) >= 3:
        marker = parts[1].lower().replace(".", "")
        opp = parts[2]
        if marker == "vs":
            return f"vs {opp}"
        if marker == "@":
            return f"@ {opp}"
        return f"{marker.upper()} {opp}"
    return matchup

def _get_opp_pts(row, columns):
    if "OPP_PTS" in columns:
        return float(row["OPP_PTS"])
    if "PLUS_MINUS" in columns and "PTS" in columns:
        return float(row["PTS"]) - float(row["PLUS_MINUS"])
    return None

def _get_recent_rows(df):
    if "GAME_DATE" in df.columns:
        return df.sort_values("GAME_DATE", ascending=False).head(GAMES_PER_TEAM)
    return df.head(GAMES_PER_TEAM)

def _build_games_from_frame(df):
    games = []
    if df is None or df.empty:
        return games
    columns = set(df.columns)
    for _, row in _get_recent_rows(df).iterrows():
        pts = float(row["PTS"]) if "PTS" in columns else None
        opp_pts = _get_opp_pts(row, columns)
        if pts is None or opp_pts is None:
            continue
        diff = round(pts - opp_pts)
        games.append({
            "date": row.get("GAME_DATE"),
            "opponent": _build_opponent_label(row.get("MATCHUP")),
            "diff": int(diff),
            "pointsFor": int(round(pts)),
            "pointsAgainst": int(round(opp_pts)),
            "win": row.get("WL") == "W"
        })
    return games

def generate_team_differentials():
    all_teams = teams.get_teams()
    end_date = datetime.now()
    start_date = end_date - timedelta(days=60)
    output = {
        "season": SEASON,
        "seasonType": SEASON_TYPE,
        "gamesPerTeam": GAMES_PER_TEAM,
        "teams": {}
    }

    for team in all_teams:
        team_id = team.get("id")
        abbr = team.get("abbreviation")
        name = team.get("full_name")

        games = []
        try:
            log = teamgamelog.TeamGameLog(
                team_id=team_id,
                season=SEASON,
                season_type_all_star=SEASON_TYPE
            )
            df = log.get_data_frames()[0]
            games = _build_games_from_frame(df)
        except Exception as exc:
            print(f"Failed to fetch game log for {abbr}: {exc}")

        if not games:
            try:
                finder = leaguegamefinder.LeagueGameFinder(
                    team_id_nullable=team_id,
                    season_nullable=SEASON,
                    season_type_nullable=SEASON_TYPE,
                    league_id_nullable="00",
                    date_from_nullable=start_date.strftime('%m/%d/%Y'),
                    date_to_nullable=end_date.strftime('%m/%d/%Y')
                )
                df = finder.get_data_frames()[0]
                games = _build_games_from_frame(df)
            except Exception as exc:
                print(f"Failed to fetch league game finder data for {abbr}: {exc}")

        output["teams"][abbr] = {
            "teamId": team_id,
            "teamName": name,
            "games": games
        }

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Saved differentials to {OUTPUT_FILE}")
    return OUTPUT_FILE

if __name__ == "__main__":
    generate_team_differentials()
