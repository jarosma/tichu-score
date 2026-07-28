import type { Player, Team } from "@/lib/Types";

export type TeamPair = readonly [Team, Team];
export type PlayerPair = readonly [Player, Player];

export function areTeamsCompatible(team1: Team, team2: Team) {
  const playerIds = new Set([team1.player1.id, team1.player2.id]);
  return (
    team1.id !== team2.id &&
    !playerIds.has(team2.player1.id) &&
    !playerIds.has(team2.player2.id)
  );
}

export function getCompatiblePairs(teams: Team[]): TeamPair[] {
  const pairs: TeamPair[] = [];
  for (let index = 0; index < teams.length; index += 1) {
    for (let nextIndex = index + 1; nextIndex < teams.length; nextIndex += 1) {
      if (areTeamsCompatible(teams[index], teams[nextIndex])) {
        pairs.push([teams[index], teams[nextIndex]]);
      }
    }
  }
  return pairs;
}

export function splitPlayersRandomly(
  players: Player[],
  random = Math.random,
): [PlayerPair, PlayerPair] {
  const shuffled = [...players];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[nextIndex]] = [
      shuffled[nextIndex],
      shuffled[index],
    ];
  }
  return [
    [shuffled[0], shuffled[1]],
    [shuffled[2], shuffled[3]],
  ];
}

export function findTeamForPlayers(
  teams: Team[],
  players: PlayerPair,
): Team | null {
  const playerIds = new Set(players.map((player) => player.id));
  return (
    teams.find(
      (team) =>
        team.enabled &&
        team.player1.enabled &&
        team.player2.enabled &&
        new Set([team.player1.id, team.player2.id]).size === 2 &&
        playerIds.has(team.player1.id) &&
        playerIds.has(team.player2.id),
    ) ?? null
  );
}
