import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useEffect } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig, useSWRConfig } from "swr";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Game, Player, Team } from "@/lib/Types";
import { apiKeys } from "@/lib/api/keys";
import { getGameRefreshInterval } from "@/lib/gamePolling";
import { SubmitScore } from "./SubmitScore";

const mocks = vi.hoisted(() => ({
  fetchGame: vi.fn(),
  submitScore: vi.fn(),
}));

vi.mock("@/lib/api/Games", () => ({
  fetchGame: mocks.fetchGame,
}));
vi.mock("@/lib/api/Scores", () => ({
  submitScore: mocks.submitScore,
}));
vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => null,
}));

afterEach(() => {
  vi.resetAllMocks();
  revalidateGame = null;
});

const player = (id: string): Player => ({
  id,
  name: id,
  elo: null,
  enabled: true,
});

const team = (id: string): Team => ({
  id,
  name: `Team ${id}`,
  player1: player(`${id}-1`),
  player2: player(`${id}-2`),
  teamElo: null,
  enabled: true,
});

function game(overrides: Partial<Game> = {}): Game {
  return {
    id: "game-1",
    startedAt: "2026-01-01T00:00:00Z",
    endedAt: null,
    team1: team("one"),
    team2: team("two"),
    scores: { rounds: [] },
    winner: null,
    hasEnded: false,
    pendingFinish: false,
    ...overrides,
  };
}

let revalidateGame: (() => Promise<unknown>) | null = null;

function RevalidationProbe() {
  const { mutate } = useSWRConfig();

  useEffect(() => {
    revalidateGame = () => mutate(apiKeys.game("game-1"));
    return () => {
      revalidateGame = null;
    };
  }, [mutate]);

  return null;
}

function renderScore() {
  render(
    <SWRConfig
      value={{
        provider: () => new Map(),
        initFocus: () => undefined,
        initReconnect: () => undefined,
      }}
    >
      <MemoryRouter initialEntries={["/game/game-1/score"]}>
        <Routes>
          <Route path="/game/:id/score" element={<SubmitScore />} />
        </Routes>
      </MemoryRouter>
      <RevalidationProbe />
    </SWRConfig>,
  );
}

describe("SubmitScore remote game state", () => {
  it("learns about an external end and stops revalidating afterward", async () => {
    mocks.fetchGame.mockResolvedValueOnce(game()).mockResolvedValueOnce(
      game({
        hasEnded: true,
        endedAt: "2026-01-01T01:00:00Z",
        winner: "team1",
      }),
    );
    renderScore();

    await screen.findByRole("button", { name: "Runde speichern" });
    await waitFor(() => expect(revalidateGame).not.toBeNull());
    await act(async () => {
      await revalidateGame?.();
    });
    await waitFor(() =>
      expect(screen.getByText("Spiel bereits beendet")).toBeInTheDocument(),
    );
    await waitFor(() => expect(mocks.fetchGame).toHaveBeenCalledTimes(2));

    expect(getGameRefreshInterval(game({ hasEnded: true }))).toBe(0);
    expect(getGameRefreshInterval(game({ pendingFinish: true }))).toBe(2000);
    expect(mocks.fetchGame).toHaveBeenCalledTimes(2);
  });

  it("disables the score controls while finish confirmation is pending", async () => {
    mocks.fetchGame.mockResolvedValue(game({ pendingFinish: true }));
    renderScore();

    expect(
      await screen.findByText(/Das Spiel wird gerade beendet/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Runde speichern" }),
    ).toBeDisabled();
  });
});

describe("SubmitScore validation and short viewport structure", () => {
  it("submits a valid round with a client-generated retry key", async () => {
    mocks.fetchGame.mockResolvedValue(game());
    mocks.submitScore.mockResolvedValue({
      number: 0,
      submittedAt: "2026-01-01T00:01:00Z",
      team1: 5,
      team2: 95,
    });
    renderScore();

    await screen.findByRole("button", { name: "Runde speichern" });
    fireEvent.click(screen.getByRole("button", { name: "5" }));
    fireEvent.click(screen.getByRole("button", { name: "Runde speichern" }));

    await waitFor(() => expect(mocks.submitScore).toHaveBeenCalledTimes(1));
    expect(mocks.submitScore).toHaveBeenCalledWith(
      "game-1",
      expect.objectContaining({
        roundKey: expect.any(String),
        team1Score: 5,
        team2Score: 95,
        tichuCalls: [],
      }),
    );
    expect(
      await screen.findByText("Runde wurde gespeichert."),
    ).toBeInTheDocument();
  });

  // jsdom has no layout engine; manually verify 320px/480px heights and portrait/landscape.
  it("does not announce an error for an untouched 0:0 round", async () => {
    mocks.fetchGame.mockResolvedValue(game());
    renderScore();

    const saveButton = await screen.findByRole("button", {
      name: "Runde speichern",
    });

    expect(saveButton).toBeDisabled();
    expect(
      screen.queryByText("Gib die Punkte für diese Runde ein."),
    ).not.toBeInTheDocument();
    expect(saveButton).not.toHaveAttribute("aria-describedby");
  });

  it("explains an invalid entered score and associates it with Save", async () => {
    mocks.fetchGame.mockResolvedValue(game());
    renderScore();

    const saveButton = await screen.findByRole("button", {
      name: "Runde speichern",
    });
    fireEvent.click(screen.getByRole("button", { name: /^1$/ }));

    expect(
      await screen.findByText("Beide Teamwerte müssen durch 5 teilbar sein."),
    ).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
    expect(saveButton).toHaveAttribute(
      "aria-describedby",
      "score-validation-message",
    );
  });

  it("keeps the score controls in a scroll-capable mobile structure", async () => {
    mocks.fetchGame.mockResolvedValue(game());
    renderScore();

    await screen.findByRole("button", { name: "Runde speichern" });

    const main = screen.getByRole("main");
    expect(main).toHaveClass("score-entry-page", "overflow-y-auto");
    expect(main).not.toHaveClass("overflow-hidden");
    expect(document.querySelector(".score-entry-card")).toBeInTheDocument();
    expect(document.querySelector(".score-numpad-grid")).toBeInTheDocument();
  });
});
