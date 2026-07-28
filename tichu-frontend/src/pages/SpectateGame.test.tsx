import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Game, Player, Team } from "@/lib/Types";
import { SpectateGame } from "./SpectateGame";

const mocks = vi.hoisted(() => ({
  fetchGame: vi.fn(),
  endGame: vi.fn(),
}));

vi.mock("@/lib/api/Games", () => ({
  fetchGame: mocks.fetchGame,
  endGame: mocks.endGame,
}));

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

function game(): Game {
  return {
    id: "game-1",
    startedAt: "2026-01-01T00:00:00Z",
    endedAt: "2026-01-01T01:00:00Z",
    team1: team("one"),
    team2: team("two"),
    scores: { rounds: [] },
    winner: "draw",
    hasEnded: true,
    pendingFinish: false,
  };
}

afterEach(() => {
  vi.resetAllMocks();
});

describe("SpectateGame ended controls", () => {
  it("hides QR and end controls after a draw", async () => {
    mocks.fetchGame.mockResolvedValue(game());
    render(
      <SWRConfig
        value={{
          provider: () => new Map(),
          initFocus: () => undefined,
          initReconnect: () => undefined,
        }}
      >
        <MemoryRouter initialEntries={["/game/game-1/spectate"]}>
          <Routes>
            <Route path="/game/:id/spectate" element={<SpectateGame />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>,
    );

    expect(await screen.findByText("Spiel beendet")).toBeInTheDocument();
    expect(screen.getByText("Unentschieden")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Punkteingabe per QR-Code öffnen" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Spiel beenden" }),
    ).not.toBeInTheDocument();
  });
});
