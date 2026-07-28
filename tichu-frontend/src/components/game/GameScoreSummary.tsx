import { cn } from "@/lib/utils";
import type { Game } from "@/lib/Types";

interface GameScoreSummaryProps {
  game: Game;
}

export function GameScoreSummary({ game }: GameScoreSummaryProps) {
  const totalTeam1 = game.scores.rounds.reduce(
    (sum, round) => sum + round.team1,
    0,
  );
  const totalTeam2 = game.scores.rounds.reduce(
    (sum, round) => sum + round.team2,
    0,
  );

  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 sm:gap-4">
      <ScoreCard
        team={game.team1}
        score={totalTeam1}
        leading={totalTeam1 > totalTeam2}
      />
      <ScoreCard
        team={game.team2}
        score={totalTeam2}
        leading={totalTeam2 > totalTeam1}
      />
    </div>
  );
}

interface ScoreCardProps {
  team: Game["team1"];
  score: number;
  leading: boolean;
}

function ScoreCard({ team, score, leading }: ScoreCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm sm:p-8",
        leading && "border-primary ring-1 ring-primary/20",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold sm:text-2xl">
            {team.name}
          </h2>
          <p className="mt-1 truncate text-xs text-muted-foreground sm:text-base">
            {team.player1.name} & {team.player2.name}
          </p>
        </div>
        {leading && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            Führend
          </span>
        )}
      </div>
      <p className="mt-5 text-5xl font-bold tracking-tight sm:mt-10 sm:text-7xl">
        {score}
      </p>
      <p className="mt-1 text-sm text-muted-foreground sm:text-base">
        Punkte gesamt
      </p>
    </div>
  );
}
