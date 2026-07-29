import { describe, expect, it } from "vitest";
import type { Game, Player, PlayerStats, ScoreRound, Team } from "../Types";
import { isGame, isPlayer, isScoreRound, isStats, isTeam } from "./validation";

const player: Player = {
  id: "player-1",
  name: "Anna",
  elo: 1200,
  enabled: true,
};

const team: Team = {
  id: "team-1",
  name: "Duo",
  player1: player,
  player2: { ...player, id: "player-2", name: "Bert" },
  teamElo: null,
  enabled: true,
};

const round: ScoreRound = {
  number: 0,
  submittedAt: "2026-01-01T00:00:00Z",
  team1: 100,
  team2: 0,
};

const stats: PlayerStats = {
  totalWins: 1,
  totalLosses: 0,
  successfulTichus: 2,
  unsuccessfulTichus: 1,
  totalGamesPlayed: 1,
  highestPointDiffWin: 100,
};

const game: Game = {
  id: "game-1",
  startedAt: "2026-01-01T00:00:00Z",
  endedAt: null,
  team1: team,
  team2: { ...team, id: "team-2", name: "Zweites Duo" },
  scores: { rounds: [round] },
  winner: null,
  hasEnded: false,
  pendingFinish: false,
};

describe("API response validators", () => {
  it("accepts the central backend response shapes", () => {
    expect(isPlayer(player)).toBe(true);
    expect(isTeam(team)).toBe(true);
    expect(isStats(stats)).toBe(true);
    expect(isScoreRound(round)).toBe(true);
    expect(isGame(game)).toBe(true);
  });

  it.each([
    [isPlayer, { ...player, enabled: "yes" }],
    [isTeam, { ...team, player2: { ...team.player2, elo: "1200" } }],
    [isStats, { ...stats, totalGamesPlayed: "1" }],
    [isScoreRound, { ...round, team1: "100" }],
    [isGame, { ...game, scores: { rounds: [{ ...round, team2: null }] } }],
  ])("rejects a malformed response", (validator, payload) => {
    expect(validator(payload)).toBe(false);
  });
});
