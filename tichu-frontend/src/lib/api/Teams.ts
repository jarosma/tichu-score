import type { Team, TeamCreateRequest } from "../types";

const BASE_URL = "http://localhost:8080";

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
