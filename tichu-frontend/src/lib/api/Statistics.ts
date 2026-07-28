import type { PlayerStats, TeamStats } from "../Types";
import { requestJson } from "./client";
import { apiPaths } from "./paths";

export function fetchPlayerStats(playerId: string): Promise<PlayerStats> {
  return requestJson<PlayerStats>(
    apiPaths.playerStats(playerId),
    undefined,
    "Spielerstatistiken konnten nicht geladen werden.",
  );
}

export function fetchTeamStats(teamId: string): Promise<TeamStats> {
  return requestJson<TeamStats>(
    apiPaths.teamStats(teamId),
    undefined,
    "Teamstatistiken konnten nicht geladen werden.",
  );
}
