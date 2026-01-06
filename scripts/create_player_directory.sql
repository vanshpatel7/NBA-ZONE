-- Player directory and cached stats tables

CREATE TABLE IF NOT EXISTS players (
    nba_player_id BIGINT PRIMARY KEY,
    first_name VARCHAR(80),
    last_name VARCHAR(80),
    full_name VARCHAR(160),
    team_id BIGINT,
    team_abbr VARCHAR(10),
    position VARCHAR(20),
    bio TEXT,
    headshot_url TEXT,
    active BOOLEAN DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS player_stats_cache (
    id BIGSERIAL PRIMARY KEY,
    nba_player_id BIGINT NOT NULL,
    player_name VARCHAR(160),
    game_id BIGINT NOT NULL,
    game_date DATE,
    team_id BIGINT,
    team_abbr VARCHAR(10),
    opponent_abbr VARCHAR(10),
    team_score DOUBLE PRECISION,
    opponent_score DOUBLE PRECISION,
    result_wl VARCHAR(4),
    min DOUBLE PRECISION,
    pts DOUBLE PRECISION,
    reb DOUBLE PRECISION,
    ast DOUBLE PRECISION,
    stl DOUBLE PRECISION,
    blk DOUBLE PRECISION,
    tov DOUBLE PRECISION,
    fgm DOUBLE PRECISION,
    fga DOUBLE PRECISION,
    fg_pct DOUBLE PRECISION,
    fg3m DOUBLE PRECISION,
    fg3a DOUBLE PRECISION,
    fg3_pct DOUBLE PRECISION,
    ftm DOUBLE PRECISION,
    fta DOUBLE PRECISION,
    ft_pct DOUBLE PRECISION,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (nba_player_id, game_id)
);

CREATE TABLE IF NOT EXISTS game_update_log (
    game_id BIGINT PRIMARY KEY,
    game_date DATE,
    processed_at TIMESTAMP NOT NULL DEFAULT NOW()
);
