import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EntitySearchProps {
  value: string;
  onChange: (value: string) => void;
  entityLabel: string;
}

export function EntitySearch({
  value,
  onChange,
  entityLabel,
}: EntitySearchProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="statistics-search">{entityLabel} suchen</Label>
      <Input
        id="statistics-search"
        data-enter-primary="true"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={`${entityLabel} suchen ...`}
      />
    </div>
  );
}
