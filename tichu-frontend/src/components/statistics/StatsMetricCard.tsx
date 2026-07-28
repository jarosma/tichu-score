interface StatsMetricCardProps {
  label: string;
  value: string | number;
}

export function StatsMetricCard({ label, value }: StatsMetricCardProps) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}
