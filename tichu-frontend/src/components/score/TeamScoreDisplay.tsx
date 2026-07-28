import { cn } from "@/lib/utils";

interface Props {
  team1Name: string;
  team2Name: string;
  team1Score: number;
  team2Score: number;
  team1Adjustment: number;
  team2Adjustment: number;
  doubleVictory: "team1" | "team2" | null;
  activeTeam: "team1" | "team2";
  onSelectTeam: (team: "team1" | "team2") => void;
  disabled?: boolean;
}

export function TeamScoreDisplay({
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  team1Adjustment,
  team2Adjustment,
  doubleVictory,
  activeTeam,
  onSelectTeam,
  disabled = false,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <ScoreCard
        name={team1Name}
        score={team1Score}
        adjustment={team1Adjustment}
        active={activeTeam === "team1"}
        special={doubleVictory === "team1"}
        disabled={disabled}
        onSelect={() => onSelectTeam("team1")}
      />
      <ScoreCard
        name={team2Name}
        score={team2Score}
        adjustment={team2Adjustment}
        active={activeTeam === "team2"}
        special={doubleVictory === "team2"}
        disabled={disabled}
        onSelect={() => onSelectTeam("team2")}
      />
    </div>
  );
}

interface ScoreCardProps {
  name: string;
  score: number;
  adjustment: number;
  active: boolean;
  special: boolean;
  disabled: boolean;
  onSelect: () => void;
}

function ScoreCard({
  name,
  score,
  adjustment,
  active,
  special,
  disabled,
  onSelect,
}: ScoreCardProps) {
  const tichuLabel =
    adjustment !== 0 ? `Tichu ${adjustment > 0 ? "+" : ""}${adjustment}` : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "min-w-0 rounded-xl border p-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
      aria-pressed={active}
    >
      <span className="block truncate text-xs font-medium text-muted-foreground">
        {name}
      </span>
      <span className="mt-1 block text-3xl font-bold tracking-tight">
        {score}
      </span>
      <span className="mt-1 block min-h-4 text-xs text-muted-foreground">
        {special && tichuLabel
          ? `Doppelsieg · ${tichuLabel}`
          : special
            ? "Doppelsieg"
            : (tichuLabel ?? " ")}
      </span>
    </button>
  );
}
