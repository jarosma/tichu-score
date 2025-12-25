import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TichuNumpadProps {
  toggleTichu1: (score: number) => void;
  toggleTichu2: (score: number) => void;
  setTeam1Base: (score: number) => void;
  setTeam2Base: (score: number) => void;
  team1Base: number;
  team2Base: number;
  toggleBonus: (team: "team1" | "team2") => void;
  activeTeam: "team1" | "team2";
  onClear: () => void;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function TichuNumpad({
  toggleTichu1,
  toggleTichu2,
  setTeam1Base,
  setTeam2Base,
  team1Base,
  team2Base,
  toggleBonus,
  activeTeam,
  onClear,
}: TichuNumpadProps) {
  function addDigit(digit: string) {
    if (activeTeam == "team1") {
      const next = Number(`${team1Base ?? ""}${digit}`);
      if (next > 125) return;
      setTeam1Base(next);
      updateOther(next);
    } else {
      const next = Number(`${team2Base ?? ""}${digit}`);
      if (next > 125) return;
      setTeam2Base(next);
      updateOther(next);
    }
  }

  function onNegative() {
     if (activeTeam == "team1") {
        setTeam1Base(0 - team1Base);
        updateOther(0 - team1Base)
      } else {
        setTeam2Base(0 - team2Base);
        updateOther(0 - team2Base)
      }
  }

  function updateOther(score: number) {
    if (activeTeam == "team1") {
      setTeam2Base(100 - score);
    } else {
      setTeam1Base(100 - score);
    }
  }

  function handleBonusClick() {
    toggleBonus(activeTeam);
  }

  function handleTichu(number: number) {
    if (activeTeam == "team1") {
      toggleTichu1(number);
    } else {
      toggleTichu2(number);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key >= "1" && e.key <= "9") addDigit(e.key);
    else if (e.key === "0") addDigit("0");
  }

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [team1Base, team2Base]);

  return (
    <div className="space-y-2 w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((k) => (
          <Button
            key={k}
            variant="outline"
            className="h-14 text-xl"
            onClick={() => addDigit(k)}
          >
            {k}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          className="h-14"
          onClick={() => onNegative()}
        >
          -
        </Button>
        <Button
          variant="outline"
          className="h-14"
          onClick={() => addDigit("0")}
        >
          0
        </Button>
        <Button variant="destructive" className="h-14" onClick={onClear}>
          Clear
        </Button>
        <Button variant="outline" className="h-14" onClick={handleBonusClick}>
          Doppel-Sieg
        </Button>
        <Button
          variant="outline"
          className="h-14"
          onClick={() => handleTichu(100)}
        >
          +Tichu
        </Button>
        <Button
          variant="outline"
          className="h-14"
          onClick={() => handleTichu(-100)}
        >
          −Tichu
        </Button>
      </div>
    </div>
  );
}
