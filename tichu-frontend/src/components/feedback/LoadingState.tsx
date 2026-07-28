interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Laden ..." }: LoadingStateProps) {
  return (
    <div
      className="flex min-h-32 items-center justify-center rounded-xl border border-dashed bg-card px-6 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <span className="mr-3 size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
      {label}
    </div>
  );
}
