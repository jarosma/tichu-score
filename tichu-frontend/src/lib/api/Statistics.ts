import type { PlayerStats, TeamStats } from "../Types";
import { requestJson } from "./client";
import { apiPaths } from "./paths";
import { isStats } from "./validation";

export function fetchPlayerStats(playerId: string): Promise<PlayerStats> {
  return requestJson<PlayerStats>(
    apiPaths.playerStats(playerId),
    undefined,
    isStats,
    "Spielerstatistiken konnten nicht geladen werden.",
  );
}

export function fetchTeamStats(teamId: string): Promise<TeamStats> {
  return requestJson<TeamStats>(
    apiPaths.teamStats(teamId),
    undefined,
    isStats,
    "Teamstatistiken konnten nicht geladen werden.",
  );
}
