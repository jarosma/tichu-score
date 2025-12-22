import type { Player, PlayerPostRequest } from "../Types";

const hostUrl = import.meta.env.VITE_HOST_URL;
const backendPort = import.meta.env.VITE_BACKEND_PORT;
const BASE_URL = hostUrl + ":" + backendPort;

export async function fetchPlayers(): Promise<Player[]> {
  const res = await fetch(`${BASE_URL}/players`);
  if (!res.ok) throw new Error("Failed to fetch players");
  return res.json();
}

export async function createPlayer(name: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name } as PlayerPostRequest),
  });
  if (!res.ok) throw new Error("Failed to create player");
}
