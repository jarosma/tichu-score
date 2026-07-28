import { describe, expect, it } from "vitest";
import type { Player, Team } from "./Types";
import { mergeTeamIntoList } from "./gameSetup";

const player = (id: string): Player => ({
  id,
  name: id,
  elo: null,
  enabled: true,
});

const team = (id: string, name = id): Team => ({
  id,
  name,
  player1: player(`${id}-1`),
  player2: player(`${id}-2`),
  teamElo: null,
  enabled: true,
});

describe("mergeTeamIntoList", () => {
  it("keeps a successful team available without duplicating it", () => {
    const original = team("team-1", "Altes Team");
    const updated = team("team-1", "Neues Team");

    expect(mergeTeamIntoList([original], updated)).toEqual([updated]);
    expect(mergeTeamIntoList([], original)).toEqual([original]);
  });
});
