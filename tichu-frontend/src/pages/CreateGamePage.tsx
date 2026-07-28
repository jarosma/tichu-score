import { Shuffle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import useSWR from "swr";
import type { Team } from "@/lib/Types";
import { startGame } from "@/lib/api/Games";
import { fetchPlayers } from "@/lib/api/Players";
import { fetchTeams } from "@/lib/api/Teams";
import { apiKeys } from "@/lib/api/keys";
import { getCompatiblePairs, areTeamsCompatible } from "@/lib/gameSetup";
import { createRequestKey } from "@/lib/requestKey";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { InlineMessage } from "@/components/feedback/InlineMessage";
import { LoadingState } from "@/components/feedback/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuickStartDialog } from "@/components/game-setup/QuickStartDialog";
import { SelectedTeamCard } from "@/components/game-setup/SelectedTeamCard";
import { TeamPickerDialog } from "@/components/game-setup/TeamPickerDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CreateGamePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [team1, setTeam1] = useState<Team | null>(null);
  const [team2, setTeam2] = useState<Team | null>(null);
  const [pickerSlot, setPickerSlot] = useState<1 | 2 | null>(null);
  const [isQuickStartOpen, setIsQuickStartOpen] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startKey, setStartKey] = useState<string | null>(null);

  const {
    data: teams,
    error: teamsError,
    isLoading: teamsLoading,
    mutate: refreshTeams,
  } = useSWR<Team[]>(apiKeys.teams, fetchTeams);
  const { data: players, isLoading: playersLoading } = useSWR(
    apiKeys.players,
    fetchPlayers,
  );
  const activePlayers = (players ?? []).filter((player) => player.enabled);
  const availableTeams = (teams ?? []).filter(
    (team) => team.enabled && team.player1.enabled && team.player2.enabled,
  );
  const hasCompatiblePair = getCompatiblePairs(availableTeams).length > 0;

  useEffect(() => {
    if (!teams) return;

    const enabledTeams = teams.filter(
      (team) => team.enabled && team.player1.enabled && team.player2.enabled,
    );
    setTeam1(
      enabledTeams.find((team) => team.id === searchParams.get("team1")) ??
        null,
    );
    setTeam2(
      enabledTeams.find((team) => team.id === searchParams.get("team2")) ??
        null,
    );
  }, [searchParams, teams]);

  function updateSelection(nextTeam1: Team | null, nextTeam2: Team | null) {
    const nextParams = new URLSearchParams(searchParams);
    if (nextTeam1) nextParams.set("team1", nextTeam1.id);
    else nextParams.delete("team1");
    if (nextTeam2) nextParams.set("team2", nextTeam2.id);
    else nextParams.delete("team2");
    setSearchParams(nextParams, { replace: true });
  }

  function selectTeam(slot: 1 | 2, team: Team) {
    setStartKey(null);
    if (slot === 1) {
      if (team2 && !areTeamsCompatible(team, team2)) return;
      setTeam1(team);
      updateSelection(team, team2);
    } else {
      if (team1 && !areTeamsCompatible(team1, team)) return;
      setTeam2(team);
      updateSelection(team1, team);
    }
    setStartError(null);
  }

  function clearTeam(slot: 1 | 2) {
    setStartKey(null);
    if (slot === 1) {
      setTeam1(null);
      updateSelection(null, team2);
    } else {
      setTeam2(null);
      updateSelection(team1, null);
    }
  }

  function handleQuickStartComplete(nextTeam1: Team, nextTeam2: Team) {
    setStartKey(null);
    setTeam1(nextTeam1);
    setTeam2(nextTeam2);
    updateSelection(nextTeam1, nextTeam2);
    setStartError(null);
  }

  function managePath(path: "/manage/teams" | "/manage/players") {
    const returnTo = `${location.pathname}${location.search}`;
    return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
  }

  async function handleStartGame() {
    if (!team1 || !team2) {
      setStartError("Bitte wähle beide Teams aus.");
      return;
    }
    if (!team1.enabled || !team2.enabled || !areTeamsCompatible(team1, team2)) {
      setStartError("Bitte wähle zwei kompatible aktive Teams aus.");
      return;
    }

    try {
      setStartError(null);
      setIsStarting(true);
      const requestKey = startKey ?? createRequestKey();
      setStartKey(requestKey);
      const game = await startGame(team1.id, team2.id, requestKey);
      navigate(`/game/${game.id}/spectate`, { state: { newGame: game } });
    } catch {
      setStartError(
        "Das Spiel konnte nicht gestartet werden. Deine Auswahl bleibt erhalten.",
      );
    } finally {
      setIsStarting(false);
    }
  }

  const enterTarget = !team1 ? "team1" : !team2 ? "team2" : "start";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Spiel starten" />

      {startError && (
        <InlineMessage variant="error">{startError}</InlineMessage>
      )}

      {teamsLoading && <LoadingState label="Teams werden geladen ..." />}
      {teamsError && (
        <ErrorState
          description="Die Teams konnten nicht geladen werden."
          action={
            <Button variant="outline" onClick={() => void refreshTeams()}>
              Erneut versuchen
            </Button>
          }
        />
      )}

      {!teamsLoading &&
        !teamsError &&
        availableTeams.length === 0 &&
        !playersLoading &&
        activePlayers.length < 4 && (
          <EmptyState
            title="Keine aktiven Teams vorhanden"
            description="Erstelle oder aktiviere ein Team in der Verwaltung, bevor du ein Spiel startest."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button asChild>
                  <Link to={managePath("/manage/teams")}>Teams verwalten</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to={managePath("/manage/players")}>
                    Spieler verwalten
                  </Link>
                </Button>
              </div>
            }
          />
        )}

      {!teamsLoading &&
        !teamsError &&
        (availableTeams.length > 0 || activePlayers.length >= 4) && (
          <Card>
            <CardContent className="space-y-6 p-4 sm:p-6">
              <div className="grid gap-3 md:grid-cols-2">
                <SelectedTeamCard
                  slot={1}
                  team={team1}
                  onChange={() => setPickerSlot(1)}
                  onClear={() => clearTeam(1)}
                  enterPrimary={enterTarget === "team1"}
                />
                <SelectedTeamCard
                  slot={2}
                  team={team2}
                  onChange={() => setPickerSlot(2)}
                  onClear={() => clearTeam(2)}
                  enterPrimary={enterTarget === "team2"}
                />
              </div>

              <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">
                    Zufällige Teams für ein Spiel erstellen
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Wähle vier Spieler und lasse die Teams zufällig bilden.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setIsQuickStartOpen(true)}
                >
                  <Shuffle />
                  Zufällige Partie
                </Button>
              </div>

              <div className="flex flex-col justify-between gap-4 border-t pt-5 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to={managePath("/manage/teams")}>
                      Teams verwalten
                    </Link>
                  </Button>
                  <Button asChild variant="ghost">
                    <Link to={managePath("/manage/players")}>
                      Spieler verwalten
                    </Link>
                  </Button>
                </div>
                <Button
                  onClick={handleStartGame}
                  disabled={!team1 || !team2 || isStarting}
                  data-enter-primary={
                    enterTarget === "start" ? "true" : undefined
                  }
                >
                  {isStarting ? "Spiel wird gestartet ..." : "Spiel starten"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

      {!teamsLoading &&
        !teamsError &&
        availableTeams.length > 0 &&
        !hasCompatiblePair && (
          <EmptyState
            title="Keine kompatible Teamkombination"
            description="Die aktiven Teams teilen Spieler. Aktiviere oder erstelle ein weiteres kompatibles Team."
            action={
              <Button asChild>
                <Link to={managePath("/manage/teams")}>Teams verwalten</Link>
              </Button>
            }
          />
        )}

      {pickerSlot !== null && (
        <TeamPickerDialog
          open
          slot={pickerSlot}
          teams={availableTeams}
          selectedTeam={pickerSlot === 1 ? team1 : team2}
          occupiedTeam={pickerSlot === 1 ? team2 : team1}
          onOpenChange={(open) => !open && setPickerSlot(null)}
          onSelect={(team) => {
            selectTeam(pickerSlot, team);
            setPickerSlot(null);
          }}
        />
      )}
      {isQuickStartOpen && (
        <QuickStartDialog
          open
          players={activePlayers}
          teams={availableTeams}
          onOpenChange={setIsQuickStartOpen}
          onComplete={handleQuickStartComplete}
        />
      )}
    </div>
  );
}
