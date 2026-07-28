import { BarChart3, Eye, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const actions = [
  {
    to: "/game/new",
    title: "Spiel starten",
    icon: Trophy,
    primary: true,
  },
  {
    to: "/game/spectate",
    title: "Spiel anschauen",
    icon: Eye,
  },
  {
    to: "/manage",
    title: "Spieler & Teams verwalten",
    icon: Users,
  },
  {
    to: "/statistics",
    title: "Statistiken",
    icon: BarChart3,
  },
];

export function HomePage() {
  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col gap-6 px-2 py-2 sm:gap-8 sm:px-4 sm:py-3 lg:px-6 lg:py-4">
      <section className="shrink-0 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Tichu
        </h1>
      </section>

      <section
        className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-3 sm:gap-4"
        aria-label="Tichu Aktionen"
      >
        {actions.map(({ to, title, icon: Icon, primary }) => (
          <Link
            key={to}
            to={to}
            className="group focus:outline-none"
            data-enter-primary={primary ? "true" : undefined}
          >
            <Card
              className={cn(
                "h-full min-h-0 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring",
                primary && "border-primary bg-primary text-primary-foreground",
              )}
            >
              <CardContent
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-3 p-3 text-center sm:gap-5 sm:p-8",
                )}
              >
                <div
                  className={cn(
                    "flex size-14 shrink-0 items-center justify-center rounded-2xl bg-foreground/10 sm:size-24",
                    primary && "bg-primary-foreground/15",
                  )}
                >
                  <Icon className="size-7 sm:size-12" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold sm:text-xl">{title}</h2>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </section>
    </div>
  );
}
