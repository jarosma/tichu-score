import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Dices, Search, Users } from "lucide-react";
import { mutate } from "swr";
import type { Player, Team } from "@/lib/Types";
import { createTeam } from "@/lib/api/Teams";
import { getApiErrorMessage } from "@/lib/api/client";
import { apiKeys } from "@/lib/api/keys";
import {
  splitPlayersRandomly,
  findTeamForPlayers,
  mergeTeamIntoList,
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
import {
  focusIfConnected,
  focusRefIfConnected,
  type FocusRef,
} from "@/lib/focus";

interface QuickStartDialogProps {
  open: boolean;
  players: Player[];
  teams: Team[];
  onOpenChange: (open: boolean) => void;
  onComplete: (team1: Team, team2: Team) => void;
  openerRef?: FocusRef;
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
  openerRef,
}: QuickStartDialogProps) {
  const [step, setStep] = useState<Step>("players");
  const [search, setSearch] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [pairing, setPairing] = useState<[PlayerPair, PlayerPair] | null>(null);
  const [teamNames, setTeamNames] = useState<[string, string]>(["", ""]);
  const [createdTeams, setCreatedTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);
  const stepHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const teamNameRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [invalidTeamIndexes, setInvalidTeamIndexes] = useState<number[]>([]);
  const activePlayers = useMemo(
    () => players.filter((player) => player.enabled),
    [players],
  );
  const hasEnoughPlayers = activePlayers.length >= 4;
  const reconciledTeams = useMemo(
    () => createdTeams.reduce(mergeTeamIntoList, teams),
    [createdTeams, teams],
  );

  const visiblePlayers = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return activePlayers.filter(
      (player) =>
        !normalizedSearch ||
        player.name.toLocaleLowerCase().includes(normalizedSearch),
    );
  }, [activePlayers, search]);

  const existingTeams = pairing
    ? [
        findTeamForPlayers(reconciledTeams, pairing[0]),
        findTeamForPlayers(reconciledTeams, pairing[1]),
      ]
    : [null, null];
  const missingIndexes = existingTeams
    .map((team, index) => (team ? -1 : index))
    .filter((index) => index >= 0);

  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      focusIfConnected(stepHeadingRef.current);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, step]);

  function togglePlayer(player: Player) {
    if (!hasEnoughPlayers) {
      setError("Für Quick Start brauchst du mindestens vier aktive Spieler.");
      return;
    }
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
    if (!hasEnoughPlayers) {
      setError("Für Quick Start brauchst du mindestens vier aktive Spieler.");
      return;
    }
    if (missingIndexes.length > 0) {
      setError(null);
      setStep("create");
    } else if (existingTeams[0] && existingTeams[1]) {
      onComplete(existingTeams[0], existingTeams[1]);
      onOpenChange(false);
    }
  }

  async function createMissingTeams(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isCreatingRef.current) return;
    if (!pairing) return;
    if (!hasEnoughPlayers) {
      setError("Für Quick Start brauchst du mindestens vier aktive Spieler.");
      return;
    }
    if (missingIndexes.some((index) => !teamNames[index].trim())) {
      const invalidIndexes = missingIndexes.filter(
        (index) => !teamNames[index].trim(),
      );
      setInvalidTeamIndexes(invalidIndexes);
      setError("Bitte gib für jedes neue Team einen Namen ein.");
      focusIfConnected(teamNameRefs.current[invalidIndexes[0]] ?? null);
      return;
    }

    try {
      setError(null);
      setInvalidTeamIndexes([]);
      isCreatingRef.current = true;
      setIsCreating(true);
      const result = [...existingTeams] as [Team | null, Team | null];
      for (const index of missingIndexes) {
        const createdTeam = await createTeam({
          name: teamNames[index].trim(),
          player1Id: pairing[index][0].id,
          player2Id: pairing[index][1].id,
        });
        result[index] = createdTeam;
        setCreatedTeams((previous) => mergeTeamIntoList(previous, createdTeam));
        try {
          await mutate<Team[]>(
            apiKeys.teams,
            (currentTeams) =>
              mergeTeamIntoList(currentTeams ?? [], createdTeam),
            { revalidate: false },
          );
        } catch {
          // The local reconciliation above is sufficient for a safe retry.
        }
      }
      if (result[0] && result[1]) {
        onComplete(result[0], result[1]);
        onOpenChange(false);
      }
    } catch (reason) {
      setError(
        getApiErrorMessage(
          reason,
          "Die neuen Teams konnten nicht erstellt werden.",
        ),
      );
    } finally {
      isCreatingRef.current = false;
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        onCloseAutoFocus={(event) => {
          if (focusRefIfConnected(openerRef)) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle ref={stepHeadingRef} tabIndex={-1}>
            {step === "players"
              ? "Vier Spieler auswählen"
              : step === "pairing"
                ? "Zufällige Teams"
                : "Fehlende Teams erstellen"}
          </DialogTitle>
          <DialogDescription>
            {step === "players"
              ? "Wähle vier aktive Spieler für die Partie aus."
              : step === "pairing"
                ? "Prüfe die zufällige Aufteilung oder ändere die Spielerauswahl."
                : "Diese Spieler-Kombinationen gibt es noch nicht als Teams."}
          </DialogDescription>
        </DialogHeader>

        {!hasEnoughPlayers && (
          <InlineMessage variant="warning">
            Für Quick Start brauchst du mindestens vier aktive Spieler. Aktuell
            sind {activePlayers.length} aktiv.
          </InlineMessage>
        )}
        {error && (
          <InlineMessage id="quick-start-error" variant="error">
            {error}
          </InlineMessage>
        )}

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
                aria-label="Spieler suchen"
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
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Die vier ausgewählten Spieler bleiben erhalten. Du kannst sie
              ändern, bevor du die Teams übernimmst.
            </p>
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
          </div>
        )}

        {step === "create" && pairing && (
          <form className="space-y-4" noValidate onSubmit={createMissingTeams}>
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
                    ref={(element) => {
                      teamNameRefs.current[index] = element;
                    }}
                    id={`quick-team-name-${index}`}
                    value={teamNames[index]}
                    required
                    aria-invalid={invalidTeamIndexes.includes(index)}
                    aria-describedby={error ? "quick-start-error" : undefined}
                    onChange={(event) => {
                      const nextNames = [...teamNames] as [string, string];
                      nextNames[index] = event.target.value;
                      setTeamNames(nextNames);
                      if (event.target.value.trim()) {
                        setInvalidTeamIndexes((previous) =>
                          previous.filter(
                            (invalidIndex) => invalidIndex !== index,
                          ),
                        );
                      }
                    }}
                    autoFocus={index === missingIndexes[0]}
                  />
                </div>
              ),
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep("pairing")}
              >
                Zurück
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Teams werden erstellt ..." : "Teams erstellen"}
              </Button>
            </DialogFooter>
          </form>
        )}

        {step !== "create" && (
          <DialogFooter>
            {step === "players" ? (
              <Button
                type="button"
                disabled={selectedPlayers.length !== 4 || !hasEnoughPlayers}
                onClick={() => {
                  if (pairing) setStep("pairing");
                }}
              >
                Teams aufteilen
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("players")}
                >
                  Spieler ändern
                </Button>
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
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
