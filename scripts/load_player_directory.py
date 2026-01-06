#!/usr/bin/env python3
"""
Load NBA player directory data from nba_api and export to CSV for Postgres import.
"""

import argparse
import csv
import time

from nba_api.stats.endpoints import commonallplayers, commonplayerinfo

HEADSHOT_URL_TEMPLATE = "https://cdn.nba.com/headshots/nba/latest/260x190/{player_id}.png"
MIN_REQUEST_INTERVAL = 0.6


def parse_args():
    parser = argparse.ArgumentParser(description="Export NBA player directory to CSV.")
    parser.add_argument("--season", default="2024-25", help="Season for roster status.")
    parser.add_argument("--output", default="data/player_directory.csv", help="CSV output path.")
    parser.add_argument("--include-inactive", action="store_true", help="Include inactive players.")
    parser.add_argument("--enrich-active", action="store_true",
                        help="Call commonplayerinfo for active players to fill position/bio.")
    return parser.parse_args()


def throttle(last_call_time):
    now = time.time()
    elapsed = now - last_call_time
    if elapsed < MIN_REQUEST_INTERVAL:
        time.sleep(MIN_REQUEST_INTERVAL - elapsed)
    return time.time()


def build_bio(info_row, headers):
    def safe(col):
        try:
            idx = headers.index(col)
            return info_row[idx]
        except ValueError:
            return None

    height = safe("HEIGHT")
    weight = safe("WEIGHT")
    birthdate = safe("BIRTHDATE")
    school = safe("SCHOOL")
    country = safe("COUNTRY")

    parts = []
    if height:
        parts.append(f"Height: {height}")
    if weight:
        parts.append(f"Weight: {weight}")
    if birthdate:
        parts.append(f"Birthdate: {birthdate}")
    if school:
        parts.append(f"School: {school}")
    if country:
        parts.append(f"Country: {country}")

    return ", ".join(parts) if parts else ""


def main():
    args = parse_args()
    last_call_time = 0

    roster_status = 1 if not args.include_inactive else 0
    last_call_time = throttle(last_call_time)
    all_players = commonallplayers.CommonAllPlayers(
        is_only_current_season=roster_status,
        season=args.season
    ).get_dict()

    headers = all_players["resultSets"][0]["headers"]
    rows = all_players["resultSets"][0]["rowSet"]

    idx_id = headers.index("PERSON_ID")
    idx_full = headers.index("DISPLAY_FIRST_LAST")
    idx_last_first = headers.index("DISPLAY_LAST_COMMA_FIRST")
    idx_team_id = headers.index("TEAM_ID")
    idx_team_abbr = headers.index("TEAM_ABBREVIATION")
    idx_active = headers.index("ROSTERSTATUS")

    with open(args.output, "w", newline="") as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow([
            "nba_player_id",
            "first_name",
            "last_name",
            "full_name",
            "team_id",
            "team_abbr",
            "position",
            "bio",
            "headshot_url",
            "active"
        ])

        for row in rows:
            player_id = row[idx_id]
            full_name = row[idx_full]
            last_first = row[idx_last_first]
            team_id = row[idx_team_id]
            team_abbr = row[idx_team_abbr]
            active_flag = row[idx_active]

            if last_first and "," in last_first:
                last_name, first_name = [part.strip() for part in last_first.split(",", 1)]
            else:
                parts = full_name.split()
                first_name = parts[0] if parts else ""
                last_name = parts[-1] if parts else ""

            position = ""
            bio = ""

            if args.enrich_active and active_flag == 1:
                last_call_time = throttle(last_call_time)
                info = commonplayerinfo.CommonPlayerInfo(player_id=player_id).get_dict()
                info_rs = info.get("resultSets", [{}])[0]
                info_headers = info_rs.get("headers", [])
                info_rows = info_rs.get("rowSet", [])
                if info_rows:
                    info_row = info_rows[0]

                    try:
                        pos_idx = info_headers.index("POSITION")
                        position = info_row[pos_idx]
                    except ValueError:
                        position = ""

                    bio = build_bio(info_row, info_headers)

                    try:
                        team_id_idx = info_headers.index("TEAM_ID")
                        team_abbr_idx = info_headers.index("TEAM_ABBREVIATION")
                        team_id = info_row[team_id_idx]
                        team_abbr = info_row[team_abbr_idx]
                    except ValueError:
                        pass

            headshot_url = HEADSHOT_URL_TEMPLATE.format(player_id=player_id)

            writer.writerow([
                player_id,
                first_name,
                last_name,
                full_name,
                team_id,
                team_abbr,
                position,
                bio,
                headshot_url,
                bool(active_flag)
            ])

    print(f"Saved player directory to {args.output}")


if __name__ == "__main__":
    main()
