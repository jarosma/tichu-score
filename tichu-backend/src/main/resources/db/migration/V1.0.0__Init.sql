CREATE TYPE game_winner AS ENUM ('team1', 'team2');

CREATE TABLE player_stats (
    id UUID PRIMARY KEY,
    total_wins INT NOT NULL DEFAULT 0,
    total_losses INT NOT NULL DEFAULT 0,
    successful_tichus INT NOT NULL DEFAULT 0,
    unsuccessful_tichus INT NOT NULL DEFAULT 0,
    total_games_played INT NOT NULL DEFAULT 0,
    highest_point_diff_win INT
);

CREATE TABLE team_stats (
    id UUID PRIMARY KEY,
    total_wins INT NOT NULL DEFAULT 0,
    total_losses INT NOT NULL DEFAULT 0,
    successful_tichus INT NOT NULL DEFAULT 0,
    unsuccessful_tichus INT NOT NULL DEFAULT 0,
    total_games_played INT NOT NULL DEFAULT 0,
    highest_point_diff_win INT
);

CREATE TABLE player (
    id UUID PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    elo INT CHECK (elo >= 0),
    enabled BOOLEAN NOT NULL DEFAULT true,
    stats_id UUID NOT NULL,

    CONSTRAINT uq_player_name UNIQUE (name),
    CONSTRAINT uq_player_stats UNIQUE (stats_id),
    CONSTRAINT chk_player_stats_id CHECK (stats_id = id),
    CONSTRAINT fk_player_stats FOREIGN KEY (stats_id) REFERENCES player_stats(id)
);

CREATE TABLE team (
    id UUID PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    player1 UUID NOT NULL,
    player2 UUID NOT NULL,
    team_elo INT CHECK (team_elo >= 0),
    enabled BOOLEAN NOT NULL DEFAULT true,
    team_stats_id UUID NOT NULL,

    CONSTRAINT fk_team_player1 FOREIGN KEY (player1) REFERENCES player(id),
    CONSTRAINT fk_team_player2 FOREIGN KEY (player2) REFERENCES player(id),
    CONSTRAINT chk_distinct_players CHECK (player1 <> player2),
    CONSTRAINT uq_team_stats UNIQUE (team_stats_id),
    CONSTRAINT chk_team_stats_id CHECK (team_stats_id = id),
    CONSTRAINT fk_team_stats FOREIGN KEY (team_stats_id) REFERENCES team_stats(id),
    CONSTRAINT uq_team_name UNIQUE (name)
);

CREATE TABLE game (
    id UUID PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,

    team1_id UUID NOT NULL,
    team2_id UUID NOT NULL,

    winner game_winner,

    CONSTRAINT fk_game_team1 FOREIGN KEY (team1_id) REFERENCES team(id),
    CONSTRAINT fk_game_team2 FOREIGN KEY (team2_id) REFERENCES team(id),
    CONSTRAINT chk_distinct_teams CHECK (team1_id <> team2_id),
    CONSTRAINT chk_game_time CHECK (ended_at >= started_at),
    CONSTRAINT chk_game_completion CHECK (
        (ended_at IS NULL AND winner IS NULL)
        OR
        (ended_at IS NOT NULL AND winner IS NOT NULL)
    )
);

CREATE TABLE game_round (
    id UUID PRIMARY KEY,
    game_id UUID NOT NULL,
    number INT NOT NULL,
    submitted_at TIMESTAMPTZ NOT NULL,
    team1_score INT NOT NULL,
    team2_score INT NOT NULL,

    CONSTRAINT fk_game_round_game FOREIGN KEY (game_id) REFERENCES game(id),
    CONSTRAINT uq_game_round_number UNIQUE (game_id, number),
    CONSTRAINT uq_game_round_id_game UNIQUE (id, game_id),
    CONSTRAINT chk_game_round_number CHECK (number >= 0)
);

CREATE INDEX idx_game_started_at ON game (started_at);
CREATE INDEX idx_game_team1 ON game (team1_id);
CREATE INDEX idx_game_team2 ON game (team2_id);
CREATE INDEX idx_game_round_game ON game_round (game_id);

CREATE TABLE tichu_call (
    id UUID PRIMARY KEY,
    game_id UUID NOT NULL,
    player_id UUID NOT NULL,
    game_round_id UUID NOT NULL,
    successful BOOLEAN NOT NULL,

    CONSTRAINT fk_tichu_call_game FOREIGN KEY (game_id) REFERENCES game(id),
    CONSTRAINT fk_tichu_call_player FOREIGN KEY (player_id) REFERENCES player(id),
    CONSTRAINT fk_tichu_call_round_game FOREIGN KEY (game_round_id, game_id)
        REFERENCES game_round(id, game_id),
    CONSTRAINT uq_tichu_call_round_player UNIQUE (game_round_id, player_id)
);

CREATE INDEX idx_tichu_call_game ON tichu_call (game_id);
CREATE INDEX idx_tichu_call_player ON tichu_call (player_id);
