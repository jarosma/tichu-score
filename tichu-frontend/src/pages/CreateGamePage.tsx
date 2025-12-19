import { useState } from "react";
import type { Team } from "@/lib/Types";
import { startGame } from "@/lib/api/Games";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SelectTeam } from "@/components/createGame/SelectTeam";
import { CreateTeamForm } from "@/components/createGame/CreateTeamForm";
import { useNavigate } from "react-router-dom";

export function CreateGamePage() {
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const navigate = useNavigate();

  function handleSelectTeam(slot: 1 | 2, team: Team) {
    if (slot === 1) {
      setTeam1((prev) => (prev?.id === team.id ? null : team));
      if (team2?.id === team.id) setTeam2(null);
    } else {
      setTeam2((prev) => (prev?.id === team.id ? null : team));
      if (team1?.id === team.id) setTeam1(null);
    }
  }

  async function handleStartGame() {
    if (!team1 || !team2) {
      alert("Bitte wähle beide Teams aus");
      return;
    }

    try {
      const data = await startGame(team1.id, team2.id);
      console.log(data);
      const gameId = data.id;
      navigate(`/spectate/${gameId}`, { state: { newGame: data } });
    } catch (e) {
      console.log(e);
      alert("Fehler beim Starten des Spiels");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-background space-y-4">
      <Card className="w-full max-w-xl shadow-lg">
        <CardHeader>
          <CardTitle>Neues Tichu Spiel Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {creatingTeam && (
            <CreateTeamForm onClose={() => setCreatingTeam(false)} />
          )}

          {!creatingTeam && (
            <>
              <Button variant="outline" onClick={() => setCreatingTeam(true)}>
                Neues Team erstellen
              </Button>
              <SelectTeam
                title="Team 1"
                selectedTeam={team1}
                onSelect={(team) => handleSelectTeam(1, team)}
                occupiedPlayers={team2 ? [team2.player1, team2.player2] : []}
              />
              <SelectTeam
                title="Team 2"
                selectedTeam={team2}
                onSelect={(team) => handleSelectTeam(2, team)}
                occupiedPlayers={team1 ? [team1.player1, team1.player2] : []}
              />

              <div className="flex justify-end">
                <Button onClick={handleStartGame} disabled={!team1 || !team2}>
                  Spiel starten
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
