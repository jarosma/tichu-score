import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player } from "@/lib/Types";
import { apiKeys } from "@/lib/api/keys";
import { CreateGamePage } from "./CreateGamePage";

const mocks = vi.hoisted(() => ({
  useSWR: vi.fn(),
  fetchPlayers: vi.fn(),
  fetchTeams: vi.fn(),
  startGame: vi.fn(),
}));

vi.mock("swr", () => ({
  default: mocks.useSWR,
}));
vi.mock("@/lib/api/Players", () => ({
  fetchPlayers: mocks.fetchPlayers,
}));
vi.mock("@/lib/api/Teams", () => ({
  fetchTeams: mocks.fetchTeams,
}));
vi.mock("@/lib/api/Games", () => ({
  startGame: mocks.startGame,
}));

afterEach(() => {
  vi.clearAllMocks();
});

function playersWithActiveCount(activeCount: number): Player[] {
  return Array.from({ length: 4 }, (_, index) => ({
    id: `player-${index + 1}`,
    name: `Spieler ${index + 1}`,
    elo: null,
    enabled: index < activeCount,
  }));
}

function renderPage(players: Player[] | undefined, playersError?: Error) {
  const refreshPlayers = vi.fn();
  mocks.useSWR.mockImplementation((key: string) => {
    if (key === apiKeys.teams) {
      return {
        data: [],
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      };
    }
    return {
      data: players,
      error: playersError,
      isLoading: false,
      mutate: refreshPlayers,
    };
  });

  render(
    <MemoryRouter>
      <CreateGamePage />
    </MemoryRouter>,
  );
  return refreshPlayers;
}

describe("CreateGamePage", () => {
  it("shows and retries player loading errors", () => {
    const refreshPlayers = renderPage(undefined, new Error("offline"));

    expect(
      screen.getByRole("heading", {
        name: "Spieler konnten nicht geladen werden",
      }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
    expect(refreshPlayers).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Keine aktiven Teams vorhanden"),
    ).not.toBeInTheDocument();
  });

  it.each([0, 2, 3])(
    "explains why Quick Start is unavailable with %s active players",
    (activeCount) => {
      renderPage(playersWithActiveCount(activeCount));

      expect(
        screen.getByText(/Quick Start ist derzeit nicht möglich/),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Zufällige Teams" }),
      ).not.toBeInTheDocument();
    },
  );

  it("enables Quick Start only with four active players", () => {
    renderPage(playersWithActiveCount(4));

    expect(
      screen.getByRole("button", { name: "Zufällige Teams" }),
    ).toBeEnabled();
  });
});
