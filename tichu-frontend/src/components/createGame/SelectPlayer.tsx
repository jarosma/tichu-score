// src/components/splash/select-player.tsx
import { useState } from "react";
import { createPlayer, fetchPlayers } from "@/lib/api/Players";
import type { Player } from "@/lib/Types";
import useSWR, { mutate } from "swr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

interface SelectPlayerProps {
  selectedPlayer: Player | null;
  onSelect: (player: Player) => void;
}

export function SelectPlayer({ selectedPlayer, onSelect }: SelectPlayerProps) {
  const { data: players = [] } = useSWR<Player[]>("/players", fetchPlayers);
  const [newPlayerName, setNewPlayerName] = useState("");

  async function handleAddPlayer() {
    if (!newPlayerName) return;
    await createPlayer(newPlayerName);
    setNewPlayerName("");
    mutate("/players");
  }

  return (
    <div className="space-y-2">
      <Label>Spieler auswählen</Label>
      <select
        value={selectedPlayer?.id || ""}
        onChange={(e) => {
          const p = players.find((p) => p.id === e.target.value);
          if (p) onSelect(p);
        }}
        className="w-full border rounded p-2"
      >
        <option value="">-- Spieler auswählen --</option>
        {players.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      <div className="flex gap-2 mt-1">
        <Input
          placeholder="Neuer Spielername"
          value={newPlayerName}
          onChange={(e) => setNewPlayerName(e.target.value)}
        />
        <Button onClick={handleAddPlayer}>
          <PlusCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
