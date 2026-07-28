import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TichuNumpad } from "./TichuNumpad";

function renderNumpad() {
  const setTeam1Base = vi.fn();
  render(
    <>
      <div role="dialog" aria-label="Spielerauswahl">
        <button type="button">Dialog 1</button>
      </div>
      <TichuNumpad
        setTeam1Base={setTeam1Base}
        setTeam2Base={vi.fn()}
        team1Base={0}
        team2Base={100}
        toggleBonus={vi.fn()}
        activeTeam="team1"
        onClear={vi.fn()}
        onInput={vi.fn()}
      />
    </>,
  );
  return setTeam1Base;
}

describe("TichuNumpad keyboard listener", () => {
  it("ignores digits from dialog buttons but handles window events", () => {
    const setTeam1Base = renderNumpad();

    fireEvent.keyDown(screen.getByRole("button", { name: "Dialog 1" }), {
      key: "1",
    });
    expect(setTeam1Base).not.toHaveBeenCalled();

    fireEvent.keyDown(window, { key: "1" });
    expect(setTeam1Base).toHaveBeenCalledWith(1);
  });
});
