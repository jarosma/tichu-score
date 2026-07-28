import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useSearchParams } from "react-router-dom";
import { fetchPlayers } from "@/lib/api/Players";
import { fetchTeams } from "@/lib/api/Teams";
import { fetchPlayerStats, fetchTeamStats } from "@/lib/api/Statistics";
import type { Player, Team, PlayerStats, TeamStats } from "@/lib/Types";
import { apiKeys } from "@/lib/api/keys";
import { EntityList } from "@/components/statistics/EntityList";
import { EntitySearch } from "@/components/statistics/EntitySearch";
import { StatisticsTabs } from "@/components/statistics/StatisticsTabs";
import { StatsSummary } from "@/components/statistics/StatsSummary";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

type Tab = "players" | "teams";

export function StatisticsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const tab: Tab =
    searchParams.get("tab") === "teams" || searchParams.has("teamId")
      ? "teams"
      : "players";
  const selectedId = searchParams.get(
    tab === "players" ? "playerId" : "teamId",
  );

  const {
    data: players,
    error: playersError,
    isLoading: playersLoading,
    mutate: mutatePlayers,
  } = useSWR<Player[]>(apiKeys.players, fetchPlayers);
  const {
    data: teams,
    error: teamsError,
    isLoading: teamsLoading,
    mutate: mutateTeams,
  } = useSWR<Team[]>(apiKeys.teams, fetchTeams);

  const playerStatsKey =
    tab === "players" && selectedId ? apiKeys.playerStats(selectedId) : null;
  const teamStatsKey =
    tab === "teams" && selectedId ? apiKeys.teamStats(selectedId) : null;
  const {
    data: playerStats,
    error: playerStatsError,
    isLoading: playerStatsLoading,
    mutate: mutatePlayerStats,
  } = useSWR<PlayerStats>(playerStatsKey, () => fetchPlayerStats(selectedId!));
  const {
    data: teamStats,
    error: teamStatsError,
    isLoading: teamStatsLoading,
    mutate: mutateTeamStats,
  } = useSWR<TeamStats>(teamStatsKey, () => fetchTeamStats(selectedId!));

  const entities = useMemo(
    () => (tab === "players" ? (players ?? []) : (teams ?? [])),
    [players, tab, teams],
  );
  const filteredEntities = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return entities;
    return entities.filter((entity) => {
      const description =
        "player1" in entity
          ? `${entity.player1.name} ${entity.player2.name}`
          : entity.name;
      return `${entity.name} ${description}`.toLowerCase().includes(value);
    });
  }, [entities, search]);

  useEffect(() => {
    if (selectedId || entities.length === 0) return;
    const params = new URLSearchParams(searchParams);
    params.set(tab === "players" ? "playerId" : "teamId", entities[0].id);
    params.delete(tab === "players" ? "teamId" : "playerId");
    setSearchParams(params, { replace: true });
  }, [entities, searchParams, selectedId, setSearchParams, tab]);

  const selectedEntity = entities.find((entity) => entity.id === selectedId);
  const stats = tab === "players" ? playerStats : teamStats;
  const statsError = tab === "players" ? playerStatsError : teamStatsError;
  const statsLoading =
    tab === "players" ? playerStatsLoading : teamStatsLoading;
  const listError = tab === "players" ? playersError : teamsError;
  const listLoading = tab === "players" ? playersLoading : teamsLoading;

  function changeTab(nextTab: Tab) {
    const params = new URLSearchParams(searchParams);
    params.delete("playerId");
    params.delete("teamId");
    params.set("tab", nextTab);
    setSearchParams(params, { replace: false });
    setSearch("");
  }

  function selectEntity(id: string) {
    const params = new URLSearchParams(searchParams);
    params.delete(tab === "players" ? "teamId" : "playerId");
    params.set(tab === "players" ? "playerId" : "teamId", id);
    setSearchParams(params);
  }

  function retry() {
    if (tab === "players") {
      void mutatePlayers();
      if (selectedId) void mutatePlayerStats();
    } else {
      void mutateTeams();
      if (selectedId) void mutateTeamStats();
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Statistiken" />
      <StatisticsTabs value={tab} onChange={changeTab} />

      {listLoading && (
        <LoadingState
          label={`${tab === "players" ? "Spieler" : "Teams"} werden geladen ...`}
        />
      )}
      {listError && (
        <ErrorState
          description={`Die ${tab === "players" ? "Spieler" : "Teams"} konnten nicht geladen werden.`}
          action={
            <Button variant="outline" onClick={retry}>
              Erneut versuchen
            </Button>
          }
        />
      )}
      {!listLoading && !listError && entities.length === 0 && (
        <EmptyState
          title={`Keine ${tab === "players" ? "Spieler" : "Teams"} vorhanden`}
        />
      )}
      {!listLoading && !listError && entities.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[minmax(16rem,0.35fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <EntitySearch
              value={search}
              onChange={setSearch}
              entityLabel={tab === "players" ? "Spieler" : "Teams"}
            />
            {filteredEntities.length > 0 ? (
              <EntityList
                items={filteredEntities.map((entity) => ({
                  id: entity.id,
                  name: entity.name,
                  description:
                    "player1" in entity
                      ? `${entity.player1.name} & ${entity.player2.name}`
                      : `ELO: ${entity.elo ?? "Noch keine Wertung"}`,
                  enabled: entity.enabled,
                }))}
                selectedId={selectedId}
                onSelect={selectEntity}
              />
            ) : (
              <EmptyState
                title="Keine Treffer"
                description="Passe deine Suche an, um weitere Spieler oder Teams zu finden."
              />
            )}
          </div>

          <section className="space-y-5" aria-live="polite">
            {selectedEntity && (
              <h2 className="text-2xl font-semibold">{selectedEntity.name}</h2>
            )}
            {selectedId && statsLoading && (
              <LoadingState label="Statistiken werden geladen ..." />
            )}
            {selectedId && statsError && (
              <ErrorState
                title="Statistiken nicht verfügbar"
                description="Die Statistiken konnten nicht geladen werden."
                action={
                  <Button variant="outline" onClick={retry}>
                    Erneut versuchen
                  </Button>
                }
              />
            )}
            {selectedId && !statsLoading && !statsError && stats && (
              <StatsSummary stats={stats} />
            )}
            {selectedId && !statsLoading && !statsError && !stats && (
              <EmptyState
                title="Noch keine Spieldaten"
                description={`Dieser ${tab === "players" ? "Spieler" : "Team"} wurde bisher in keinem abgeschlossenen Spiel verwendet.`}
              />
            )}
            {!selectedId && (
              <EmptyState
                title={`Wähle ${tab === "players" ? "einen Spieler" : "ein Team"} aus`}
                description={`Wähle links ${tab === "players" ? "einen Spieler" : "ein Team"} aus, um die Statistiken zu sehen.`}
              />
            )}
          </section>
        </div>
      )}
    </div>
  );
}
