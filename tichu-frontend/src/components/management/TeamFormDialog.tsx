import { useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { createTeam } from "@/lib/api/Teams";
import type { Player, Team } from "@/lib/Types";

interface TeamFormDialogProps {
  open: boolean;
  players: Player[];
  onOpenChange: (open: boolean) => void;
  onCreated: (team: Team) => void;
}

export function TeamFormDialog({
  open,
  players,
  onOpenChange,
  onCreated,
}: TeamFormDialogProps) {
  const [name, setName] = useState("");
  const [player1Id, setPlayer1Id] = useState("");
  const [player2Id, setPlayer2Id] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function close() {
    setName("");
    setPlayer1Id("");
    setPlayer2Id("");
    setError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName || !player1Id || !player2Id) {
      setError("Teamname und beide Spieler müssen ausgewählt sein.");
      return;
    }
    if (trimmedName.length > 64) {
      setError("Der Teamname darf maximal 64 Zeichen enthalten.");
      return;
    }
    if (player1Id === player2Id) {
      setError("Ein Spieler kann nicht beide Teamplätze belegen.");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const team = await createTeam({
        name: trimmedName,
        player1Id,
        player2Id,
      });
      onCreated(team);
      close();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Team konnte nicht erstellt werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team erstellen</DialogTitle>
          <DialogDescription>
            Wähle zwei aktive, unterschiedliche Spieler aus.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <InlineMessage variant="error">{error}</InlineMessage>}
          <div className="space-y-2">
            <Label htmlFor="team-name-management">Teamname</Label>
            <Input
              id="team-name-management"
              value={name}
              maxLength={64}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-player-1">Spieler 1</Label>
            <select
              id="team-player-1"
              value={player1Id}
              onChange={(event) => setPlayer1Id(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Spieler auswählen</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="team-player-2">Spieler 2</Label>
            <select
              id="team-player-2"
              value={player2Id}
              onChange={(event) => setPlayer2Id(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Spieler auswählen</option>
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-enter-primary="true"
            >
              {isSubmitting ? "Wird erstellt ..." : "Team erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
