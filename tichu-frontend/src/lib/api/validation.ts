import type {
  Game,
  Player,
  PlayerStats,
  ScoreRound,
  Team,
  TeamStats,
} from "../Types";

export type ResponseValidator<T> = (value: unknown) => value is T;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

export const isPlayer: ResponseValidator<Player> = (value): value is Player => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.name) &&
    (value.elo === null || isInteger(value.elo)) &&
    typeof value.enabled === "boolean"
  );
};

export const isTeam: ResponseValidator<Team> = (value): value is Team => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.name) &&
    isPlayer(value.player1) &&
    isPlayer(value.player2) &&
    (value.teamElo === null || isInteger(value.teamElo)) &&
    typeof value.enabled === "boolean"
  );
};

export const isStats: ResponseValidator<PlayerStats | TeamStats> = (
  value,
): value is PlayerStats | TeamStats => {
  if (!isRecord(value)) return false;

  return (
    isInteger(value.totalWins) &&
    isInteger(value.totalLosses) &&
    isInteger(value.successfulTichus) &&
    isInteger(value.unsuccessfulTichus) &&
    isInteger(value.totalGamesPlayed) &&
    (value.highestPointDiffWin === null || isInteger(value.highestPointDiffWin))
  );
};

export const isScoreRound: ResponseValidator<ScoreRound> = (
  value,
): value is ScoreRound => {
  if (!isRecord(value)) return false;

  return (
    isInteger(value.number) &&
    isString(value.submittedAt) &&
    isInteger(value.team1) &&
    isInteger(value.team2)
  );
};

function isScores(value: unknown): value is Game["scores"] {
  return (
    isRecord(value) &&
    Array.isArray(value.rounds) &&
    value.rounds.every((round) => isScoreRound(round))
  );
}

function isWinner(value: unknown): value is Game["winner"] {
  return (
    value === null || value === "team1" || value === "team2" || value === "draw"
  );
}

export const isGame: ResponseValidator<Game> = (value): value is Game => {
  if (!isRecord(value)) return false;

  return (
    isString(value.id) &&
    isString(value.startedAt) &&
    (value.endedAt === null || isString(value.endedAt)) &&
    isTeam(value.team1) &&
    isTeam(value.team2) &&
    isScores(value.scores) &&
    isWinner(value.winner) &&
    typeof value.hasEnded === "boolean" &&
    typeof value.pendingFinish === "boolean"
  );
};

export const isPlayerArray: ResponseValidator<Player[]> = (
  value,
): value is Player[] =>
  Array.isArray(value) && value.every((item) => isPlayer(item));

export const isTeamArray: ResponseValidator<Team[]> = (
  value,
): value is Team[] =>
  Array.isArray(value) && value.every((item) => isTeam(item));

export const isGameArray: ResponseValidator<Game[]> = (
  value,
): value is Game[] =>
  Array.isArray(value) && value.every((item) => isGame(item));
