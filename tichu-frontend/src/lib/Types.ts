export type UUID = string;

export interface Player {
  id: UUID;
  name: string;
  elo?: number;
}

export interface Team {
  id: UUID;
  name: string;
  player1: Player;
  player2: Player;
  teamElo?: number;
}

export interface StartGameRequest {
  team1: UUID;
  team2: UUID;
}

export interface PlayerPostRequest {
  name: string;
}

export interface TeamCreateRequest {
  name: string;
  player1: UUID;
  player2: UUID;
}

export interface ScoreRound {
  number: number;
  team1: number;
  team2: number;
}

export interface Scores {
  rounds: ScoreRound[];
}

export interface Game {
  id: string;
  startedAt: string;
  endedAt: string | null;
  team1: Team;
  team2: Team;
  scores: Scores;
  winner: "team1" | "team2" | null;
  hasEnded: boolean;
}
