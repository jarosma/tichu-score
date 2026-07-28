import { BarChart3, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import useSWR, { mutate as mutateCache } from "swr";
import { Link } from "react-router-dom";
import {
  fetchPlayers,
  updatePlayerStatus,
  deletePlayer,
} from "@/lib/api/Players";
import type { Player } from "@/lib/Types";
import { apiKeys } from "@/lib/api/keys";
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
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

  async function handleStatus(player: Player) {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsMutating(true);
      await updatePlayerStatus(player.id, !player.enabled);
      await mutate();
      try {
        await mutateCache(apiKeys.teams);
      } catch {
        // The player mutation succeeded; a dependent cache can refresh later.
      }
      setSuccessMessage(
        `Spieler ${player.enabled ? "deaktiviert" : "aktiviert"}.`,
      );
    } catch (reason) {
      setErrorMessage(
        reason instanceof Error
          ? reason.message
          : "Spielerstatus konnte nicht geändert werden.",
      );
    } finally {
      setIsMutating(false);
    }
  }

  async function handleDelete() {
    if (!playerToDelete) return;
    try {
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsMutating(true);
      await deletePlayer(playerToDelete.id);
      await mutate();
      try {
        await mutateCache(apiKeys.teams);
      } catch {
        // The player mutation succeeded; a dependent cache can refresh later.
      }
      setSuccessMessage("Spieler wurde gelöscht.");
      setPlayerToDelete(null);
    } catch (reason) {
      setErrorMessage(
        reason instanceof Error
          ? reason.message
          : "Spieler konnte nicht gelöscht werden.",
      );
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
            onClick={() => setIsCreateOpen(true)}
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
      {error && (
        <ErrorState
          description="Die Spieler konnten nicht geladen werden."
          action={
            <Button variant="outline" onClick={() => void mutate()}>
              Erneut versuchen
            </Button>
          }
        />
      )}
      {!isLoading && !error && visiblePlayers.length === 0 && (
        <EmptyState
          title={
            filter === "active"
              ? "Keine aktiven Spieler"
              : "Keine Spieler gefunden"
          }
          description="Erstelle einen Spieler oder ändere den aktuellen Filter."
          action={
            <Button onClick={() => setIsCreateOpen(true)}>
              Spieler erstellen
            </Button>
          }
        />
      )}
      {!isLoading && !error && visiblePlayers.length > 0 && (
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
                      onClick={() => setPlayerToDelete(player)}
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
        onCreated={(player) => {
          void mutate();
          setSuccessMessage(`Spieler ${player.name} wurde erstellt.`);
        }}
      />
      <ConfirmDialog
        open={Boolean(playerToDelete)}
        onOpenChange={(open) => !open && setPlayerToDelete(null)}
        title="Spieler löschen?"
        description={`Möchtest du ${playerToDelete?.name ?? "diesen Spieler"} wirklich löschen? Spieler aus vergangenen Spielen können nicht gelöscht werden.`}
        confirmLabel={isMutating ? "Wird gelöscht ..." : "Löschen"}
        onConfirm={handleDelete}
        destructive
      />
    </div>
  );
}
