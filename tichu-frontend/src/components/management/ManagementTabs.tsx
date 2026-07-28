import { NavLink, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/manage/players", label: "Spieler" },
  { to: "/manage/teams", label: "Teams" },
];

export function ManagementTabs() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  function getTabUrl(path: string) {
    return returnTo ? `${path}?returnTo=${encodeURIComponent(returnTo)}` : path;
  }

  return (
    <nav className="flex gap-1 border-b" aria-label="Verwaltung">
      {tabs.map(({ to, label }) => (
        <NavLink
          key={to}
          to={getTabUrl(to)}
          className={({ isActive }) =>
            cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
