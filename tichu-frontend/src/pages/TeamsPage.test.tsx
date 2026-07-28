import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player, Team } from "@/lib/Types";
import { ApiError } from "@/lib/api/client";
import { TeamsPage } from "./TeamsPage";

const mocks = vi.hoisted(() => ({
  fetchTeams: vi.fn(),
  updateTeamStatus: vi.fn(),
  deleteTeam: vi.fn(),
  createTeam: vi.fn(),
  fetchPlayers: vi.fn(),
}));

vi.mock("@/lib/api/Teams", () => mocks);
vi.mock("@/lib/api/Players", () => ({
  fetchPlayers: mocks.fetchPlayers,
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
  teamElo: 1210,
  enabled: true,
};

function renderPage() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <TeamsPage />
      </MemoryRouter>
    </SWRConfig>,
  );
}

describe("TeamsPage", () => {
  it("keeps a successful status mutation separate from a failed refresh", async () => {
    mocks.fetchTeams
      .mockResolvedValueOnce([team])
      .mockRejectedValueOnce(new Error("refresh failed"));
    mocks.fetchPlayers.mockResolvedValue([player1, player2]);
    mocks.updateTeamStatus.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText("Duo");
    fireEvent.click(screen.getByRole("button", { name: "Deaktivieren" }));

    expect(await screen.findByText("Team deaktiviert.")).toBeInTheDocument();
    expect(
      await screen.findByText(/Die Änderung wurde gespeichert/),
    ).toBeInTheDocument();
    expect(mocks.updateTeamStatus).toHaveBeenCalledTimes(1);
  });

  it("offers a filter reset instead of team creation for disabled teams", async () => {
    mocks.fetchTeams.mockResolvedValue([team]);
    mocks.fetchPlayers.mockResolvedValue([player1, player2]);
    renderPage();

    await screen.findByText("Duo");
    fireEvent.click(screen.getByRole("button", { name: "Deaktiviert" }));

    expect(screen.getByText("Keine deaktivierten Teams")).toBeInTheDocument();
    expect(
      screen.getByText("Es gibt derzeit keine deaktivierten Teams."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter zurücksetzen" }),
    ).toBeInTheDocument();
  });

  it("keeps team delete failures in the confirmation dialog", async () => {
    mocks.fetchTeams.mockResolvedValue([team]);
    mocks.fetchPlayers.mockResolvedValue([player1, player2]);
    mocks.deleteTeam.mockRejectedValue(
      new ApiError("Team wird noch verwendet.", 409),
    );
    renderPage();

    await screen.findByText("Duo");
    fireEvent.click(screen.getByRole("button", { name: "Löschen" }));
    const deleteButtons = screen.getAllByRole("button", { name: "Löschen" });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByRole("alert")).toHaveTextContent(
        "Team wird noch verwendet.",
      ),
    );
  });
});
