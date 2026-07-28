import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Team } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { areTeamsCompatible } from "@/lib/gameSetup";

interface TeamPickerDialogProps {
  open: boolean;
  slot: 1 | 2;
  teams: Team[];
  selectedTeam: Team | null;
  occupiedTeam: Team | null;
  onOpenChange: (open: boolean) => void;
  onSelect: (team: Team) => void;
}

export function TeamPickerDialog({
  open,
  slot,
  teams,
  selectedTeam,
  occupiedTeam,
  onOpenChange,
  onSelect,
}: TeamPickerDialogProps) {
  const [search, setSearch] = useState("");

  const visibleTeams = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return teams.filter((team) => {
      if (occupiedTeam && !areTeamsCompatible(team, occupiedTeam)) return false;
      return (
        !normalizedSearch ||
        `${team.name} ${team.player1.name} ${team.player2.name}`
          .toLocaleLowerCase()
          .includes(normalizedSearch)
      );
    });
  }, [occupiedTeam, search, teams]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Team {slot} auswählen</DialogTitle>
          <DialogDescription>
            Suche nach einem Team oder einem der beiden Spieler.
          </DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Team suchen"
            className="pl-9"
            placeholder="Team suchen ..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter" || visibleTeams.length === 0) return;
              const firstTeam = document.getElementById(
                "first-team-picker-result",
              );
              if (!firstTeam) return;
              event.preventDefault();
              firstTeam.focus();
            }}
            autoFocus
          />
        </div>
        <ScrollArea className="h-[min(55vh,24rem)] pr-3">
          <div className="grid gap-2">
            {visibleTeams.map((team, index) => (
              <Button
                key={team.id}
                id={index === 0 ? "first-team-picker-result" : undefined}
                variant={selectedTeam?.id === team.id ? "default" : "outline"}
                className="h-auto justify-start whitespace-normal py-3 text-left"
                onClick={() => {
                  onSelect(team);
                  onOpenChange(false);
                }}
              >
                <span>
                  <span className="block font-medium">{team.name}</span>
                  <span className="block text-xs opacity-70">
                    {team.player1.name} & {team.player2.name}
                  </span>
                </span>
              </Button>
            ))}
            {visibleTeams.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Keine passenden Teams gefunden.
              </p>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
