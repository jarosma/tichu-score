import { cn } from "@/lib/utils";

interface StatisticsTabsProps {
  value: "players" | "teams";
  onChange: (value: "players" | "teams") => void;
}

export function StatisticsTabs({ value, onChange }: StatisticsTabsProps) {
  return (
    <fieldset className="flex gap-1 border-b">
      <legend className="sr-only">Statistiktyp</legend>
      {(
        [
          ["players", "Spieler"],
          ["teams", "Teams"],
        ] as const
      ).map(([tab, label]) => (
        <button
          key={tab}
          type="button"
          aria-pressed={value === tab}
          onClick={() => onChange(tab)}
          className={cn(
            "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
            value === tab
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </fieldset>
  );
}
