import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface TichuNumpadProps {
  setTeam1Base: (score: number) => void;
  setTeam2Base: (score: number) => void;
  team1Base: number;
  team2Base: number;
  toggleBonus: (team: "team1" | "team2") => void;
  activeTeam: "team1" | "team2";
  onClear: () => void;
  onInput: () => void;
  replaceNextInput?: boolean;
  onInputConsumed?: () => void;
  disabled?: boolean;
  disableScoreInput?: boolean;
  isSubmitting?: boolean;
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function TichuNumpad({
  setTeam1Base,
  setTeam2Base,
  team1Base,
  team2Base,
  toggleBonus,
  activeTeam,
  onClear,
  onInput,
  replaceNextInput = false,
  onInputConsumed,
  disabled = false,
  disableScoreInput = false,
  isSubmitting = false,
}: TichuNumpadProps) {
  const scoreInputDisabled = disabled || disableScoreInput;

  const addDigit = useCallback(
    (digit: string) => {
      function updateOther(score: number) {
        if (activeTeam === "team1") {
          setTeam2Base(100 - score);
        } else {
          setTeam1Base(100 - score);
        }
      }

      if (activeTeam === "team1") {
        const next = replaceNextInput
          ? Number(digit)
          : Number(`${team1Base ?? ""}${digit}`);
        if (next > 200) return;
        setTeam1Base(next);
        updateOther(next);
        onInput();
        onInputConsumed?.();
      } else {
        const next = replaceNextInput
          ? Number(digit)
          : Number(`${team2Base ?? ""}${digit}`);
        if (next > 200) return;
        setTeam2Base(next);
        updateOther(next);
        onInput();
        onInputConsumed?.();
      }
    },
    [
      activeTeam,
      onInput,
      onInputConsumed,
      replaceNextInput,
      setTeam1Base,
      setTeam2Base,
      team1Base,
      team2Base,
    ],
  );

  function onNegative() {
    if (activeTeam === "team1") {
      setTeam1Base(0 - team1Base);
      setTeam2Base(100 + team1Base);
    } else {
      setTeam2Base(0 - team2Base);
      setTeam1Base(100 + team2Base);
    }
    onInput();
  }

  function handleBonusClick() {
    toggleBonus(activeTeam);
    onInput();
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (scoreInputDisabled || isSubmitting) return;
      const target = e.target;
      const activeElement = document.activeElement;
      if (
        (target instanceof Element && target.closest('[role="dialog"]')) ||
        (activeElement instanceof Element &&
          activeElement.closest('[role="dialog"]'))
      ) {
        return;
      }
      if (e.key >= "1" && e.key <= "9") addDigit(e.key);
      else if (e.key === "0") addDigit("0");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addDigit, isSubmitting, scoreInputDisabled]);

  return (
    <div className="score-numpad mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-1">
      <div className="score-numpad-grid grid min-h-0 flex-1 grid-cols-3 grid-rows-4 gap-1">
        {KEYS.map((k) => (
          <Button
            key={k}
            variant="outline"
            className="score-numpad-key h-full min-h-9 text-xl sm:min-h-12"
            disabled={scoreInputDisabled || isSubmitting}
            onClick={() => addDigit(k)}
          >
            {k}
          </Button>
        ))}
        <Button
          variant="outline"
          className="score-numpad-key h-full min-h-9 sm:min-h-12"
          onClick={onNegative}
          disabled={scoreInputDisabled || isSubmitting}
        >
          -
        </Button>
        <Button
          variant="outline"
          className="score-numpad-key h-full min-h-9 text-xl sm:min-h-12"
          onClick={() => addDigit("0")}
          disabled={scoreInputDisabled || isSubmitting}
        >
          0
        </Button>
        <Button
          variant="outline"
          className="score-numpad-key h-full min-h-9 border-destructive/40 text-destructive hover:bg-destructive/10 sm:min-h-12"
          onClick={onClear}
          disabled={disabled || isSubmitting}
        >
          <span className="text-xs">Löschen</span>
        </Button>
      </div>
      <Button
        variant="outline"
        className="h-9 shrink-0 text-sm"
        onClick={handleBonusClick}
        disabled={disabled || isSubmitting}
      >
        Doppel-Sieg
      </Button>
    </div>
  );
}
