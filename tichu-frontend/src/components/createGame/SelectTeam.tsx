import useSWR from "swr";
import type { Team, Player } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchTeams } from "@/lib/api/Teams";

interface SelectTeamProps {
  selectedTeam: Team | null;
  onSelect: (team: Team) => void;
  occupiedPlayers?: Player[];
  title: string;
}

export function SelectTeam({
  selectedTeam,
  onSelect,
  occupiedPlayers = [],
  title,
}: SelectTeamProps) {
  const { data: teams = [] } = useSWR<Team[]>("/teams", fetchTeams);

  function isTeamDisabled(team: Team) {
    return occupiedPlayers.some(
      (p) => p.id === team.player1.id || p.id === team.player2.id,
    );
  }

  return (
    <div>
      <Label>{title}</Label>
      <div className="grid grid-cols-1 gap-2 mt-1">
        {teams.map(
          (team) =>
            isTeamDisabled(team) || (
              <Button
                key={team.id}
                variant={selectedTeam?.id === team.id ? "default" : "outline"}
                onClick={() => onSelect(team)}
              >
                {team.name}: {team.player1.name} & {team.player2.name}
              </Button>
            ),
        )}
      </div>
    </div>
  );
}
