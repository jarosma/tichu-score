import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player, Team, TeamStats } from "@/lib/Types";
import { apiKeys } from "@/lib/api/keys";
import { StatisticsPage } from "./StatisticsPage";

const mocks = vi.hoisted(() => ({
  useSWR: vi.fn(),
  fetchPlayers: vi.fn(),
  fetchTeams: vi.fn(),
  fetchPlayerStats: vi.fn(),
  fetchTeamStats: vi.fn(),
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
vi.mock("@/lib/api/Statistics", () => ({
  fetchPlayerStats: mocks.fetchPlayerStats,
  fetchTeamStats: mocks.fetchTeamStats,
}));

afterEach(() => {
  vi.clearAllMocks();
});

const player1: Player = {
  id: "player-1",
  name: "Anna",
  elo: 1200,
  enabled: true,
};
const player2: Player = {
  id: "player-2",
  name: "Bert",
  elo: 1180,
  enabled: true,
};
const team: Team = {
  id: "team-1",
  name: "Duo",
  player1,
  player2,
  teamElo: 1337,
  enabled: false,
};
const stats: TeamStats = {
  totalWins: 2,
  totalLosses: 1,
  successfulTichus: 1,
  unsuccessfulTichus: 0,
  totalGamesPlayed: 3,
  highestPointDiffWin: 100,
};

describe("StatisticsPage", () => {
  it("uses teamElo and labels inactive teams textually", () => {
    mocks.useSWR.mockImplementation((key: string | null) => {
      if (key === apiKeys.players) {
        return {
          data: [],
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        };
      }
      if (key === apiKeys.teams) {
        return {
          data: [team],
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        };
      }
      if (key === apiKeys.teamStats("team-1")) {
        return {
          data: stats,
          error: undefined,
          isLoading: false,
          mutate: vi.fn(),
        };
      }
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      };
    });

    render(
      <MemoryRouter initialEntries={["/statistics?tab=teams&teamId=team-1"]}>
        <StatisticsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText(/ELO: 1337/)).toBeInTheDocument();
    expect(screen.getByText("Deaktiviert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Duo" })).toBeInTheDocument();
  });
});
