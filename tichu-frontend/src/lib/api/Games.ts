import type { Game, StartGameRequest } from "../Types";
import { jsonRequest, requestJson } from "./client";
import { apiPaths } from "./paths";
import { isGame, isGameArray } from "./validation";

export async function startGame(
  team1Id: string,
  team2Id: string,
  idempotencyKey: string,
): Promise<Game> {
  return requestJson<Game>(
    apiPaths.games,
    jsonRequest("POST", {
      idempotencyKey,
      team1Id,
      team2Id,
    } satisfies StartGameRequest),
    isGame,
    "Das Spiel konnte nicht gestartet werden.",
  );
}

export async function fetchOngoingGames(): Promise<Game[]> {
  return requestJson<Game[]>(
    apiPaths.games,
    undefined,
    isGameArray,
    "Laufende Spiele konnten nicht geladen werden.",
  );
}

export async function fetchGame(gameId: string): Promise<Game> {
  return requestJson<Game>(
    apiPaths.game(gameId),
    undefined,
    isGame,
    "Das Spiel konnte nicht geladen werden.",
  );
}

export async function endGame(
  gameId: string,
  winner: "team1" | "team2" | "draw",
): Promise<Game> {
  return requestJson<Game>(
    apiPaths.endGame(gameId),
    jsonRequest("POST", { winner }),
    isGame,
    "Das Spiel konnte nicht beendet werden.",
  );
}
