#!/usr/bin/env python3
"""
Generate NBA team offense/defense rankings JSON data.
Fetches real stats from NBA API and calculates league rankings for each stat category.
"""

from nba_api.stats.endpoints import leaguedashteamstats
import json
import os
from datetime import datetime
import pandas as pd

SEASON = '2025-26'
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'resources', 'static', 'data')

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
    from nba_api.stats.static import teams
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

def get_team_stats(measure_type='Base'):
    """Fetch all team statistics."""
    stats = leaguedashteamstats.LeagueDashTeamStats(
        season=SEASON,
        per_mode_detailed='PerGame',
        measure_type_detailed_defense=measure_type,
        season_type_all_star='Regular Season',
        league_id_nullable='00'
    )
    return _extract_team_stats_frame(stats)

def format_rank(rank):
    """Format rank with suffix (1st, 2nd, 3rd, etc.)"""
    if rank is None:
        return "-"
    rank = int(rank)
    if rank <= 0:
        return "-"
    if rank == 1:
        return "1st"
    elif rank == 2:
        return "2nd"
    elif rank == 3:
        return "3rd"
    else:
        return f"{rank}th"

def generate_team_rankings():
    """Generate complete team rankings data."""
    try:
        print("Fetching team stats from NBA API...")
        name_to_abbr = _build_team_abbr_map()
        df_base = get_team_stats('Base')
        df_opp = get_team_stats('Opponent')
        print(f"Retrieved data for {len(df_base)} teams")

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
        
        # Calculate rankings for offensive stats (higher is better, except TO)
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
        
        teams_data = {}

        opp_by_team_id = {}
        opp_by_team_abbr = {}
        if opp_team_id_col:
            opp_by_team_id = df_opp.set_index(opp_team_id_col).to_dict(orient='index')
        if opp_team_abbr_col:
            opp_by_team_abbr = df_opp.set_index(opp_team_abbr_col).to_dict(orient='index')
        
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
                    'ppgRank': format_rank(row['PTS_RANK']),
                    'fgPct': _format_pct(_get_numeric(row, fg_pct_col)),
                    'fgPctRank': format_rank(row['FG_PCT_RANK']),
                    'fg3Pct': _format_pct(_get_numeric(row, fg3_pct_col)),
                    'fg3PctRank': format_rank(row['FG3_PCT_RANK']),
                    'ftPct': _format_pct(_get_numeric(row, ft_pct_col)),
                    'ftPctRank': format_rank(row['FT_PCT_RANK']),
                    'ast': round(_get_numeric(row, ast_col), 1),
                    'astRank': format_rank(row['AST_RANK']),
                    'to': round(_get_numeric(row, tov_col), 1),
                    'toRank': format_rank(row['TOV_RANK'])
                },
                'defense': {
                    'oppg': round(_get_numeric(opp_row, opp_pts_col), 1),
                    'oppgRank': format_rank(opp_row.get('OPP_PTS_RANK', 0)),
                    'ofgPct': _format_pct(_get_numeric(opp_row, opp_fg_pct_col)),
                    'ofgPctRank': format_rank(opp_row.get('OPP_FG_PCT_RANK', 0)),
                    'o3fgPct': _format_pct(_get_numeric(opp_row, opp_fg3_pct_col)),
                    'o3fgPctRank': format_rank(opp_row.get('OPP_FG3_PCT_RANK', 0)),
                    'blk': round(_get_numeric(row, blk_col), 1),
                    'blkRank': format_rank(row['BLK_RANK']),
                    'stl': round(_get_numeric(row, stl_col), 1),
                    'stlRank': format_rank(row['STL_RANK']),
                    'reb': round(_get_numeric(row, reb_col), 1),
                    'rebRank': format_rank(row['REB_RANK'])
                }
            }
        
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        
        output_file = os.path.join(OUTPUT_DIR, 'team_rankings.json')
        output_data = {
            'lastUpdated': datetime.now().isoformat(),
            'season': SEASON,
            'teams': teams_data
        }
        
        with open(output_file, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"Saved to {output_file}")
        print(f"Generated data for {len(teams_data)} teams")
        
        sample = list(teams_data.values())[0]
        print(f"\nSample ({sample['teamAbbr']}): {sample['offense']['ppg']} PPG ({sample['offense']['ppgRank']})")
        
        return output_data
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        raise

if __name__ == '__main__':
    generate_team_rankings()
