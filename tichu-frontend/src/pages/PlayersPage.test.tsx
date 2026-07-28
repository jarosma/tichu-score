import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player } from "@/lib/Types";
import { PlayersPage } from "./PlayersPage";

const mocks = vi.hoisted(() => ({
  fetchPlayers: vi.fn(),
  updatePlayerStatus: vi.fn(),
  deletePlayer: vi.fn(),
  createPlayer: vi.fn(),
}));

vi.mock("@/lib/api/Players", () => mocks);

afterEach(() => {
  vi.clearAllMocks();
});

const player: Player = {
  id: "player-1",
  name: "Anna",
  elo: 1200,
  enabled: true,
};

function renderPage() {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <PlayersPage />
      </MemoryRouter>
    </SWRConfig>,
  );
}

describe("PlayersPage mutations", () => {
  it("reports mutation success separately when list refresh fails", async () => {
    mocks.fetchPlayers
      .mockResolvedValueOnce([player])
      .mockRejectedValueOnce(new Error("refresh failed"));
    mocks.updatePlayerStatus.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText("Anna");
    fireEvent.click(screen.getByRole("button", { name: "Deaktivieren" }));

    expect(await screen.findByText("Spieler deaktiviert.")).toBeInTheDocument();
    expect(
      await screen.findByText(/Die Änderung wurde gespeichert/),
    ).toBeInTheDocument();
    expect(mocks.updatePlayerStatus).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Spielerstatus konnte nicht geändert werden."),
    ).not.toBeInTheDocument();
  });

  it("does not repeat a completed delete when refresh fails", async () => {
    mocks.fetchPlayers
      .mockResolvedValueOnce([player])
      .mockRejectedValueOnce(new Error("refresh failed"));
    mocks.deletePlayer.mockResolvedValue(undefined);
    renderPage();

    await screen.findByText("Anna");
    fireEvent.click(screen.getByRole("button", { name: "Löschen" }));
    const confirmButtons = screen.getAllByRole("button", { name: "Löschen" });
    fireEvent.click(confirmButtons[confirmButtons.length - 1]);

    await waitFor(() =>
      expect(screen.getByText("Spieler wurde gelöscht.")).toBeInTheDocument(),
    );
    expect(mocks.deletePlayer).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(/Die Änderung wurde gespeichert/),
    ).toBeInTheDocument();
  });

  it("offers a filter reset instead of active creation for disabled players", async () => {
    mocks.fetchPlayers.mockResolvedValue([player]);
    renderPage();

    await screen.findByText("Anna");
    fireEvent.click(screen.getByRole("button", { name: "Deaktiviert" }));

    expect(screen.getByText("Keine deaktivierten Spieler")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Filter zurücksetzen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Es gibt derzeit keine deaktivierten Spieler."),
    ).toBeInTheDocument();
  });
});
