import { useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { fetchGame, endGame } from "@/lib/api/Games";
import type { Game } from "@/lib/Types";
import { GameScore } from "@/components/game/GameScore";
import { GameQrDialog } from "@/components/game/GameQrDialog";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SpectateGameProps {
  newGame?: Game;
}

export function SpectateGame({ newGame }: SpectateGameProps) {
  const { id } = useParams<{ id: string }>();
  const [endGameAt1000, setEndGameAt1000] = useState(true);

  const { data: fetchedGame, error } = useSWR<Game>(
    !newGame && id ? `/games/${id}` : null,
    () => fetchGame(id!),
    { refreshInterval: 2000 },
  );

  const game = newGame || fetchedGame;

  const hostIp = import.meta.env.VITE_HOST_IP;
  const hostPort = import.meta.env.VITE_HOST_PORT;

  const submitScoreUrl = `http://${hostIp}:${hostPort}/score/${game?.id}`;

  useEffect(() => {
    if (!game || game!.hasEnded || !endGameAt1000) return;

    const totalTeam1 = game.scores.rounds.reduce((acc, r) => acc + r.team1, 0);
    const totalTeam2 = game.scores.rounds.reduce((acc, r) => acc + r.team2, 0);

    if ((totalTeam1 >= 1000 || totalTeam2 >= 1000) && endGameAt1000) {
      const winner = totalTeam1 > totalTeam2 ? "team1" : "team2";

      const timer = setTimeout(async () => {
        if (
          confirm(
            "Ein Team hat 1000 Punkte erreicht. Möchtest du das Spiel beenden?",
          )
        ) {
          await endGame(game.id, winner);
        } else {
          setEndGameAt1000(false);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [game, endGameAt1000, id]);

  if (error) return <div>Fehler beim Laden des Spiels</div>;
  if (!game) return <div>Lade Spiel…</div>;

  async function endGameManually() {
    const totalTeam1 = game!.scores.rounds.reduce((acc, r) => acc + r.team1, 0);
    const totalTeam2 = game!.scores.rounds.reduce((acc, r) => acc + r.team2, 0);
    const winner = totalTeam1 > totalTeam2 ? "team1" : "team2";
    if (confirm("Spiel wirklich beenden?")) {
      await endGame(game!.id, winner);
      mutate(`/games/${id}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-background space-y-4">
      <GameScore game={game} />

      <GameQrDialog submitScoreUrl={submitScoreUrl} />
      {!endGameAt1000 && !game!.hasEnded && (
        <Button variant="destructive" onClick={endGameManually}>
          Spiel beenden
        </Button>
      )}
    </div>
  );
}
