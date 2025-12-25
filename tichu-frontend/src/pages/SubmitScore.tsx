// SubmitScore.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchGame } from "@/lib/api/Games";
import { submitScore } from "@/lib/api/Scores";
import type { Game } from "@/lib/Types";
import { TeamScoreDisplay } from "@/components/score/TeamScoreDisplay";
import { TichuNumpad } from "@/components/score/TichuNumpad";

type ActiveTeam = "team1" | "team2";

export function SubmitScore() {
  const { id } = useParams<{ id: string }>();
  const { data: game, error } = useSWR<Game>(id ? `/games/${id}` : null, () =>
    fetchGame(id!),
  );

  const [activeTeam, setActiveTeam] = useState<ActiveTeam>("team1");

  const [team1Base, setTeam1Base] = useState<number>(0);
  const [team2Base, setTeam2Base] = useState<number>(0);

  const [tichu1, setTichu1] = useState<number>(0);
  const [tichu2, setTichu2] = useState<number>(0);

  const [hasBonus1, setHasBonus1] = useState<boolean>(false);
  const [hasBonus2, setHasBonus2] = useState<boolean>(false);

  if (error) return <div>Fehler beim Laden des Spiels</div>;
  if (!game) return <div>Lade Spiel…</div>;
  if (game.hasEnded) return <div>Kein aktives Spiel gefunden</div>;

  const team1Score = team1Base + tichu1 + (hasBonus1 ? 100 : 0);
  const team2Score = team2Base + tichu2 + (hasBonus2 ? 100 : 0);

  async function handleSubmit() {
    await submitScore(game!.id, { team1Score, team2Score });

    setTeam1Base(0);
    setTeam2Base(0);
    setTichu1(0);
    setTichu2(0);
    setHasBonus1(false);
    setHasBonus2(false);

    await mutate(`/games/${id}`, undefined, { revalidate: true });
  }

  function toggleBonus(team: ActiveTeam) {
    if (team == "team1") {
      setHasBonus1(!hasBonus1);
      setHasBonus2(false);
      if (!hasBonus1) setTeam1Base(100);
    } else {
      setHasBonus2(!hasBonus2);
      setHasBonus1(false);
      if (!hasBonus2) setTeam2Base(100);
    }
  }

  function toggleTichu1(number: number) {
    if (tichu1 === number) {
      setTichu1(0);
    } else {
      setTichu1(number);
    }
  }

  function toggleTichu2(number: number) {
    if (tichu2 === number) {
      setTichu2(0);
    } else {
      setTichu2(number);
    }
  }

  return (
    <Card className="flex flex-col h-[80%] justify-between p-4 gap-4 w-full max-w-md mx-auto">
      <TeamScoreDisplay
        team1Name={game.team1.name}
        team2Name={game.team2.name}
        team1Base={team1Base}
        team2Base={team2Base}
        tichu1={tichu1}
        tichu2={tichu2}
        hasBonus1={hasBonus1}
        hasBonus2={hasBonus2}
        activeTeam={activeTeam}
        onSelectTeam={setActiveTeam}
      />

      <TichuNumpad
        setTeam1Base={setTeam1Base}
        setTeam2Base={setTeam2Base}
        team1Base={team1Base}
        team2Base={team2Base}
        toggleTichu1={toggleTichu1}
        toggleTichu2={toggleTichu2}
        toggleBonus={toggleBonus}
        activeTeam={activeTeam}
        onClear={() => {
          setTeam1Base(0);
          setTeam2Base(0);
          setTichu1(0);
          setTichu2(0);
          setHasBonus1(false);
          setHasBonus2(false);
        }}
      />

      <Button
        className="w-full h-14 text-lg"
        disabled={team1Base == 0 && team2Base == 0}
        onClick={handleSubmit}
      >
        Runde speichern
      </Button>
    </Card>
  );
}
