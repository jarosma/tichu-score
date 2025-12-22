import { useState } from "react";
import type { Player } from "@/lib/Types";
import { createTeam } from "@/lib/api/Teams";
import { createPlayer, fetchPlayers } from "@/lib/api/Players";
import useSWR, { mutate } from "swr";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface CreateTeamFormProps {
  onClose: () => void;
}

export function CreateTeamForm({ onClose }: CreateTeamFormProps) {
  const [teamName, setTeamName] = useState("");
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [creatingPlayer, setCreatingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

  const { data: players = [] } = useSWR<Player[]>("/players", fetchPlayers);

  async function handleCreateTeam() {
    if (!teamName || !player1 || !player2) {
      alert("Teamname und beide Spieler müssen ausgewählt sein");
      return;
    }
    await createTeam({
      name: teamName,
      player1: player1.id,
      player2: player2.id,
    });
    setTeamName("");
    setPlayer1(null);
    setPlayer2(null);
    mutate("/teams");
    onClose();
  }

  async function handleCreatePlayer() {
    if (!newPlayerName) return;
    await createPlayer(newPlayerName);
    setNewPlayerName("");
    setCreatingPlayer(false);
    mutate("/players");
  }

  function handleSelectPlayer(player: Player) {
    // Deselektieren falls schon ausgewählt
    if (player1?.id === player.id) return setPlayer1(null);
    if (player2?.id === player.id) return setPlayer2(null);

    // Ersten freien Slot nehmen
    if (!player1) setPlayer1(player);
    else if (!player2) setPlayer2(player);
  }

  function isDisabled(player: Player) {
    // Spieler kann nicht gleichzeitig in beiden Slots sein
    return player1?.id === player.id || player2?.id === player.id;
  }

  return (
    <Card className="p-4 mt-2">
      <Label>Team Name</Label>
      <Input
        placeholder="Neuer Teamname"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
      />

      <Separator />

      <Label>Spieler auswählen</Label>
      <div className="grid grid-cols-2 gap-2 mt-1">
        {players.map((player) => (
          <Button
            key={player.id}
            variant={
              player1?.id === player.id || player2?.id === player.id
                ? "default"
                : "outline"
            }
            onClick={() => handleSelectPlayer(player)}
            disabled={
              isDisabled(player) &&
              player1?.id !== player.id &&
              player2?.id !== player.id
            }
          >
            {player.name}
          </Button>
        ))}
        {!creatingPlayer && (
          <Button variant="outline" onClick={() => setCreatingPlayer(true)}>
            + Neuer Spieler
          </Button>
        )}
      </div>

      {creatingPlayer && (
        <>
          <Separator />
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Name des neuen Spielers"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
            />
            <Button onClick={handleCreatePlayer}>Erstellen</Button>
            <Button
              variant="secondary"
              onClick={() => setCreatingPlayer(false)}
            >
              Abbrechen
            </Button>
          </div>
        </>
      )}

      <Separator />

      <p className="mt-2">
        Spieler 1: {player1?.name || "–"} | Spieler 2: {player2?.name || "–"}
      </p>

      <div className="flex gap-2 mt-4">
        <Button onClick={handleCreateTeam}>Team erstellen</Button>
        <Button variant="secondary" onClick={onClose}>
          Abbrechen
        </Button>
      </div>
    </Card>
  );
}
