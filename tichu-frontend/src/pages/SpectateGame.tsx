import { useLocation, useParams } from "react-router-dom";
import useSWR from "swr";
import { fetchGame, endGame } from "@/lib/api/Games";
import type { Game } from "@/lib/Types";
import { GameScore } from "@/components/game/GameScore";
import { GameQrDialog } from "@/components/game/GameQrDialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getScoreUrl } from "@/lib/config";
import { apiKeys } from "@/lib/api/keys";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

interface SpectateGameProps {
  newGame?: Game;
}

interface SpectateLocationState {
  newGame?: Game;
}

export function SpectateGame({ newGame }: SpectateGameProps) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const stateGame = (location.state as SpectateLocationState | null)?.newGame;
  const initialGame = newGame ?? stateGame;
  const [endGameAt1000, setEndGameAt1000] = useState(true);
  const [isEndDialogOpen, setIsEndDialogOpen] = useState(false);
  const [endDialogMode, setEndDialogMode] = useState<"automatic" | "manual">(
    "manual",
  );
  const [pendingWinner, setPendingWinner] = useState<
    "team1" | "team2" | "draw" | null
  >(null);
  const [endError, setEndError] = useState<string | null>(null);
  const [isEnding, setIsEnding] = useState(false);

  const {
    data: fetchedGame,
    error,
    mutate: refreshGame,
  } = useSWR<Game>(id ? apiKeys.game(id) : null, () => fetchGame(id!), {
    refreshInterval: (latestGame) => (latestGame?.hasEnded ? 0 : 2000),
    fallbackData: initialGame,
  });

  const game = fetchedGame ?? initialGame;

  const submitScoreUrl = game ? getScoreUrl(game.id) : "";

  useEffect(() => {
    if (!game || game!.hasEnded || !endGameAt1000) return;

    const totalTeam1 = game.scores.rounds.reduce((acc, r) => acc + r.team1, 0);
    const totalTeam2 = game.scores.rounds.reduce((acc, r) => acc + r.team2, 0);

    if ((totalTeam1 >= 1000 || totalTeam2 >= 1000) && endGameAt1000) {
      const winner =
        totalTeam1 === totalTeam2
          ? "draw"
          : totalTeam1 > totalTeam2
            ? "team1"
            : "team2";

      const timer = setTimeout(() => {
        setPendingWinner(winner);
        setEndDialogMode("automatic");
        setIsEndDialogOpen(true);
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [game, endGameAt1000, id]);

  if (error && !game) {
    return (
      <ErrorState
        description="Das Spiel konnte nicht geladen werden."
        action={
          <Button variant="outline" onClick={() => void refreshGame()}>
            Erneut versuchen
          </Button>
        }
      />
    );
  }
  if (!game) return <LoadingState label="Spiel wird geladen ..." />;
  const activeGame = game;

  function openManualEndDialog() {
    const totalTeam1 = activeGame.scores.rounds.reduce(
      (acc, r) => acc + r.team1,
      0,
    );
    const totalTeam2 = activeGame.scores.rounds.reduce(
      (acc, r) => acc + r.team2,
      0,
    );
    setPendingWinner(
      totalTeam1 === totalTeam2
        ? "draw"
        : totalTeam1 > totalTeam2
          ? "team1"
          : "team2",
    );
    setEndDialogMode("manual");
    setIsEndDialogOpen(true);
  }

  async function confirmEndGame() {
    if (!pendingWinner) return;

    try {
      setEndError(null);
      setIsEnding(true);
      const endedGame = await endGame(activeGame.id, pendingWinner);
      setIsEndDialogOpen(false);
      setEndGameAt1000(false);
      await refreshGame(endedGame, { revalidate: false });
    } catch {
      setEndError(
        "Das Spiel konnte nicht beendet werden. Bitte versuche es erneut.",
      );
    } finally {
      setIsEnding(false);
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      <header className="shrink-0 text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Spiel anschauen
        </h1>
        <p className="mt-1 truncate text-sm text-muted-foreground sm:text-base">
          {activeGame.team1.name} gegen {activeGame.team2.name}
        </p>
      </header>
      {(endError || error) && (
        <div
          className="pointer-events-none fixed top-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-destructive/30 bg-background/95 px-4 py-3 text-sm text-destructive shadow-lg backdrop-blur"
          role="alert"
        >
          {endError ??
            "Die Verbindung ist unterbrochen. Der letzte bekannte Spielstand wird angezeigt."}
        </div>
      )}
      <div className="flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden">
        <GameScore game={activeGame} />
      </div>

      {!activeGame.hasEnded && <GameQrDialog submitScoreUrl={submitScoreUrl} />}

      {!activeGame.hasEnded && (
        <Button
          variant="ghost"
          size="sm"
          className="h-auto self-center px-2 py-1 text-xs font-normal text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
          onClick={openManualEndDialog}
          disabled={isEnding}
        >
          Spiel beenden
        </Button>
      )}

      <ConfirmDialog
        open={isEndDialogOpen}
        onOpenChange={(open) => {
          setIsEndDialogOpen(open);
          if (!open && endDialogMode === "automatic") {
            setEndGameAt1000(false);
          }
        }}
        title="Spiel beenden?"
        description={
          endDialogMode === "automatic"
            ? "Ein Team hat 1000 Punkte erreicht. Möchtest du das Spiel jetzt beenden?"
            : "Möchtest du das laufende Spiel wirklich beenden?"
        }
        confirmLabel={isEnding ? "Wird beendet ..." : "Spiel beenden"}
        onConfirm={confirmEndGame}
        destructive
      />
    </div>
  );
}
