import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/pages/HomePage", () => ({
  HomePage: () => <p>home route</p>,
}));
vi.mock("@/pages/CreateGamePage", () => ({
  CreateGamePage: () => <p>new game route</p>,
}));
vi.mock("@/pages/SpectateEntryPage", () => ({
  SpectateEntryPage: () => <p>spectate entry route</p>,
}));
vi.mock("@/pages/SpectateGame", () => ({
  SpectateGame: () => <p>spectate route</p>,
}));
vi.mock("@/pages/SubmitScore", () => ({
  SubmitScore: () => <p>score route</p>,
}));
vi.mock("@/pages/PlayersPage", () => ({
  PlayersPage: () => <p>players route</p>,
}));
vi.mock("@/pages/TeamsPage", () => ({
  TeamsPage: () => <p>teams route</p>,
}));
vi.mock("@/pages/StatisticsPage", () => ({
  StatisticsPage: () => <p>statistics route</p>,
}));
vi.mock("@/pages/FeaturePlaceholderPage", () => ({
  FeaturePlaceholderPage: ({ title }: { title: string }) => <p>{title}</p>,
}));

afterEach(() => {
  window.history.pushState({}, "", "/");
});

describe("application routing", () => {
  it.each([
    ["/game/game-1/score", "score route"],
    ["/game/game-1/spectate", "spectate route"],
  ])("supports direct %s navigation", (path, content) => {
    window.history.pushState({}, "", path);

    render(<App />);

    expect(screen.getByText(content)).toBeInTheDocument();
  });

  it("keeps the legacy management route redirect", () => {
    window.history.pushState({}, "", "/manage");

    render(<App />);

    expect(screen.getByText("players route")).toBeInTheDocument();
  });
});
