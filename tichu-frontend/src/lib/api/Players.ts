import type { Player, PlayerPostRequest } from "../Types";

const hostIp = import.meta.env.VITE_HOST_IP;
const BASE_URL = "http://" + hostIp + ":8080";

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
