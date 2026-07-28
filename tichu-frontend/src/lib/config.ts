const configuredPublicUrl = import.meta.env.VITE_PUBLIC_URL as
  | string
  | undefined;

export const PUBLIC_URL = (
  configuredPublicUrl || window.location.origin
).replace(/\/$/, "");

export function getScoreUrl(gameId: string) {
  return `${PUBLIC_URL}/game/${gameId}/score`;
}
