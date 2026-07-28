import { useRef, useState } from "react";
import type { Player } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { focusIfConnected } from "@/lib/focus";
import { cn } from "@/lib/utils";

export type TichuCallStatus = Record<string, boolean | null>;

interface TichuCallButtonsProps {
  players: Array<{ player: Player; teamName: string }>;
  statuses: TichuCallStatus;
  disabled?: boolean;
  onChange: (playerId: string, status: boolean | null) => void;
}

export function TichuCallButtons({
  players,
  statuses,
  disabled = false,
  onChange,
}: TichuCallButtonsProps) {
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const hasSuccessfulCall = Object.values(statuses).some(
    (status) => status === true,
  );

  function closeDialog() {
    setPendingStatus(null);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2 border-t pt-2">
        <Button
          type="button"
          variant="outline"
          className="h-10 whitespace-normal border-emerald-500/40 px-2 text-xs text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
          disabled={disabled}
          onClick={(event) => {
            openerRef.current = event.currentTarget;
            setPendingStatus(true);
          }}
        >
          Tichu gewonnen
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-10 whitespace-normal border-destructive/40 px-2 text-xs text-destructive hover:bg-destructive/10"
          disabled={disabled}
          onClick={(event) => {
            openerRef.current = event.currentTarget;
            setPendingStatus(false);
          }}
        >
          Tichu verloren
        </Button>
      </div>

      <Dialog
        open={pendingStatus !== null}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent
          className="sm:max-w-md"
          onCloseAutoFocus={(event) => {
            if (focusIfConnected(openerRef.current)) event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle>Wer?</DialogTitle>
            <DialogDescription>
              Wähle den Spieler aus, der den Tichu gerufen hat.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 sm:grid-cols-2">
            {players.map(({ player, teamName }) => {
              const status = statuses[player.id] ?? null;
              const isCurrent = status === pendingStatus;
              const isOtherSuccessful =
                pendingStatus === true && hasSuccessfulCall && status !== true;
              return (
                <Button
                  key={player.id}
                  type="button"
                  variant={isCurrent ? "default" : "outline"}
                  className={cn(
                    "h-auto justify-start py-3 text-left",
                    isOtherSuccessful && "opacity-60",
                  )}
                  disabled={disabled}
                  onClick={() => {
                    onChange(player.id, isCurrent ? null : pendingStatus);
                    closeDialog();
                  }}
                >
                  <span>
                    <span className="block font-medium">{player.name}</span>
                    <span className="block text-xs opacity-70">{teamName}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
