import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Player } from "@/lib/Types";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { PlayerFormDialog } from "./PlayerFormDialog";
import { TeamFormDialog } from "./TeamFormDialog";

const mocks = vi.hoisted(() => ({
  createPlayer: vi.fn(),
  createTeam: vi.fn(),
}));

vi.mock("@/lib/api/Players", () => ({
  createPlayer: mocks.createPlayer,
}));
vi.mock("@/lib/api/Teams", () => ({
  createTeam: mocks.createTeam,
}));

afterEach(() => {
  vi.clearAllMocks();
});

const players: Player[] = [
  { id: "player-1", name: "Anna", elo: null, enabled: true },
  { id: "player-2", name: "Bert", elo: null, enabled: true },
];

describe("form and inline message accessibility", () => {
  it("announces player validation errors and focuses the invalid field", () => {
    render(
      <PlayerFormDialog open onOpenChange={vi.fn()} onCreated={vi.fn()} />,
    );
    const nameInput = screen.getByLabelText("Name");

    fireEvent.submit(nameInput.closest("form")!);

    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "player-form-error");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Bitte gib einen Namen ein.",
    );
    expect(nameInput).toHaveFocus();
  });

  it("associates team validation errors with all required fields", () => {
    render(
      <TeamFormDialog
        open
        players={players}
        onOpenChange={vi.fn()}
        onCreated={vi.fn()}
      />,
    );
    const form = screen.getByLabelText("Teamname").closest("form")!;
    fireEvent.submit(form);

    for (const label of ["Teamname", "Spieler 1", "Spieler 2"]) {
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-describedby",
        "team-form-error",
      );
      expect(screen.getByLabelText(label)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
    }
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Teamname und beide Spieler müssen ausgewählt sein.",
    );
  });

  it("uses status for success and alert for warnings", () => {
    render(
      <>
        <InlineMessage variant="success">Gespeichert</InlineMessage>
        <InlineMessage variant="warning">Achtung</InlineMessage>
      </>,
    );

    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
  });
});
