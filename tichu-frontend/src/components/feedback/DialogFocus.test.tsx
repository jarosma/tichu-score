import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { describe, expect, it } from "vitest";
import type { Player, Team } from "@/lib/Types";
import { ConfirmDialog } from "./ConfirmDialog";
import { GameQrDialog } from "@/components/game/GameQrDialog";
import { TichuCallButtons } from "@/components/score/TichuCallButtons";
import { QuickStartDialog } from "@/components/game-setup/QuickStartDialog";
import { TeamPickerDialog } from "@/components/game-setup/TeamPickerDialog";

function ConfirmHarness() {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  return (
    <>
      <button
        ref={(element) => {
          openerRef.current = element;
        }}
        type="button"
        onClick={() => setOpen(true)}
      >
        Löschen öffnen
      </button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Löschen?"
        description="Diese Aktion kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        onConfirm={() => undefined}
        openerRef={openerRef}
      />
    </>
  );
}

const player = (id: string): Player => ({
  id,
  name: id,
  elo: null,
  enabled: true,
});

const team: Team = {
  id: "team-1",
  name: "Duo",
  player1: player("Anna"),
  player2: player("Bert"),
  teamElo: null,
  enabled: true,
};

const quickStartPlayers = ["Anna", "Bert", "Clara", "Doris"].map((name) =>
  player(name),
);

describe("controlled dialog focus", () => {
  it("restores the ConfirmDialog opener after cancel", async () => {
    render(<ConfirmHarness />);
    const opener = screen.getByRole("button", { name: "Löschen öffnen" });

    fireEvent.click(opener);
    fireEvent.click(await screen.findByRole("button", { name: "Abbrechen" }));

    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("keeps QR autofocus and close focus within its own dialog", async () => {
    render(<GameQrDialog submitScoreUrl="https://example.test/score" />);
    const trigger = screen.getByRole("button", {
      name: "Punkteingabe per QR-Code öffnen",
    });

    fireEvent.click(trigger);
    const closeButton = await screen.findByRole("button", {
      name: "Schließen",
    });
    await waitFor(() => expect(closeButton).toHaveFocus());

    fireEvent.click(closeButton);
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("restores the Tichu action after selecting a player", async () => {
    render(
      <TichuCallButtons
        players={[{ player: player("Anna"), teamName: "Team A" }]}
        statuses={{}}
        onChange={() => undefined}
      />,
    );
    const opener = screen.getByRole("button", { name: "Tichu gewonnen" });

    fireEvent.click(opener);
    fireEvent.click(await screen.findByRole("button", { name: /Anna/ }));

    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("restores the TeamPicker opener after selecting a team", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      const openerRef = useRef<HTMLElement | null>(null);

      return (
        <>
          <button
            ref={(element) => {
              openerRef.current = element;
            }}
            type="button"
            onClick={() => setOpen(true)}
          >
            Team auswählen
          </button>
          <TeamPickerDialog
            open={open}
            slot={1}
            teams={[team]}
            selectedTeam={null}
            occupiedTeam={null}
            onOpenChange={setOpen}
            onSelect={() => undefined}
            openerRef={openerRef}
          />
        </>
      );
    }

    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Team auswählen" });
    fireEvent.click(opener);
    fireEvent.click(await screen.findByRole("button", { name: /Duo/ }));

    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("restores the Quick Start opener after cancel", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      const openerRef = useRef<HTMLElement | null>(null);

      return (
        <>
          <button
            ref={(element) => {
              openerRef.current = element;
            }}
            type="button"
            onClick={() => setOpen(true)}
          >
            Quick Start öffnen
          </button>
          <QuickStartDialog
            open={open}
            players={quickStartPlayers}
            teams={[]}
            onOpenChange={setOpen}
            onComplete={() => undefined}
            openerRef={openerRef}
          />
        </>
      );
    }

    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Quick Start öffnen" });
    fireEvent.click(opener);
    fireEvent.click(await screen.findByRole("button", { name: "Schließen" }));

    await waitFor(() => expect(opener).toHaveFocus());
  });
});
