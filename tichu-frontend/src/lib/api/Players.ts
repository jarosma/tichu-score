import type { Player, PlayerPostRequest } from "../Types";
import { requestJson, requestVoid } from "./client";
import { apiPaths } from "./paths";

export async function fetchPlayers(): Promise<Player[]> {
  return requestJson<Player[]>(
    apiPaths.players,
    undefined,
    "Spieler konnten nicht geladen werden.",
  );
}

export async function createPlayer(name: string): Promise<Player> {
  return requestJson<Player>(
    apiPaths.players,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name } satisfies PlayerPostRequest),
    },
    "Spieler konnte nicht erstellt werden.",
  );
}

export async function fetchPlayer(playerId: string): Promise<Player> {
  return requestJson<Player>(
    apiPaths.player(playerId),
    undefined,
    "Spieler konnte nicht geladen werden.",
  );
}

export async function updatePlayerStatus(
  playerId: string,
  enabled: boolean,
): Promise<void> {
  return requestVoid(
    apiPaths.player(playerId),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    },
    "Spielerstatus konnte nicht geändert werden.",
  );
}

export async function deletePlayer(playerId: string): Promise<void> {
  return requestVoid(
    apiPaths.player(playerId),
    { method: "DELETE" },
    "Spieler konnte nicht gelöscht werden.",
  );
}
