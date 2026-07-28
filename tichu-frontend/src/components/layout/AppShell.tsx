import {
  ArrowLeft,
  BarChart3,
  Eye,
  Home,
  Settings2,
  Trophy,
} from "lucide-react";
import {
  NavLink,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { focusIfConnected } from "@/lib/focus";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
}

const navigation = [
  { to: "/", label: "Übersicht", icon: Home, end: true },
  { to: "/game/new", label: "Spiel starten", icon: Trophy },
  { to: "/game/spectate", label: "Spiel anschauen", icon: Eye },
  { to: "/manage", label: "Verwalten", icon: Settings2 },
  { to: "/statistics", label: "Statistiken", icon: BarChart3 },
];

function useRouteFocusManager() {
  const location = useLocation();

  useEffect(() => {
    let cancelled = false;
    const frame = window.requestAnimationFrame(() => {
      if (cancelled) return;

      const pageHeading = document.getElementById("page-heading");
      const mainLandmark = document.getElementById("main-content");
      if (!focusIfConnected(pageHeading)) focusIfConnected(mainLandmark);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frame);
    };
  }, [location.hash, location.key, location.pathname, location.search]);
}

function findEnterPrimary(): HTMLElement | null {
  return (
    Array.from(
      document.querySelectorAll<HTMLElement>('[data-enter-primary="true"]'),
    ).find(
      (element) =>
        element.isConnected &&
        !element.hasAttribute("disabled") &&
        element.getAttribute("aria-hidden") !== "true" &&
        !element.hidden &&
        !element.closest("[hidden]") &&
        window.getComputedStyle(element).display !== "none" &&
        window.getComputedStyle(element).visibility !== "hidden",
    ) ?? null
  );
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const historyKeys = useRef([location.key]);
  const [canGoBack, setCanGoBack] = useState(false);
  const isScoreRoute = /^\/game\/[^/]+\/score$/.test(location.pathname);
  const isSpectateRoute = /^\/game\/[^/]+\/spectate$/.test(location.pathname);
  const isHomeRoute = location.pathname === "/";
  const isViewportRoute = isSpectateRoute || isHomeRoute;

  useRouteFocusManager();

  useEffect(() => {
    if (navigationType === "PUSH") {
      historyKeys.current.push(location.key);
    } else if (navigationType === "POP") {
      const currentIndex = historyKeys.current.indexOf(location.key);

      if (currentIndex >= 0) {
        historyKeys.current = historyKeys.current.slice(0, currentIndex + 1);
      } else {
        historyKeys.current = [location.key];
      }
    }

    setCanGoBack(historyKeys.current.length > 1);
  }, [location.key, navigationType]);

  useEffect(() => {
    function handleEnterShortcut(event: KeyboardEvent) {
      if (
        event.key !== "Enter" ||
        event.repeat ||
        event.defaultPrevented ||
        event.isComposing ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.metaKey
      ) {
        return;
      }

      const target = event.target instanceof HTMLElement ? event.target : null;
      if (
        target?.matches(
          "input, textarea, select, button, a, [contenteditable='true']",
        ) ||
        target?.matches('[role="button"]') ||
        target?.closest("form") ||
        target?.closest('[role="dialog"]')
      ) {
        return;
      }

      const primary = findEnterPrimary();
      if (!primary) return;

      event.preventDefault();
      primary.focus();
      primary.click();
    }

    window.addEventListener("keydown", handleEnterShortcut);
    return () => window.removeEventListener("keydown", handleEnterShortcut);
  }, []);

  function goBack() {
    navigate(-1);
  }

  if (isScoreRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-20 items-center border-b px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Tichu
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Scoreboard</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Hauptnavigation">
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center justify-between border-t p-4">
          <span className="text-xs text-muted-foreground">Version 1.0.0</span>
          <ThemeToggle />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex h-16 items-center gap-3 border-b px-5 lg:hidden">
          {canGoBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={goBack}
              aria-label="Zurück"
            >
              <ArrowLeft />
            </Button>
          )}
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Tichu
            </p>
            <p className="text-xs text-muted-foreground">
              Scoreboard · Version 1.0.0
            </p>
          </div>
          <ThemeToggle />
        </header>

        <nav
          className="flex gap-1 overflow-x-auto border-b px-4 py-2 lg:hidden"
          aria-label="Hauptnavigation"
        >
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main
          id="main-content"
          tabIndex={-1}
          className={cn(
            "mx-auto max-w-7xl",
            isViewportRoute
              ? "flex h-[calc(100dvh-7.25rem)] min-h-0 flex-col overflow-hidden px-3 py-3 sm:px-5 sm:py-4 lg:h-dvh lg:px-12 lg:py-6"
              : "min-h-screen px-5 py-8 sm:px-8 lg:px-12",
          )}
        >
          {canGoBack && (
            <div
              className={cn(
                "hidden lg:block",
                isViewportRoute ? "mb-2" : "mb-8",
              )}
            >
              <Button variant="ghost" onClick={goBack}>
                <ArrowLeft />
                Zurück
              </Button>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
