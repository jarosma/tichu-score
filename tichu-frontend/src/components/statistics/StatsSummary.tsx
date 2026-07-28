import type { PlayerStats, TeamStats } from "@/lib/Types";
import { StatsMetricCard } from "@/components/statistics/StatsMetricCard";

interface StatsSummaryProps {
  stats: PlayerStats | TeamStats;
}

export function StatsSummary({ stats }: StatsSummaryProps) {
  const winRate =
    stats.totalGamesPlayed === 0
      ? 0
      : Math.round((stats.totalWins / stats.totalGamesPlayed) * 100);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatsMetricCard label="Spiele gespielt" value={stats.totalGamesPlayed} />
      <StatsMetricCard label="Siege" value={stats.totalWins} />
      <StatsMetricCard label="Niederlagen" value={stats.totalLosses} />
      <StatsMetricCard label="Erfolgsquote" value={`${winRate} %`} />
      <StatsMetricCard
        label="Erfolgreiche Tichus"
        value={stats.successfulTichus}
      />
      <StatsMetricCard
        label="Fehlgeschlagene Tichus"
        value={stats.unsuccessfulTichus}
      />
      <StatsMetricCard
        label="Höchster Gewinnvorsprung"
        value={
          stats.highestPointDiffWin === null
            ? "Noch nicht vorhanden"
            : `${stats.highestPointDiffWin} Punkte`
        }
      />
    </div>
  );
}
