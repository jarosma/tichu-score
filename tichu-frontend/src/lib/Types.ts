export type UUID = string;

export interface Player {
  id: UUID;
  name: string;
  elo: number | null;
  enabled: boolean;
}

export interface Team {
  id: UUID;
  name: string;
  player1: Player;
  player2: Player;
  teamElo: number | null;
  enabled: boolean;
}

export interface StartGameRequest {
  team1Id: UUID;
  team2Id: UUID;
}

export interface PlayerPostRequest {
  name: string;
}

export interface TeamCreateRequest {
  name: string;
  player1Id: UUID;
  player2Id: UUID;
}

export interface ScoreRound {
  number: number;
  submittedAt: string;
  team1: number;
  team2: number;
}

export interface Scores {
  rounds: ScoreRound[];
}

export interface TichuCallRequest {
  playerId: UUID;
  successful: boolean;
}

export interface SubmitScoreRequest {
  team1Score: number;
  team2Score: number;
  tichuCalls?: TichuCallRequest[];
}

export interface PlayerStats {
  totalWins: number;
  totalLosses: number;
  successfulTichus: number;
  unsuccessfulTichus: number;
  totalGamesPlayed: number;
  highestPointDiffWin: number | null;
}

export type TeamStats = PlayerStats;

export interface Game {
  id: UUID;
  startedAt: string;
  endedAt: string | null;
  team1: Team;
  team2: Team;
  scores: Scores;
  winner: "team1" | "team2" | "draw" | null;
  hasEnded: boolean;
}
