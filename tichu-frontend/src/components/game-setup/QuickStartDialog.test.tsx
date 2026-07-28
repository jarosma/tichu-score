import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player, Team, TeamCreateRequest } from "@/lib/Types";
import { ApiError } from "@/lib/api/client";
import { QuickStartDialog } from "./QuickStartDialog";

const mocks = vi.hoisted(() => ({
  createTeam: vi.fn(),
  mutate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/api/Teams", () => ({
  createTeam: mocks.createTeam,
}));
vi.mock("swr", () => ({
  mutate: mocks.mutate,
}));

afterEach(() => {
  vi.clearAllMocks();
});

const players: Player[] = ["Anna", "Bert", "Clara", "Doris"].map(
  (name, index) => ({
    id: `player-${index + 1}`,
    name,
    elo: null,
    enabled: true,
  }),
);

function makeTeam(request: TeamCreateRequest, id: string): Team {
  return {
    id,
    name: request.name,
    player1: players.find((player) => player.id === request.player1Id)!,
    player2: players.find((player) => player.id === request.player2Id)!,
    teamElo: null,
    enabled: true,
  };
}

function renderDialog(nextPlayers = players, onComplete = vi.fn()) {
  render(
    <QuickStartDialog
      open
      players={nextPlayers}
      teams={[]}
      onOpenChange={vi.fn()}
      onComplete={onComplete}
    />,
  );
  return onComplete;
}

describe("QuickStartDialog", () => {
  it("retains a partially created team and reuses it on retry", async () => {
    mocks.createTeam
      .mockImplementationOnce(async (request: TeamCreateRequest) =>
        makeTeam(request, "team-1"),
      )
      .mockRejectedValueOnce(
        new ApiError("Dieser Name ist bereits vergeben.", 409),
      )
      .mockImplementationOnce(async (request: TeamCreateRequest) =>
        makeTeam(request, "team-2"),
      );
    const onComplete = renderDialog();

    for (const player of players) {
      fireEvent.click(screen.getByRole("button", { name: player.name }));
    }
    fireEvent.click(
      screen.getByRole("button", { name: "Fehlende Teams erstellen" }),
    );

    const nameInputs = screen.getAllByRole("textbox");
    fireEvent.change(nameInputs[0], { target: { value: "Team Alpha" } });
    fireEvent.change(nameInputs[1], { target: { value: "Team Beta" } });
    fireEvent.click(screen.getByRole("button", { name: "Teams erstellen" }));

    await waitFor(() =>
      expect(screen.getByText(/wird verwendet/)).toBeInTheDocument(),
    );
    expect(
      screen.getByText("Dieser Name ist bereits vergeben."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Teams erstellen" }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(mocks.createTeam).toHaveBeenCalledTimes(3);
    expect(mocks.createTeam.mock.calls[2][0]).not.toEqual(
      mocks.createTeam.mock.calls[0][0],
    );
  });

  it("defensively blocks setup with fewer than four active players", () => {
    renderDialog(players.slice(0, 3));

    expect(
      screen.getByText(/mindestens vier aktive Spieler/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Teams aufteilen" }),
    ).toBeDisabled();
  });
});
