CREATE TABLE player_stats (
  id UUID PRIMARY KEY,
  total_wins int NOT NULL DEFAULT 0,
  total_losses int NOT NULL DEFAULT 0,
  successful_tichus int NOT NULL DEFAULT 0,
  unsuccessful_tichus int NOT NULL DEFAULT 0,
  total_games_played int NOT NULL DEFAULT 0,
  highest_point_diff_win int,
  FOREIGN KEY (id) REFERENCES player(id)
);

CREATE TABLE team_stats (
  id UUID PRIMARY KEY,
  total_wins int NOT NULL DEFAULT 0,
  total_losses int NOT NULL DEFAULT 0,
  successful_tichus int NOT NULL DEFAULT 0,
  unsuccessful_tichus int NOT NULL DEFAULT 0,
  total_games_played int NOT NULL DEFAULT 0,
  highest_point_diff_win int,
  FOREIGN KEY (id) REFERENCES team(id)
);
