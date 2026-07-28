import type { Team, TeamCreateRequest } from "../Types";
import { requestJson, requestVoid } from "./client";
import { apiPaths } from "./paths";

export async function fetchTeams(): Promise<Team[]> {
  return requestJson<Team[]>(
    apiPaths.teams,
    undefined,
    "Teams konnten nicht geladen werden.",
  );
}

export async function createTeam(req: TeamCreateRequest): Promise<Team> {
  return requestJson<Team>(
    apiPaths.teams,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    },
    "Team konnte nicht erstellt werden.",
  );
}

export async function fetchTeam(teamId: string): Promise<Team> {
  return requestJson<Team>(
    apiPaths.team(teamId),
    undefined,
    "Team konnte nicht geladen werden.",
  );
}

export async function updateTeamStatus(
  teamId: string,
  enabled: boolean,
): Promise<void> {
  return requestVoid(
    apiPaths.team(teamId),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled }),
    },
    "Teamstatus konnte nicht geändert werden.",
  );
}

export async function deleteTeam(teamId: string): Promise<void> {
  return requestVoid(
    apiPaths.team(teamId),
    { method: "DELETE" },
    "Team konnte nicht gelöscht werden.",
  );
}
