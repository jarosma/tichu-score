import { afterEach, describe, expect, it, vi } from "vitest";
import type { Game, Player, Team } from "../Types";
import { ApiError } from "./client";
import { startGame } from "./Games";
import { submitScore } from "./Scores";
import { fetchPlayerStats } from "./Statistics";

afterEach(() => {
  vi.unstubAllGlobals();
});

const player = (id: string): Player => ({
  id,
  name: id,
  elo: null,
  enabled: true,
});

const team = (id: string): Team => ({
  id,
  name: id,
  player1: player(`${id}-1`),
  player2: player(`${id}-2`),
  teamElo: null,
  enabled: true,
});

const game: Game = {
  id: "game-1",
  startedAt: "2026-01-01T00:00:00Z",
  endedAt: null,
  team1: team("team-1"),
  team2: team("team-2"),
  scores: { rounds: [] },
  winner: null,
  hasEnded: false,
  pendingFinish: false,
};

describe("API modules", () => {
  it("keeps request payloads and endpoint paths stable", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(game), { status: 201 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            number: 0,
            submittedAt: "2026-01-01T00:01:00Z",
            team1: 50,
            team2: 50,
          }),
          { status: 200 },
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await startGame("team-1", "team-2", "request-1");
    await submitScore("game-1", {
      roundKey: "round-1",
      team1Score: 50,
      team2Score: 50,
      tichuCalls: [],
    });

    expect(fetchMock.mock.calls[0][0]).toBe("/api/games");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      idempotencyKey: "request-1",
      team1Id: "team-1",
      team2Id: "team-2",
    });
    expect(fetchMock.mock.calls[1][0]).toBe("/api/games/game-1/round-results");
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      roundKey: "round-1",
      team1Score: 50,
      team2Score: 50,
      tichuCalls: [],
    });
  });

  it("rejects malformed module responses before a consumer can render them", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ totalWins: 1 }), { status: 200 }),
        ),
    );

    await expect(fetchPlayerStats("player-1")).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        message: "Die Serverantwort hat ein ungültiges Format.",
      } satisfies Partial<ApiError>),
    );
  });
});
