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
      <CardContent>
        <Table>
          <TableHeader>
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
          <TableBody>
            {roundScores.map((s) => (
              <TableRow key={s.number}>
                <TableCell className="text-xl">{s.number + 1}</TableCell>
                <TableCell className="text-xl">{s.team1}</TableCell>
                <TableCell className="text-xl">{s.team2}</TableCell>
              </TableRow>
            ))}
            {/* Gesamtscore */}
            <TableRow className="font-bold border-t">
              <TableCell className="text-3xl">Gesamt</TableCell>
              <TableCell className="text-3xl">{totalTeam1}</TableCell>
              <TableCell className="text-3xl">{totalTeam2}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
