import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EntityList } from "./EntityList";
import { StatisticsTabs } from "./StatisticsTabs";

describe("statistics controls", () => {
  it("uses native toggle buttons instead of incomplete tab semantics", () => {
    render(<StatisticsTabs value="players" onChange={vi.fn()} />);

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Spieler" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("uses a native list with pressed buttons for entity selection", () => {
    const onSelect = vi.fn();
    render(
      <EntityList
        items={[
          {
            id: "player-1",
            name: "Anna",
            description: "ELO: 1200",
            enabled: true,
          },
        ]}
        selectedId="player-1"
        onSelect={onSelect}
      />,
    );

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Anna/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: /Anna/ }));
    expect(onSelect).toHaveBeenCalledWith("player-1");
  });
});
