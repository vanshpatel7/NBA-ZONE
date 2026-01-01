# Scrape 2023–24 NBA team per-game (fallback: totals) player stats from Basketball-Reference

import time
import re
import pandas as pd
import requests
from bs4 import BeautifulSoup, Comment

SEASON_END_YEAR = 2024         # 2023–24 season ends in 2024
BASE = "https://www.basketball-reference.com"
LEAGUE_URL = f"{BASE}/leagues/NBA_{SEASON_END_YEAR}.html"
OUT_CSV = "nba_2023_24_players_per_game.csv"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; StatsScraper/1.0; +https://example.com/)"
}

def get_team_urls():
    """Return list of (team_name, team_url) for the season."""
    html = requests.get(LEAGUE_URL, headers=HEADERS, timeout=30).text
    soup = BeautifulSoup(html, "lxml")

    # On league page, team links look like /teams/BOS/2024.html inside the 'Teams' section.
    links = soup.select('a[href^="/teams/"][href$="/%d.html"]' % SEASON_END_YEAR)
    seen = set()
    teams = []
    for a in links:
        href = a.get("href")
        if href and href not in seen:
            seen.add(href)
            team_url = BASE + href
            team_name = a.text.strip()
            # Filter out non-team links (sometimes there are franchise index pages)
            if re.match(r"^/teams/[A-Z]{3}/%d\.html$" % SEASON_END_YEAR, href):
                teams.append((team_name, team_url))
    # Deduplicate while preserving order
    return teams

def read_table_by_id(html_text, table_id):
    """
    Try to read a table (by id) whether it's normal HTML or inside an HTML comment (BBR often comments tables).
    Returns a pandas.DataFrame or None.
    """
    soup = BeautifulSoup(html_text, "lxml")
    # 1) Directly by id
    table = soup.find("table", id=table_id)
    if table is not None:
        dfs = pd.read_html(str(table))
        if dfs:
            return dfs[0]

    # 2) Search inside comments
    for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
        if table_id in comment:
            try:
                dfs = pd.read_html(str(comment))
                # pick the table with the right id if multiple
                for df in dfs:
                    # Heuristic: per-game/totals have 'Rk' and 'Player'
                    if {"Rk", "Player"}.issubset(set(df.columns)):
                        return df
                # fallback to first if nothing matched strictly
                if dfs:
                    return dfs[0]
            except Exception:
                continue
    return None

def clean_player_table(df):
    """Standardize player table: drop header repeats, remove TOT duplicates nuances, clean NaNs."""
    # Drop rows where Player == 'Player' (header repeats)
    if "Player" in df.columns:
        df = df[df["Player"] != "Player"]

    # Remove rows with all NaNs except Player/Rk
    keep_cols = [c for c in df.columns if c not in {"Rk"}]
    if keep_cols:
        df = df.dropna(how="all", subset=keep_cols)

    # Reset index
    return df.reset_index(drop=True)

def scrape_team(team_name, team_url):
    """
    Return (team_name, per_game_df or totals_df) for a single team.
    Preference: per_game; fallback: totals.
    """
    data = requests.get(team_url, headers=HEADERS, timeout=30).text

    # Try per-game first
    per_game = read_table_by_id(data, "per_game")
    if per_game is not None:
        per_game = clean_player_table(per_game)
        per_game["Team"] = team_name
        per_game["SourceTable"] = "per_game"
        return per_game

    # Fallback to totals
    totals = read_table_by_id(data, "totals")
    if totals is not None:
        totals = clean_player_table(totals)
        totals["Team"] = team_name
        totals["SourceTable"] = "totals"
        return totals

    # If neither found, return empty DF to keep pipeline robust
    return pd.DataFrame()

def main():
    teams = get_team_urls()
    all_frames = []

    for idx, (team_name, team_url) in enumerate(teams, 1):
        print(f"[{idx}/{len(teams)}] {team_name}: {team_url}")
        try:
            df = scrape_team(team_name, team_url)
            if not df.empty:
                all_frames.append(df)
        except Exception as e:
            print(f"  -> Skipped {team_name} due to error: {e}")
        time.sleep(3)  # be polite to the server

    if not all_frames:
        print("No data scraped. Check page structure or connectivity.")
        return

    stat_df = pd.concat(all_frames, ignore_index=True)

    # Optional: keep a consistent minimal column order if present
    preferred_cols = [c for c in ["Rk", "Player", "Pos", "Age", "G", "GS", "MP",
                                  "FG", "FGA", "FG%", "3P", "3PA", "3P%", "2P",
                                  "2PA", "2P%", "eFG%", "FT", "FTA", "FT%",
                                  "ORB", "DRB", "TRB", "AST", "STL", "BLK",
                                  "TOV", "PF", "PTS", "Team", "SourceTable"] if c in stat_df.columns]
    stat_df = stat_df[preferred_cols + [c for c in stat_df.columns if c not in preferred_cols]]

    stat_df.to_csv(OUT_CSV, index=False)
    print(f"Saved {len(stat_df)} rows to {OUT_CSV}")

if __name__ == "__main__":
    main()
