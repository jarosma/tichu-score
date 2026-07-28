import { X } from "lucide-react";
import type { Team } from "@/lib/Types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SelectedTeamCardProps {
  slot: 1 | 2;
  team: Team | null;
  onClear: () => void;
  onChange: () => void;
  enterPrimary?: boolean;
}

export function SelectedTeamCard({
  slot,
  team,
  onClear,
  onChange,
  enterPrimary = false,
}: SelectedTeamCardProps) {
  return (
    <div className="relative">
      <Card
        className="cursor-pointer border-dashed transition-colors hover:border-primary/60 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
        role="button"
        tabIndex={0}
        data-enter-primary={enterPrimary ? "true" : undefined}
        aria-label={
          team ? `Team ${slot} ändern: ${team.name}` : `Team ${slot} auswählen`
        }
        onClick={onChange}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onChange();
          }
        }}
      >
        <CardContent className="flex min-h-28 items-center gap-4 p-5 pr-14">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Team {slot}
            </p>
            {team ? (
              <>
                <p className="mt-2 truncate text-lg font-semibold">
                  {team.name}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {team.player1.name} & {team.player2.name}
                </p>
              </>
            ) : (
              <p className="mt-2 text-muted-foreground">
                Noch kein Team ausgewählt
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      {team && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3"
          onClick={onClear}
          aria-label={`Team ${slot} entfernen`}
        >
          <X />
        </Button>
      )}
    </div>
  );
}
