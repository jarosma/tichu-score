import { BarChart3, Plus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import useSWR, { mutate as mutateCache } from "swr";
import { Link } from "react-router-dom";
import {
  fetchPlayers,
  updatePlayerStatus,
  deletePlayer,
} from "@/lib/api/Players";
import type { Player } from "@/lib/Types";
import { apiKeys } from "@/lib/api/keys";
import { getApiErrorMessage } from "@/lib/api/client";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { ManagementTabs } from "@/components/management/ManagementTabs";
import { PlayerFormDialog } from "@/components/management/PlayerFormDialog";
import { ReturnToGameBanner } from "@/components/management/ReturnToGameBanner";
import { StatusBadge } from "@/components/management/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Filter = "active" | "disabled" | "all";

export function PlayersPage() {
  const [filter, setFilter] = useState<Filter>("active");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshWarning, setRefreshWarning] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const createOpenerRef = useRef<HTMLElement | null>(null);
  const deleteOpenerRef = useRef<HTMLElement | null>(null);
  const {
    data: players,
    error,
    isLoading,
    mutate,
  } = useSWR<Player[]>(apiKeys.players, fetchPlayers);

  const visiblePlayers = (players ?? []).filter((player) => {
    if (filter === "active") return player.enabled;
    if (filter === "disabled") return !player.enabled;
    return true;
  });

  function showRefreshWarning() {
    setRefreshWarning(
      "Die Änderung wurde gespeichert, aber die Liste konnte nicht aktualisiert werden.",
    );
  }

  async function refreshPlayerList() {
    try {
      const refreshedPlayers = await fetchPlayers();
      await mutate(refreshedPlayers, { revalidate: false });
      setRefreshWarning(null);
    } catch {
      showRefreshWarning();
    }
  }

  async function reconcilePlayerList(update: (current: Player[]) => Player[]) {
    try {
      await mutate((current) => update(current ?? []), { revalidate: false });
    } catch {
      showRefreshWarning();
    }
    try {
      const refreshedPlayers = await fetchPlayers();
      await mutate(refreshedPlayers, { revalidate: false });
    } catch {
      showRefreshWarning();
    }
  }

  async function handleStatus(player: Player) {
    setErrorMessage(null);
    setSuccessMessage(null);
    setRefreshWarning(null);
    setIsMutating(true);
    try {
      await updatePlayerStatus(player.id, !player.enabled);
    } catch (reason) {
      setErrorMessage(
        getApiErrorMessage(
          reason,
          "Spielerstatus konnte nicht geändert werden.",
        ),
      );
      setIsMutating(false);
      return;
    }
    setSuccessMessage(
      `Spieler ${player.enabled ? "deaktiviert" : "aktiviert"}.`,
    );
    await reconcilePlayerList((current) =>
      current.map((candidate) =>
        candidate.id === player.id
          ? { ...candidate, enabled: !player.enabled }
          : candidate,
      ),
    );
    try {
      await mutateCache(apiKeys.teams);
    } catch {
      showRefreshWarning();
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDelete() {
    if (!playerToDelete) return;
    const player = playerToDelete;
    setErrorMessage(null);
    setDeleteError(null);
    setSuccessMessage(null);
    setRefreshWarning(null);
    setIsMutating(true);
    try {
      await deletePlayer(player.id);
    } catch (reason) {
      setDeleteError(
        getApiErrorMessage(reason, "Spieler konnte nicht gelöscht werden."),
      );
      setIsMutating(false);
      return;
    }
    setPlayerToDelete(null);
    setDeleteError(null);
    setSuccessMessage("Spieler wurde gelöscht.");
    await reconcilePlayerList((current) =>
      current.filter((candidate) => candidate.id !== player.id),
    );
    try {
      await mutateCache(apiKeys.teams);
    } catch {
      showRefreshWarning();
    } finally {
      setIsMutating(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Spieler verwalten"
        actions={
          <Button
            onClick={(event) => {
              createOpenerRef.current = event.currentTarget;
              setIsCreateOpen(true);
            }}
            data-enter-primary="true"
          >
            <Plus />
            Spieler erstellen
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

      <div className="flex flex-wrap gap-2" aria-label="Spieler filtern">
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

      {isLoading && <LoadingState label="Spieler werden geladen ..." />}
      {error && !players && (
        <ErrorState
          description="Die Spieler konnten nicht geladen werden."
          action={
            <Button variant="outline" onClick={() => void refreshPlayerList()}>
              Erneut versuchen
            </Button>
          }
        />
      )}
      {!isLoading && !(error && !players) && visiblePlayers.length === 0 && (
        <EmptyState
          title={
            filter === "active"
              ? "Keine aktiven Spieler"
              : filter === "disabled"
                ? "Keine deaktivierten Spieler"
                : "Keine Spieler gefunden"
          }
          description={
            filter === "disabled"
              ? "Es gibt derzeit keine deaktivierten Spieler."
              : "Erstelle einen Spieler oder ändere den aktuellen Filter."
          }
          action={
            filter === "disabled" ? (
              <Button variant="outline" onClick={() => setFilter("active")}>
                Filter zurücksetzen
              </Button>
            ) : (
              <Button onClick={() => setIsCreateOpen(true)}>
                Spieler erstellen
              </Button>
            )
          }
        />
      )}
      {!isLoading && !(error && !players) && visiblePlayers.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {visiblePlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-semibold">{player.name}</h2>
                      <StatusBadge enabled={player.enabled} />
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      ELO: {player.elo ?? "Noch keine Wertung"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link to={`/statistics?playerId=${player.id}`}>
                        <BarChart3 />
                        Statistiken
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isMutating}
                      onClick={() => void handleStatus(player)}
                    >
                      {player.enabled ? "Deaktivieren" : "Aktivieren"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={isMutating}
                      onClick={(event) => {
                        deleteOpenerRef.current = event.currentTarget;
                        setDeleteError(null);
                        setPlayerToDelete(player);
                      }}
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

      <PlayerFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        openerRef={createOpenerRef}
        onCreated={(player) => {
          setSuccessMessage(`Spieler ${player.name} wurde erstellt.`);
          void reconcilePlayerList((current) => [...current, player]);
        }}
      />
      <ConfirmDialog
        open={Boolean(playerToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPlayerToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Spieler löschen?"
        description={`Möchtest du ${playerToDelete?.name ?? "diesen Spieler"} wirklich löschen? Spieler aus vergangenen Spielen können nicht gelöscht werden.`}
        confirmLabel={isMutating ? "Wird gelöscht ..." : "Löschen"}
        onConfirm={handleDelete}
        destructive
        error={deleteError}
        openerRef={deleteOpenerRef}
      />
    </div>
  );
}
