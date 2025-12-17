import type { Game } from "../types";

const BASE_URL = "http://localhost:8080";

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
