import { describe, expect, it } from "vitest";
import { apiKeys } from "./keys";
import { apiPaths } from "./paths";

describe("API paths and cache keys", () => {
  it("derives cache keys from the single endpoint definitions", () => {
    expect(apiKeys.players).toBe(apiPaths.players);
    expect(apiKeys.player("player-1")).toBe(apiPaths.player("player-1"));
    expect(apiKeys.playerStats("player-1")).toBe(
      apiPaths.playerStats("player-1"),
    );
    expect(apiKeys.teams).toBe(apiPaths.teams);
    expect(apiKeys.team("team-1")).toBe(apiPaths.team("team-1"));
    expect(apiKeys.teamStats("team-1")).toBe(apiPaths.teamStats("team-1"));
    expect(apiKeys.games).toBe(apiPaths.games);
    expect(apiKeys.game("game-1")).toBe(apiPaths.game("game-1"));
  });
});
