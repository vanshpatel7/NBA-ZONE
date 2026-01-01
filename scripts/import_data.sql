-- Drop old table
DROP TABLE IF EXISTS player_stats CASCADE;

-- Create table with DOUBLE PRECISION for all numeric columns
CREATE TABLE player_stats (
    rk DOUBLE PRECISION,
    player VARCHAR(255),
    pos VARCHAR(50),
    age DOUBLE PRECISION,
    g DOUBLE PRECISION,
    gs DOUBLE PRECISION,
    mp DOUBLE PRECISION,
    fg DOUBLE PRECISION,
    fga DOUBLE PRECISION,
    fg_pct DOUBLE PRECISION,
    three_p DOUBLE PRECISION,
    three_pa DOUBLE PRECISION,
    three_p_pct DOUBLE PRECISION,
    two_p DOUBLE PRECISION,
    two_pa DOUBLE PRECISION,
    two_p_pct DOUBLE PRECISION,
    efg_pct DOUBLE PRECISION,
    ft DOUBLE PRECISION,
    fta DOUBLE PRECISION,
    ft_pct DOUBLE PRECISION,
    orb DOUBLE PRECISION,
    drb DOUBLE PRECISION,
    trb DOUBLE PRECISION,
    ast DOUBLE PRECISION,
    stl DOUBLE PRECISION,
    blk DOUBLE PRECISION,
    tov DOUBLE PRECISION,
    pf DOUBLE PRECISION,
    pts DOUBLE PRECISION,
    team VARCHAR(255),
    source_table VARCHAR(50),
    trp_dbl DOUBLE PRECISION,
    awards TEXT,
    PRIMARY KEY (rk, team)
);

-- Create temporary table to import ALL data first
CREATE TEMP TABLE temp_player_stats (
    rk TEXT,
    player VARCHAR(255),
    age TEXT,
    team TEXT,
    pos TEXT,
    g TEXT,
    gs TEXT,
    mp TEXT,
    fg TEXT,
    fga TEXT,
    fg_pct TEXT,
    three_p TEXT,
    three_pa TEXT,
    three_p_pct TEXT,
    two_p TEXT,
    two_pa TEXT,
    two_p_pct TEXT,
    efg_pct TEXT,
    ft TEXT,
    fta TEXT,
    ft_pct TEXT,
    orb TEXT,
    drb TEXT,
    trb TEXT,
    ast TEXT,
    stl TEXT,
    blk TEXT,
    tov TEXT,
    pf TEXT,
    pts TEXT,
    awards TEXT,
    player_additional TEXT
);

-- Import into temp table
\COPY temp_player_stats FROM '/Users/vansh/Downloads/nba-zone/nba_stats_new.csv' WITH (FORMAT CSV, HEADER true, DELIMITER ',');

-- Insert only rows with valid rk (filters out "Team Totals" rows)
INSERT INTO player_stats (rk, player, pos, age, g, gs, mp, fg, fga, fg_pct, three_p, three_pa, three_p_pct, two_p, two_pa, two_p_pct, efg_pct, ft, fta, ft_pct, orb, drb, trb, ast, stl, blk, tov, pf, pts, team, awards)
SELECT 
    NULLIF(rk, '')::DOUBLE PRECISION,
    player,
    pos,
    NULLIF(age, '')::DOUBLE PRECISION,
    NULLIF(g, '')::DOUBLE PRECISION,
    NULLIF(gs, '')::DOUBLE PRECISION,
    NULLIF(mp, '')::DOUBLE PRECISION,
    NULLIF(fg, '')::DOUBLE PRECISION,
    NULLIF(fga, '')::DOUBLE PRECISION,
    NULLIF(fg_pct, '')::DOUBLE PRECISION,
    NULLIF(three_p, '')::DOUBLE PRECISION,
    NULLIF(three_pa, '')::DOUBLE PRECISION,
    NULLIF(three_p_pct, '')::DOUBLE PRECISION,
    NULLIF(two_p, '')::DOUBLE PRECISION,
    NULLIF(two_pa, '')::DOUBLE PRECISION,
    NULLIF(two_p_pct, '')::DOUBLE PRECISION,
    NULLIF(efg_pct, '')::DOUBLE PRECISION,
    NULLIF(ft, '')::DOUBLE PRECISION,
    NULLIF(fta, '')::DOUBLE PRECISION,
    NULLIF(ft_pct, '')::DOUBLE PRECISION,
    NULLIF(orb, '')::DOUBLE PRECISION,
    NULLIF(drb, '')::DOUBLE PRECISION,
    NULLIF(trb, '')::DOUBLE PRECISION,
    NULLIF(ast, '')::DOUBLE PRECISION,
    NULLIF(stl, '')::DOUBLE PRECISION,
    NULLIF(blk, '')::DOUBLE PRECISION,
    NULLIF(tov, '')::DOUBLE PRECISION,
    NULLIF(pf, '')::DOUBLE PRECISION,
    NULLIF(pts, '')::DOUBLE PRECISION,
    team,
    awards
FROM temp_player_stats
WHERE rk IS NOT NULL AND rk != '' AND rk != 'Rk';

-- Verify
SELECT COUNT(*) FROM player_stats;
SELECT player, age, team, pts FROM player_stats LIMIT 5;
