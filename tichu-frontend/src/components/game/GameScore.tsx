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

interface GamePageProps {
  game: Game;
}

export function GameScore({ game }: GamePageProps) {
  const roundScores = game.scores?.rounds || [];
  const totalTeam1 = roundScores.reduce((sum, entry) => sum + entry.team1, 0);
  const totalTeam2 = roundScores.reduce((sum, entry) => sum + entry.team2, 0);

  return (
    <Card className="w-full max-w-3xl shadow-lg">
      <CardHeader>
        <CardTitle>Scores</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="w-full flex flex-col m-4">
          {/* Table Header */}
          <Table className="table-fixed w-full border-t border-spacing-0">
            <TableHeader className="sticky top-0 z-10">
              <TableRow>
                <TableHead className="text-2xl">Runde</TableHead>
                <TableHead className="text-2xl">
                  {game.team1.name}{" "}
                  <a className="text-sm">
                    ({game.team1.player1.name} + {game.team1.player2.name})
                  </a>
                </TableHead>
                <TableHead className="text-2xl">
                  {game.team2.name}{" "}
                  <a className="text-sm">
                    ({game.team2.player1.name} + {game.team2.player2.name})
                  </a>
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>

          {/* Scrollable middle rows */}
          <div className="overflow-y-auto max-h-64">
            <Table className="table-fixed w-full border-t border-spacing-0">
              <TableBody>
                {roundScores.map((s) => (
                  <TableRow key={s.number}>
                    <TableCell className="text-xl">{s.number + 1}</TableCell>
                    <TableCell className="text-xl">{s.team1}</TableCell>
                    <TableCell className="text-xl">{s.team2}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Sticky bottom row */}
          <Table className="table-fixed w-full border-t border-spacing-0">
            <TableBody>
              <TableRow className="font-bold border-t sticky bottom-0 z-10">
                <TableCell className="text-3xl">Gesamt</TableCell>
                <TableCell className="text-3xl">{totalTeam1}</TableCell>
                <TableCell className="text-3xl">{totalTeam2}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
