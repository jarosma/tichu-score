import type { Game } from "@/lib/Types";

export function getGameRefreshInterval(
  latestGame?: Pick<Game, "hasEnded" | "pendingFinish">,
): number {
  if (latestGame?.hasEnded) return 0;
  return latestGame?.pendingFinish ? 2000 : 5000;
}
