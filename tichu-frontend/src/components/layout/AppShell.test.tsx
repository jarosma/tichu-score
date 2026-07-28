import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  Link,
  MemoryRouter,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";

vi.mock("@/components/ThemeToggle", () => ({
  ThemeToggle: () => null,
}));

function TestPage({
  title,
  onPrimary,
}: {
  title: string;
  onPrimary?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <>
      <h1 id="page-heading" tabIndex={-1}>
        {title}
      </h1>
      <button type="button" data-enter-primary="true" onClick={onPrimary}>
        Primäre Aktion
      </button>
      <form>
        <label>
          Formularfeld
          <input />
        </label>
      </form>
      <button type="button" onClick={() => navigate(-1)}>
        Zurück testen
      </button>
      <button type="button" onClick={() => navigate(1)}>
        Vor testen
      </button>
      <Link to="/next">Karte öffnen</Link>
    </>
  );
}

function renderRouter(initialEntries = ["/"]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AppShell>
        <Routes>
          <Route path="/" element={<TestPage title="Startseite" />} />
          <Route path="/next" element={<TestPage title="Nächste Seite" />} />
        </Routes>
      </AppShell>
    </MemoryRouter>,
  );
}

describe("AppShell route focus and Enter shortcut", () => {
  it("focuses the page heading after card navigation and browser-style back/forward", async () => {
    renderRouter();

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Startseite" })).toHaveFocus(),
    );

    fireEvent.click(screen.getByRole("link", { name: "Karte öffnen" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Nächste Seite" }),
      ).toHaveFocus(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Zurück testen" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Startseite" })).toHaveFocus(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Vor testen" }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Nächste Seite" }),
      ).toHaveFocus(),
    );
  });

  it("ignores modified, composing, prevented, and form Enter events", async () => {
    const onPrimary = vi.fn();
    render(
      <MemoryRouter>
        <AppShell>
          <Routes>
            <Route
              path="*"
              element={<TestPage title="Startseite" onPrimary={onPrimary} />}
            />
          </Routes>
        </AppShell>
      </MemoryRouter>,
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Startseite" })).toHaveFocus(),
    );

    for (const modifier of [
      { ctrlKey: true },
      { altKey: true },
      { shiftKey: true },
      { metaKey: true },
      { isComposing: true },
    ]) {
      fireEvent.keyDown(document.body, { key: "Enter", ...modifier });
    }

    const preventedEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Enter",
    });
    preventedEvent.preventDefault();
    window.dispatchEvent(preventedEvent);

    fireEvent.keyDown(screen.getByRole("textbox"), { key: "Enter" });
    expect(onPrimary).not.toHaveBeenCalled();

    fireEvent.keyDown(document.body, { key: "Enter" });
    expect(onPrimary).toHaveBeenCalledTimes(1);
  });
});
