import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/management/StatusBadge";

interface EntityListItem {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

interface EntityListProps {
  items: EntityListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function EntityList({ items, selectedId, onSelect }: EntityListProps) {
  return (
    <Card>
      <CardContent className="p-2">
        <ul className="space-y-1" aria-label="Spieler und Teams">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selectedId === item.id}
                onClick={() => onSelect(item.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-3 rounded-lg p-3 text-left transition-colors",
                  selectedId === item.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {item.name}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block truncate text-xs",
                      selectedId === item.id
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.description}
                  </span>
                  <span className="mt-2 block">
                    <StatusBadge enabled={item.enabled} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
