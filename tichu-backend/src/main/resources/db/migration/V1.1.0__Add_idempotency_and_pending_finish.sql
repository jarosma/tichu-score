ALTER TABLE game
    ADD COLUMN start_key UUID,
    ADD COLUMN pending_finish BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE game_round
    ADD COLUMN round_key UUID;

ALTER TABLE game
    ADD CONSTRAINT uq_game_start_key UNIQUE (start_key);

ALTER TABLE game_round
    ADD CONSTRAINT uq_game_round_key UNIQUE (game_id, round_key);

UPDATE game
SET pending_finish = TRUE
WHERE ended_at IS NULL
  AND id IN (
      SELECT game_id
      FROM game_round
      GROUP BY game_id
      HAVING SUM(team1_score) >= 1000 OR SUM(team2_score) >= 1000
  );
