import { BarChart3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { Link } from "react-router-dom";
import { deleteTeam, fetchTeams, updateTeamStatus } from "@/lib/api/Teams";
import { fetchPlayers } from "@/lib/api/Players";
import type { Player, Team } from "@/lib/Types";
import { apiKeys } from "@/lib/api/keys";
import { getApiErrorMessage } from "@/lib/api/client";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ManagementTabs } from "@/components/management/ManagementTabs";
import { ReturnToGameBanner } from "@/components/management/ReturnToGameBanner";
import { StatusBadge } from "@/components/management/StatusBadge";
import { TeamFormDialog } from "@/components/management/TeamFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Filter = "active" | "disabled" | "all";

export function TeamsPage() {
  const [filter, setFilter] = useState<Filter>("active");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const {
    data: teams,
    error: teamsError,
    isLoading: teamsLoading,
    mutate: mutateTeams,
  } = useSWR<Team[]>(apiKeys.teams, fetchTeams);
  const {
    data: players,
    error: playersError,
    isLoading: playersLoading,
    mutate: mutatePlayers,
  } = useSWR<Player[]>(apiKeys.players, fetchPlayers);

  const visibleTeams = (teams ?? []).filter((team) => {
    if (filter === "active") return team.enabled;
    if (filter === "disabled") return !team.enabled;
    return true;
  });

  function showRefreshWarning() {
    setRefreshWarning(
      "Die Änderung wurde gespeichert, aber die Liste konnte nicht aktualisiert werden.",
    );
  }

  async function refreshTeamList() {
    try {
      const refreshedTeams = await fetchTeams();
      await mutateTeams(refreshedTeams, { revalidate: false });
      setRefreshWarning(null);
    } catch {
      showRefreshWarning();
    }
  }

  async function reconcileTeamList(update: (current: Team[]) => Team[]) {
    try {
      await mutateTeams((current) => update(current ?? []), {
        revalidate: false,
      });
    } catch {
      showRefreshWarning();
    }
    try {
      const refreshedTeams = await fetchTeams();
      await mutateTeams(refreshedTeams, { revalidate: false });
    } catch {
      showRefreshWarning();
    }
  }

  async function handleStatus(team: Team) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setRefreshWarning(null);
    setIsMutating(true);
    try {
      await updateTeamStatus(team.id, !team.enabled);
    } catch (reason) {
      setErrorMessage(
        getApiErrorMessage(reason, "Teamstatus konnte nicht geändert werden."),
      );
      setIsMutating(false);
      return;
    }
    setSuccessMessage(`Team ${team.enabled ? "deaktiviert" : "aktiviert"}.`);
    await reconcileTeamList((current) =>
      current.map((candidate) =>
        candidate.id === team.id
          ? { ...candidate, enabled: !team.enabled }
          : candidate,
      ),
    );
    setIsMutating(false);
  }

  async function handleDelete() {
    if (!teamToDelete) return;
    const team = teamToDelete;
    setErrorMessage(null);
    setSuccessMessage(null);
    setRefreshWarning(null);
    setIsMutating(true);
    try {
      await deleteTeam(team.id);
    } catch (reason) {
      setErrorMessage(
        getApiErrorMessage(reason, "Team konnte nicht gelöscht werden."),
      );
      setIsMutating(false);
      return;
    }
    setTeamToDelete(null);
    setSuccessMessage("Team wurde gelöscht.");
    await reconcileTeamList((current) =>
      current.filter((candidate) => candidate.id !== team.id),
    );
    setIsMutating(false);
  }

  const activePlayers = (players ?? []).filter((player) => player.enabled);
  const canCreateTeam =
    !playersLoading && !playersError && activePlayers.length >= 2;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teams verwalten"
        actions={
          <Button
            onClick={() => setIsCreateOpen(true)}
            disabled={!canCreateTeam}
            data-enter-primary="true"
          >
            <Plus />
            Team erstellen
          </Button>
        }
      />
      <ManagementTabs />
      <ReturnToGameBanner />
      {errorMessage && (
        <InlineMessage variant="error">{errorMessage}</InlineMessage>
      )}
      {refreshWarning && (
        <InlineMessage variant="warning">{refreshWarning}</InlineMessage>
      )}
      {successMessage && (
        <InlineMessage variant="success">{successMessage}</InlineMessage>
      )}
      {playersError && (
        <InlineMessage variant="error">
          Spieler konnten nicht geladen werden. Die Teamerstellung ist derzeit
          nicht möglich.
          <Button
            className="ml-3"
            size="sm"
            variant="outline"
            onClick={() => void mutatePlayers()}
          >
            Erneut versuchen
          </Button>
        </InlineMessage>
      )}

      <div className="flex flex-wrap gap-2" aria-label="Teams filtern">
        {(["active", "disabled", "all"] as Filter[]).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
          >
            {value === "active"
              ? "Aktiv"
              : value === "disabled"
                ? "Deaktiviert"
                : "Alle"}
          </Button>
        ))}
      </div>

      {teamsLoading && <LoadingState label="Teams werden geladen ..." />}
      {teamsError && !teams && (
        <ErrorState
          description="Die Teams konnten nicht geladen werden."
          action={
            <Button variant="outline" onClick={() => void refreshTeamList()}>
              Erneut versuchen
            </Button>
          }
        />
      )}
      {!teamsLoading &&
        !(teamsError && !teams) &&
        visibleTeams.length === 0 && (
          <EmptyState
            title={
              filter === "active"
                ? "Keine aktiven Teams"
                : filter === "disabled"
                  ? "Keine deaktivierten Teams"
                  : "Keine Teams gefunden"
            }
            description={
              filter === "disabled"
                ? "Es gibt derzeit keine deaktivierten Teams."
                : activePlayers.length < 2
                  ? "Erstelle zuerst mindestens zwei aktive Spieler."
                  : "Erstelle ein Team oder ändere den aktuellen Filter."
            }
            action={
              filter === "disabled" ? (
                <Button variant="outline" onClick={() => setFilter("active")}>
                  Filter zurücksetzen
                </Button>
              ) : (
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  disabled={!canCreateTeam}
                >
                  Team erstellen
                </Button>
              )
            }
          />
        )}
      {!teamsLoading && !(teamsError && !teams) && visibleTeams.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {visibleTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold">{team.name}</h2>
                      <StatusBadge enabled={team.enabled} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {team.player1.name} & {team.player2.name} · ELO:{" "}
                      {team.teamElo ?? "Noch keine Wertung"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/statistics?teamId=${team.id}`}>
                        <BarChart3 />
                        Statistiken
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isMutating}
                      onClick={() => void handleStatus(team)}
                    >
                      {team.enabled ? "Deaktivieren" : "Aktivieren"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isMutating}
                      onClick={() => setTeamToDelete(team)}
                    >
                      <Trash2 />
                      Löschen
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <TeamFormDialog
        open={isCreateOpen}
        players={activePlayers}
        onOpenChange={setIsCreateOpen}
        onCreated={(team) => {
          setSuccessMessage(`Team ${team.name} wurde erstellt.`);
          void reconcileTeamList((current) => [...current, team]);
        }}
      />
      <ConfirmDialog
        open={Boolean(teamToDelete)}
        onOpenChange={(open) => !open && setTeamToDelete(null)}
        title="Team löschen?"
        description={`Möchtest du ${teamToDelete?.name ?? "dieses Team"} wirklich löschen? Teams aus vergangenen Spielen können nicht gelöscht werden.`}
        confirmLabel={isMutating ? "Wird gelöscht ..." : "Löschen"}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
