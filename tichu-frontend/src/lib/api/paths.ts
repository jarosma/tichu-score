export const apiPaths = {
  players: "/players",
  player: (id: string) => `/players/${id}`,
  playerStats: (id: string) => `/players/${id}/stats`,
  teams: "/teams",
  team: (id: string) => `/teams/${id}`,
  teamStats: (id: string) => `/teams/${id}/stats`,
  games: "/games",
  game: (id: string) => `/games/${id}`,
  endGame: (id: string) => `/games/${id}/end`,
  roundResults: (id: string) => `/games/${id}/round-results`,
};
