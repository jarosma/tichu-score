import { useMemo, useState } from "react";
import { Dices, Search, Users } from "lucide-react";
import { mutate } from "swr";
import type { Player, Team } from "@/lib/Types";
import { createTeam } from "@/lib/api/Teams";
import { apiKeys } from "@/lib/api/keys";
import {
  splitPlayersRandomly,
  findTeamForPlayers,
  type PlayerPair,
} from "@/lib/gameSetup";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuickStartDialogProps {
  open: boolean;
  players: Player[];
  teams: Team[];
  onOpenChange: (open: boolean) => void;
  onComplete: (team1: Team, team2: Team) => void;
}

type Step = "players" | "pairing" | "create";

function playerPairLabel(pair: PlayerPair) {
  return `${pair[0].name} & ${pair[1].name}`;
}

export function QuickStartDialog({
  open,
  players,
  teams,
  onOpenChange,
  onComplete,
}: QuickStartDialogProps) {
  const [step, setStep] = useState<Step>("players");
  const [search, setSearch] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [pairing, setPairing] = useState<[PlayerPair, PlayerPair] | null>(null);
  const [teamNames, setTeamNames] = useState<[string, string]>(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const visiblePlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return players.filter(
      (player) =>
        !normalizedSearch ||
        player.name.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [players, search]);

  const existingTeams = pairing
    ? [
        findTeamForPlayers(teams, pairing[0]),
        findTeamForPlayers(teams, pairing[1]),
      ]
    : [null, null];
  const missingIndexes = existingTeams
    .map((team, index) => (team ? -1 : index))
    .filter((index) => index >= 0);

  function togglePlayer(player: Player) {
    const isSelected = selectedPlayers.some(
      (selected) => selected.id === player.id,
    );
    if (isSelected) {
      const nextPlayers = selectedPlayers.filter(
        (selected) => selected.id !== player.id,
      );
      setSelectedPlayers(nextPlayers);
      setPairing(null);
      setStep("players");
      return;
    }
    if (selectedPlayers.length >= 4) return;
    const nextPlayers = [...selectedPlayers, player];
    setSelectedPlayers(nextPlayers);
    if (nextPlayers.length === 4) {
      const nextPairing = splitPlayersRandomly(nextPlayers);
      setPairing(nextPairing);
      setTeamNames([
        playerPairLabel(nextPairing[0]),
        playerPairLabel(nextPairing[1]),
      ]);
      setStep("pairing");
    }
  }

  function reshuffle() {
    if (!pairing) return;
    const nextPairing = splitPlayersRandomly(selectedPlayers);
    setPairing(nextPairing);
    setTeamNames([
      playerPairLabel(nextPairing[0]),
      playerPairLabel(nextPairing[1]),
    ]);
  }

  function continueWithPairing() {
    if (!pairing) return;
    if (missingIndexes.length > 0) {
      setError(null);
      setStep("create");
    } else if (existingTeams[0] && existingTeams[1]) {
      onComplete(existingTeams[0], existingTeams[1]);
      onOpenChange(false);
    }
  }

  async function createMissingTeams() {
    if (!pairing) return;
    if (missingIndexes.some((index) => !teamNames[index].trim())) {
      setError("Bitte gib für jedes neue Team einen Namen ein.");
      return;
    }

    try {
      setError(null);
      setIsCreating(true);
      const result = [...existingTeams] as [Team | null, Team | null];
      for (const index of missingIndexes) {
        result[index] = await createTeam({
          name: teamNames[index].trim(),
          player1Id: pairing[index][0].id,
          player2Id: pairing[index][1].id,
        });
      }
      await mutate(apiKeys.teams);
      if (result[0] && result[1]) {
        onComplete(result[0], result[1]);
        onOpenChange(false);
      }
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Die neuen Teams konnten nicht erstellt werden.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {step === "players"
              ? "Vier Spieler auswählen"
              : step === "pairing"
                ? "Zufällige Teams"
                : "Fehlende Teams erstellen"}
          </DialogTitle>
          {step === "create" && (
            <DialogDescription>
              Diese Spieler-Kombinationen gibt es noch nicht als Teams.
            </DialogDescription>
          )}
        </DialogHeader>

        {error && <InlineMessage variant="error">{error}</InlineMessage>}

        {step === "players" && (
          <>
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.map((player) => (
                <span
                  key={player.id}
                  className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium"
                >
                  {player.name}
                </span>
              ))}
              {selectedPlayers.length === 0 && (
                <span className="text-sm text-muted-foreground">
                  Noch keine Spieler ausgewählt
                </span>
              )}
            </div>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                className="pl-9"
                placeholder="Spieler suchen ..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" || visiblePlayers.length === 0) {
                    return;
                  }
                  const firstPlayer = document.getElementById(
                    "first-quick-start-player",
                  );
                  if (!firstPlayer) return;
                  event.preventDefault();
                  firstPlayer.focus();
                }}
                autoFocus
              />
            </div>
            <ScrollArea className="h-[min(45vh,20rem)] pr-3">
              <div className="grid gap-2 sm:grid-cols-2">
                {visiblePlayers.map((player, index) => {
                  const isSelected = selectedPlayers.some(
                    (selected) => selected.id === player.id,
                  );
                  return (
                    <Button
                      key={player.id}
                      id={index === 0 ? "first-quick-start-player" : undefined}
                      variant={isSelected ? "default" : "outline"}
                      className="justify-start"
                      aria-pressed={isSelected}
                      onClick={() => togglePlayer(player)}
                    >
                      <Users />
                      {player.name}
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </>
        )}

        {step === "pairing" && pairing && (
          <div className="grid gap-3 sm:grid-cols-2">
            {pairing.map((pair, index) => (
              <div key={index} className="rounded-xl border bg-card p-4">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Team {index + 1}
                </p>
                <p className="mt-2 font-semibold">{playerPairLabel(pair)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {existingTeams[index]
                    ? `Vorhanden: ${existingTeams[index]!.name}`
                    : "Neues Team erforderlich"}
                </p>
              </div>
            ))}
          </div>
        )}

        {step === "create" && pairing && (
          <div className="space-y-4">
            {pairing.map((pair, index) =>
              existingTeams[index] ? (
                <div key={index} className="rounded-xl border bg-muted/30 p-4">
                  <p className="font-medium">{existingTeams[index].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {playerPairLabel(pair)} · wird verwendet
                  </p>
                </div>
              ) : (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`quick-team-name-${index}`}>
                    Team für {playerPairLabel(pair)}
                  </Label>
                  <Input
                    id={`quick-team-name-${index}`}
                    value={teamNames[index]}
                    onChange={(event) => {
                      const nextNames = [...teamNames] as [string, string];
                      nextNames[index] = event.target.value;
                      setTeamNames(nextNames);
                    }}
                    autoFocus={index === missingIndexes[0]}
                  />
                </div>
              ),
            )}
          </div>
        )}

        <DialogFooter>
          {step === "players" ? (
            <Button
              type="button"
              disabled={selectedPlayers.length !== 4}
              onClick={() => {
                if (pairing) setStep("pairing");
              }}
            >
              Teams aufteilen
            </Button>
          ) : step === "pairing" ? (
            <>
              <Button type="button" variant="outline" onClick={reshuffle}>
                <Dices />
                Neu mischen
              </Button>
              <Button type="button" onClick={continueWithPairing}>
                {missingIndexes.length > 0
                  ? "Fehlende Teams erstellen"
                  : "Teams übernehmen"}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("pairing")}
              >
                Zurück
              </Button>
              <Button
                type="button"
                disabled={isCreating}
                onClick={() => void createMissingTeams()}
              >
                {isCreating ? "Teams werden erstellt ..." : "Teams erstellen"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
