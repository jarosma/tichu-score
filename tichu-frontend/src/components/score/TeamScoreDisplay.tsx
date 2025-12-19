import { cn } from "@/lib/utils";

interface Props {
  team1Name: string;
  team2Name: string;

  team1Base: number;
  team2Base: number;

  tichu1: number;
  tichu2: number;

  hasBonus1: boolean;
  hasBonus2: boolean;

  activeTeam: "team1" | "team2";
  onSelectTeam: (team: "team1" | "team2") => void;
}

export function TeamScoreDisplay({
  team1Name,
  team2Name,
  team1Base,
  team2Base,
  tichu1,
  tichu2,
  hasBonus1,
  hasBonus2,
  activeTeam,
  onSelectTeam,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onSelectTeam("team1")}
        className={cn(
          "rounded-lg text-center border transition h-32",
          activeTeam === "team1"
            ? "border-primary bg-primary/10"
            : "border-border",
        )}
      >
        <div className="text-sm opacity-70">{team1Name}</div>
        <div className="text-3xl font-bold">{team1Base}</div>
        {tichu1 !== 0 && (
          <div className="text-sm opacity-60 mt-1">
            Tichu {tichu1 > 0 ? "+100" : "−100"}
          </div>
        )}
        {hasBonus1 && (
          <div className="text-sm opacity-60 mt-1">Doppel-Sieg + 100</div>
        )}
      </button>

      <button
        onClick={() => onSelectTeam("team2")}
        className={cn(
          "rounded-lg text-center border transition h-32",
          activeTeam === "team2"
            ? "border-primary bg-primary/10"
            : "border-border",
        )}
      >
        <div className="text-sm opacity-70">{team2Name}</div>
        <div className="text-3xl font-bold">{team2Base}</div>
        {tichu2 !== 0 && (
          <div className="text-sm opacity-60 mt-1">
            Tichu {tichu2 > 0 ? "+100" : "−100"}
          </div>
        )}
        {hasBonus2 && (
          <div className="text-sm opacity-60 mt-1">Doppel-Sieg + 100</div>
        )}
      </button>
    </div>
  );
}
