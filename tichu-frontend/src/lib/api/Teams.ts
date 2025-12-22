import type { Team, TeamCreateRequest } from "../Types";

const hostUrl = import.meta.env.VITE_HOST_URL;
const backendPort = import.meta.env.VITE_BACKEND_PORT;
const BASE_URL = hostUrl + ":" + backendPort;

export async function fetchTeams(): Promise<Team[]> {
  const res = await fetch(`${BASE_URL}/teams`);
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export async function createTeam(req: TeamCreateRequest): Promise<void> {
  const res = await fetch(`${BASE_URL}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error("Failed to create team");
}
