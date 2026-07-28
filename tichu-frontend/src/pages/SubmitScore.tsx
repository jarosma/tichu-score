import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Check, CircleAlert } from "lucide-react";
import useSWR, { mutate } from "swr";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchGame } from "@/lib/api/Games";
import { submitScore } from "@/lib/api/Scores";
import type { Game } from "@/lib/Types";
import { TeamScoreDisplay } from "@/components/score/TeamScoreDisplay";
import { TichuNumpad } from "@/components/score/TichuNumpad";
import {
  TichuCallButtons,
  type TichuCallStatus,
} from "@/components/score/TichuCallButtons";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { apiKeys } from "@/lib/api/keys";
import { validateRoundScore } from "@/lib/score";
import { calculateRoundScore } from "@/lib/score";
import { ThemeToggle } from "@/components/ThemeToggle";
import { createRequestKey } from "@/lib/requestKey";

type ActiveTeam = "team1" | "team2";

export function SubmitScore() {
  const { id } = useParams<{ id: string }>();
  const {
    data: game,
    error,
    mutate: refreshGame,
  } = useSWR<Game>(id ? apiKeys.game(id) : null, () => fetchGame(id!));
  const [activeTeam, setActiveTeam] = useState<ActiveTeam>("team1");
  const [replaceNextInput, setReplaceNextInput] = useState(false);
  const [team1Base, setTeam1Base] = useState(0);
  const [team2Base, setTeam2Base] = useState(0);
  const [callStatuses, setCallStatuses] = useState<TichuCallStatus>({});
  const [doubleVictory, setDoubleVictory] = useState<ActiveTeam | null>(null);
  const [hasInput, setHasInput] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [roundKey, setRoundKey] = useState<string | null>(null);

  useEffect(() => {
    if (!hasInput) return;

    function warnBeforeLeaving(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [hasInput]);

  useEffect(() => {
    if (!submitSuccess && !submitError) return;
    const timer = window.setTimeout(() => {
      setSubmitSuccess(false);
      setSubmitError(null);
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [submitError, submitSuccess]);

  if (error) {
    return (
      <ErrorState
        description="Das Spiel konnte nicht geladen werden. Prüfe den Link oder versuche es erneut."
        action={
          <Button variant="outline" onClick={() => void refreshGame()}>
            Erneut versuchen
          </Button>
        }
      />
    );
  }
  if (!game) return <LoadingState label="Spiel wird geladen ..." />;
  if (game.hasEnded && !submitSuccess) {
    return (
      <ErrorState
        title="Spiel bereits beendet"
        description="Für dieses Spiel können keine weiteren Runden eingetragen werden."
      />
    );
  }

  const activeGame = game;
  const team1Players = [activeGame.team1.player1, activeGame.team1.player2];
  const team2Players = [activeGame.team2.player1, activeGame.team2.player2];
  const team1Adjustment = team1Players.reduce(
    (sum, player) =>
      sum +
      (callStatuses[player.id] === true
        ? 100
        : callStatuses[player.id] === false
          ? -100
          : 0),
    0,
  );
  const team2Adjustment = team2Players.reduce(
    (sum, player) =>
      sum +
      (callStatuses[player.id] === true
        ? 100
        : callStatuses[player.id] === false
          ? -100
          : 0),
    0,
  );
  const team1Score = calculateRoundScore(
    doubleVictory ? 0 : team1Base,
    team1Adjustment,
    doubleVictory === "team1",
  );
  const team2Score = calculateRoundScore(
    doubleVictory ? 0 : team2Base,
    team2Adjustment,
    doubleVictory === "team2",
  );
  const isValid = validateRoundScore(team1Score, team2Score, hasInput).valid;

  function resetRound() {
    setTeam1Base(0);
    setTeam2Base(0);
    setCallStatuses({});
    setDoubleVictory(null);
    setHasInput(false);
    setReplaceNextInput(false);
    setSubmitSuccess(false);
    setRoundKey(null);
  }

  function markInput() {
    setRoundKey(null);
    setHasInput(true);
    setSubmitSuccess(false);
    setSubmitError(null);
  }

  function handleCallChange(playerId: string, status: boolean | null) {
    setCallStatuses((previous) => {
      const next = { ...previous };
      if (status === true) {
        Object.keys(next).forEach((id) => {
          if (next[id] === true) next[id] = null;
        });
      }
      next[playerId] = status;
      return next;
    });
    markInput();
  }

  function toggleDoubleVictory(team: ActiveTeam) {
    setDoubleVictory((previous) => (previous === team ? null : team));
    markInput();
  }

  async function handleSubmit() {
    if (!isValid) return;

    const tichuCalls = [...team1Players, ...team2Players]
      .filter(
        (player) =>
          callStatuses[player.id] !== null &&
          callStatuses[player.id] !== undefined,
      )
      .map((player) => ({
        playerId: player.id,
        successful: callStatuses[player.id] === true,
      }));

    try {
      setSubmitError(null);
      setSubmitSuccess(false);
      setIsSubmitting(true);
      const requestKey = roundKey ?? createRequestKey();
      setRoundKey(requestKey);
      await submitScore(activeGame.id, {
        roundKey: requestKey,
        team1Score,
        team2Score,
        tichuCalls,
      });
      resetRound();
      setSubmitSuccess(true);
      try {
        await mutate(apiKeys.game(activeGame.id), undefined, {
          revalidate: true,
        });
      } catch {
        // The round was saved successfully; keep the success state if refresh fails.
      }
    } catch (reason) {
      setSubmitError(
        reason instanceof Error
          ? reason.message
          : "Die Runde konnte nicht gespeichert werden. Deine Eingabe bleibt erhalten.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="h-[100dvh] overflow-hidden bg-background px-2 py-2 text-foreground sm:px-3 sm:py-4">
      <div className="mx-auto flex h-full min-h-0 w-full max-w-md flex-col gap-2">
        <header className="flex shrink-0 items-center justify-between px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Tichu
            </p>
            <p className="text-xs text-muted-foreground">
              Runde {activeGame.scores.rounds.length + 1}
            </p>
          </div>
          <p className="max-w-[12rem] truncate text-right text-xs text-muted-foreground">
            {activeGame.team1.name} gegen {activeGame.team2.name}
          </p>
          <ThemeToggle />
        </header>

        {(submitError || submitSuccess) && (
          <div
            className="fixed top-3 left-3 right-3 z-50 mx-auto flex max-w-md items-center gap-2 rounded-xl border bg-background/95 px-4 py-3 text-sm shadow-lg backdrop-blur"
            role={submitError ? "alert" : "status"}
            aria-live="polite"
          >
            {submitError ? (
              <CircleAlert className="size-4 shrink-0 text-destructive" />
            ) : (
              <Check className="size-4 shrink-0 text-emerald-600" />
            )}
            <span
              className={
                submitError
                  ? "text-destructive"
                  : "text-emerald-700 dark:text-emerald-300"
              }
            >
              {submitError ?? "Runde wurde gespeichert."}
            </span>
          </div>
        )}

        <Card className="min-h-0 flex-1 overflow-hidden">
          <CardContent className="flex h-full min-h-0 flex-col gap-2 p-2 sm:p-3">
            <TeamScoreDisplay
              team1Name={activeGame.team1.name}
              team2Name={activeGame.team2.name}
              team1Score={team1Score}
              team2Score={team2Score}
              team1Adjustment={team1Adjustment}
              team2Adjustment={team2Adjustment}
              doubleVictory={doubleVictory}
              activeTeam={activeTeam}
              onSelectTeam={(team) => {
                setActiveTeam(team);
                setReplaceNextInput(true);
              }}
            />

            <TichuNumpad
              setTeam1Base={setTeam1Base}
              setTeam2Base={setTeam2Base}
              team1Base={team1Base}
              team2Base={team2Base}
              toggleBonus={toggleDoubleVictory}
              activeTeam={activeTeam}
              onClear={resetRound}
              onInput={() => {
                markInput();
              }}
              replaceNextInput={replaceNextInput}
              onInputConsumed={() => setReplaceNextInput(false)}
              disabled={doubleVictory !== null || isSubmitting}
              isSubmitting={isSubmitting}
            />

            <TichuCallButtons
              players={[
                ...team1Players.map((player) => ({
                  player,
                  teamName: activeGame.team1.name,
                })),
                ...team2Players.map((player) => ({
                  player,
                  teamName: activeGame.team2.name,
                })),
              ]}
              statuses={callStatuses}
              disabled={isSubmitting}
              onChange={handleCallChange}
            />

            <Button
              className="mt-auto h-12 w-full text-base"
              disabled={!isValid || isSubmitting}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? "Wird gespeichert ..." : "Runde speichern"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
