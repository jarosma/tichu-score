import type { Game, StartGameRequest } from "../Types";
import { requestJson } from "./client";
import { apiPaths } from "./paths";

export async function startGame(
  team1Id: string,
  team2Id: string,
): Promise<Game> {
  return requestJson<Game>(
    apiPaths.games,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team1Id, team2Id } satisfies StartGameRequest),
    },
    "Das Spiel konnte nicht gestartet werden.",
  );
}

export async function fetchOngoingGames(): Promise<Game[]> {
  return requestJson<Game[]>(
    apiPaths.games,
    undefined,
    "Laufende Spiele konnten nicht geladen werden.",
  );
}

export async function fetchGame(gameId: string): Promise<Game> {
  return requestJson<Game>(
    apiPaths.game(gameId),
    undefined,
    "Das Spiel konnte nicht geladen werden.",
  );
}

export async function endGame(
  gameId: string,
  winner: "team1" | "team2" | "draw",
): Promise<Game> {
  return requestJson<Game>(
    apiPaths.endGame(gameId),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winner }),
    },
    "Das Spiel konnte nicht beendet werden.",
  );
}
