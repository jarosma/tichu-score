CREATE TYPE game_winner AS ENUM ('team1', 'team2');


CREATE TABLE player (
    id UUID PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    elo INT CHECK (elo >= 0)
);

CREATE TABLE team (
    id UUID PRIMARY KEY,
    name VARCHAR(64),
    player1 UUID NOT NULL,
    player2 UUID NOT NULL,
    team_elo INT CHECK (team_elo >= 0),

    CONSTRAINT fk_team_player1 FOREIGN KEY (player1) REFERENCES player(id),
    CONSTRAINT fk_team_player2 FOREIGN KEY (player2) REFERENCES player(id),
    CONSTRAINT chk_distinct_players CHECK (player1 <> player2)
);

CREATE TABLE game (
    id UUID PRIMARY KEY,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,

    team1_id UUID NOT NULL,
    team2_id UUID NOT NULL,

    scores JSONB NOT NULL,
    winner game_winner,

    CONSTRAINT fk_game_team1 FOREIGN KEY (team1_id) REFERENCES team(id),
    CONSTRAINT fk_game_team2 FOREIGN KEY (team2_id) REFERENCES team(id),
    CONSTRAINT chk_distinct_teams CHECK (team1_id <> team2_id),
    CONSTRAINT chk_game_time CHECK (ended_at >= started_at)
);

CREATE INDEX idx_game_started_at ON game (started_at);
CREATE INDEX idx_game_team1 ON game (team1_id);
CREATE INDEX idx_game_team2 ON game (team2_id);
