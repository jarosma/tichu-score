import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Game, Player, Team } from "@/lib/Types";
import { GameScoreSummary } from "./GameScoreSummary";

const player = (id: string): Player => ({
  id,
  name: id,
  elo: null,
  enabled: true,
});

const team = (id: string): Team => ({
  id,
  name: `Team ${id}`,
  player1: player(`${id}-1`),
  player2: player(`${id}-2`),
  teamElo: null,
  enabled: true,
});

function game(overrides: Partial<Game> = {}): Game {
  return {
    id: "game-1",
    startedAt: "2026-01-01T00:00:00Z",
    endedAt: null,
    team1: team("one"),
    team2: team("two"),
    scores: {
      rounds: [
        {
          number: 0,
          submittedAt: "2026-01-01T00:01:00Z",
          team1: 100,
          team2: 0,
        },
      ],
    },
    winner: null,
    hasEnded: false,
    pendingFinish: false,
    ...overrides,
  };
}

describe("GameScoreSummary ended state", () => {
  it("uses the authoritative winner instead of the current score leader", () => {
    render(
      <GameScoreSummary
        game={game({
          hasEnded: true,
          endedAt: "2026-01-01T01:00:00Z",
          winner: "team2",
        })}
      />,
    );

    expect(screen.getByText("Spiel beendet")).toBeInTheDocument();
    expect(screen.getByText("Sieger: Team two")).toBeInTheDocument();
    expect(screen.queryByText("Führend")).not.toBeInTheDocument();
  });

  it("shows a draw explicitly and does not invent a winner", () => {
    render(
      <GameScoreSummary
        game={game({
          hasEnded: true,
          endedAt: "2026-01-01T01:00:00Z",
          winner: "draw",
        })}
      />,
    );

    expect(screen.getByText("Spiel beendet")).toBeInTheDocument();
    expect(screen.getByText("Unentschieden")).toBeInTheDocument();
    expect(screen.queryByText(/^Sieger:/)).not.toBeInTheDocument();
    expect(screen.queryByText("Führend")).not.toBeInTheDocument();
  });
});
