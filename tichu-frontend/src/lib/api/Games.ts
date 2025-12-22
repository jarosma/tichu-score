import type { Game } from "../Types";

const hostUrl = import.meta.env.VITE_HOST_URL;
const backendPort = import.meta.env.VITE_BACKEND_PORT;
const BASE_URL = hostUrl + ":" + backendPort;

export async function startGame(
  team1Id: string,
  team2Id: string,
): Promise<Game> {
  const res = await fetch(`${BASE_URL}/games/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ team1: team1Id, team2: team2Id }),
  });

  if (!res.ok) throw new Error("Failed to start game");

  return res.json() as Promise<Game>;
}

export async function fetchGame(gameId: string) {
  const res = await fetch(`${BASE_URL}/games/spectate/${gameId}`);
  if (!res.ok) throw new Error("Fehler beim Laden des Spiels");
  return res.json();
}

export async function endGame(
  gameId: string,
  winner: "team1" | "team2",
): Promise<void> {
  const res = await fetch(`${BASE_URL}/games/end/${gameId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ winner }),
  });

  if (!res.ok) throw new Error("Fehler beim Beenden des Spiels");
}
