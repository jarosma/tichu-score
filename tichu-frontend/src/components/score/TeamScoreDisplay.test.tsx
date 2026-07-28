import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TeamScoreDisplay } from "./TeamScoreDisplay";

function renderScore(team1Adjustment: number) {
  render(
    <TeamScoreDisplay
      team1Name="Team eins"
      team2Name="Team zwei"
      team1Score={200 + team1Adjustment}
      team2Score={0}
      team1Adjustment={team1Adjustment}
      team2Adjustment={0}
      doubleVictory="team1"
      activeTeam="team1"
      onSelectTeam={() => undefined}
    />,
  );
}

describe("TeamScoreDisplay special labels", () => {
  it.each([
    [100, "Doppelsieg · Tichu +100"],
    [-100, "Doppelsieg · Tichu -100"],
  ])(
    "keeps the Doppelsieg and Tichu adjustment visible",
    (adjustment, label) => {
      renderScore(adjustment);

      expect(screen.getByText(label)).toBeInTheDocument();
    },
  );
});
