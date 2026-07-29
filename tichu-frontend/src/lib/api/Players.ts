import type { Player, PlayerPostRequest } from "../Types";
import { jsonRequest, requestJson, requestVoid } from "./client";
import { apiPaths } from "./paths";
import { isPlayer, isPlayerArray } from "./validation";

export async function fetchPlayers(): Promise<Player[]> {
  return requestJson<Player[]>(
    apiPaths.players,
    undefined,
    isPlayerArray,
    "Spieler konnten nicht geladen werden.",
  );
}

export async function createPlayer(name: string): Promise<Player> {
  return requestJson<Player>(
    apiPaths.players,
    jsonRequest("POST", { name } satisfies PlayerPostRequest),
    isPlayer,
    "Spieler konnte nicht erstellt werden.",
  );
}

export async function updatePlayerStatus(
  playerId: string,
  enabled: boolean,
): Promise<void> {
  return requestVoid(
    apiPaths.player(playerId),
    jsonRequest("PATCH", { enabled }),
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
