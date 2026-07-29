import type { Team, TeamCreateRequest } from "../Types";
import { jsonRequest, requestJson, requestVoid } from "./client";
import { apiPaths } from "./paths";
import { isTeam, isTeamArray } from "./validation";

export async function fetchTeams(): Promise<Team[]> {
  return requestJson<Team[]>(
    apiPaths.teams,
    undefined,
    isTeamArray,
    "Teams konnten nicht geladen werden.",
  );
}

export async function createTeam(req: TeamCreateRequest): Promise<Team> {
  return requestJson<Team>(
    apiPaths.teams,
    jsonRequest("POST", req),
    isTeam,
    "Team konnte nicht erstellt werden.",
  );
}

export async function updateTeamStatus(
  teamId: string,
  enabled: boolean,
): Promise<void> {
  return requestVoid(
    apiPaths.team(teamId),
    jsonRequest("PATCH", { enabled }),
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
