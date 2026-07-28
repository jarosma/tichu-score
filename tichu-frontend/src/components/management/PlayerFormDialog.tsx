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
import { createPlayer } from "@/lib/api/Players";
import type { Player } from "@/lib/Types";

interface PlayerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (player: Player) => void;
}

export function PlayerFormDialog({
  open,
  onOpenChange,
  onCreated,
}: PlayerFormDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function close() {
    setName("");
    setError(null);
    onOpenChange(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Bitte gib einen Namen ein.");
      return;
    }
    if (trimmedName.length > 64) {
      setError("Der Name darf maximal 64 Zeichen enthalten.");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      const player = await createPlayer(trimmedName);
      onCreated(player);
      close();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Spieler konnte nicht erstellt werden.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Spieler erstellen</DialogTitle>
          <DialogDescription>
            Der Spieler kann anschließend für neue Teams verwendet werden.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <InlineMessage variant="error">{error}</InlineMessage>}
          <div className="space-y-2">
            <Label htmlFor="player-name">Name</Label>
            <Input
              id="player-name"
              value={name}
              maxLength={64}
              onChange={(event) => setName(event.target.value)}
              autoFocus
            />
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
              {isSubmitting ? "Wird erstellt ..." : "Spieler erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
