import type { Game } from "@/lib/Types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/EmptyState";

interface RoundHistoryProps {
  game: Game;
}

export function RoundHistory({ game }: RoundHistoryProps) {
  const rounds = game.scores.rounds;

  return (
    <Card className="flex min-h-0 flex-1 flex-col">
      <CardHeader>
        <CardTitle>Rundenverlauf</CardTitle>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 p-0">
        {rounds.length === 0 ? (
          <div className="p-6 pt-0">
            <EmptyState title="Noch keine Runden" />
          </div>
        ) : (
          <div className="h-full overflow-y-auto overflow-x-hidden">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead>Runde</TableHead>
                  <TableHead>{game.team1.name}</TableHead>
                  <TableHead>{game.team2.name}</TableHead>
                  <TableHead>Zeitpunkt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rounds.map((round) => (
                  <TableRow key={round.number}>
                    <TableCell className="font-medium">
                      {round.number + 1}
                    </TableCell>
                    <TableCell>{round.team1}</TableCell>
                    <TableCell>{round.team2}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(round.submittedAt).toLocaleTimeString("de-DE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
