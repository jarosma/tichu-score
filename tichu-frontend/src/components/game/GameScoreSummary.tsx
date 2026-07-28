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
  const endedResult = game.hasEnded
    ? game.winner === "team1"
      ? `Sieger: ${game.team1.name}`
      : game.winner === "team2"
        ? `Sieger: ${game.team2.name}`
        : game.winner === "draw"
          ? "Unentschieden"
          : "Ergebnis nicht verfügbar"
    : null;
  const team1Status = game.hasEnded
    ? game.winner === "team1"
      ? "Sieger"
      : undefined
    : totalTeam1 > totalTeam2
      ? "Führend"
      : undefined;
  const team2Status = game.hasEnded
    ? game.winner === "team2"
      ? "Sieger"
      : undefined
    : totalTeam2 > totalTeam1
      ? "Führend"
      : undefined;

  return (
    <div className="grid shrink-0 gap-2 sm:gap-4">
      {game.hasEnded && (
        <div
          className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 sm:px-4 sm:py-3"
          role="status"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Spiel beendet
          </p>
          <p className="mt-1 text-sm font-medium sm:text-base">{endedResult}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <ScoreCard team={game.team1} score={totalTeam1} status={team1Status} />
        <ScoreCard team={game.team2} score={totalTeam2} status={team2Status} />
      </div>
    </div>
  );
}

interface ScoreCardProps {
  team: Game["team1"];
  score: number;
  status?: "Führend" | "Sieger";
}

function ScoreCard({ team, score, status }: ScoreCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm sm:p-8",
        status && "border-primary ring-1 ring-primary/20",
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
        {status && (
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {status}
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
