import { ArrowRight, Clock3, Eye, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import useSWR from "swr";
import type { Game } from "@/lib/Types";
import { fetchOngoingGames } from "@/lib/api/Games";
import { apiKeys } from "@/lib/api/keys";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";

function formatStartTime(value: string) {
  return new Date(value).toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function OngoingGameCard({
  game,
  first = false,
}: {
  game: Game;
  first?: boolean;
}) {
  return (
    <Link
      to={`/game/${game.id}/spectate`}
      className="group block focus:outline-none"
      id={first ? "first-ongoing-game" : undefined}
    >
      <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-primary/60 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="flex items-center gap-4 p-4 sm:p-5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Eye className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h2 className="truncate font-semibold">
                {game.team1.name} gegen {game.team2.name}
              </h2>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {game.team1.player1.name} & {game.team1.player2.name} ·{" "}
              {game.team2.player1.name} & {game.team2.player2.name}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Clock3 className="size-3.5" />
              Runde {game.scores.rounds.length + 1} · gestartet um{" "}
              {formatStartTime(game.startedAt)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function SpectateEntryPage() {
  const [search, setSearch] = useState("");
  const {
    data: games,
    error,
    isLoading,
    mutate: refreshGames,
  } = useSWR<Game[]>(apiKeys.games, fetchOngoingGames, {
    refreshInterval: 3000,
  });

  const filteredGames = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return games ?? [];

    return (games ?? []).filter((game) => {
      const searchableText = [
        game.id,
        game.team1.name,
        game.team2.name,
        game.team1.player1.name,
        game.team1.player2.name,
        game.team2.player1.name,
        game.team2.player2.name,
      ]
        .join(" ")
        .toLocaleLowerCase();
      return searchableText.includes(query);
    });
  }, [games, search]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Spiel anschauen" />

      <section className="space-y-3" aria-labelledby="ongoing-games-title">
        <div>
          <h2 id="ongoing-games-title" className="text-xl font-semibold">
            Laufende Spiele
          </h2>
        </div>

        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Laufende Spiele suchen"
            className="pl-9"
            data-enter-primary="true"
            placeholder="Nach Spiel-ID, Team oder Spieler suchen..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              const firstResult = document.getElementById("first-ongoing-game");
              if (!firstResult) return;
              event.preventDefault();
              firstResult.focus();
            }}
          />
        </div>

        {isLoading && (
          <LoadingState label="Laufende Spiele werden geladen ..." />
        )}
        {error && (
          <ErrorState
            description="Laufende Spiele konnten nicht geladen werden."
            action={
              <Button variant="outline" onClick={() => void refreshGames()}>
                Erneut versuchen
              </Button>
            }
          />
        )}
        {!isLoading && !error && games?.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="font-medium">Keine laufenden Spiele</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Kein laufendes Spiel gefunden.
              </p>
            </CardContent>
          </Card>
        )}
        {!isLoading &&
          !error &&
          games &&
          games.length > 0 &&
          filteredGames.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="font-medium">Kein laufendes Spiel gefunden.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Suche nach einer Spiel-ID, einem Team oder einem Spieler.
                </p>
              </CardContent>
            </Card>
          )}
        {!isLoading && !error && filteredGames.length > 0 && (
          <div className="grid gap-3">
            {filteredGames.map((game, index) => (
              <OngoingGameCard key={game.id} game={game} first={index === 0} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
