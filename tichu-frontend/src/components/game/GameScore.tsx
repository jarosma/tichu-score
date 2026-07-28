import type { Game } from "@/lib/Types";
import { GameScoreSummary } from "@/components/game/GameScoreSummary";
import { RoundHistory } from "@/components/game/RoundHistory";

interface GameScoreProps {
  game: Game;
}

export function GameScore({ game }: GameScoreProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <GameScoreSummary game={game} />
      <RoundHistory game={game} />
    </div>
  );
}
