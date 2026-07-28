import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface ErrorStateProps {
  title?: string;
  description: string;
  action?: ReactNode;
}

export function ErrorState({
  title = "Etwas ist schiefgelaufen",
  description,
  action,
}: ErrorStateProps) {
  return (
    <div
      className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center"
      role="alert"
    >
      <AlertCircle className="size-5 text-destructive" />
      <h2 className="mt-3 font-semibold">{title}</h2>
      <p className="mt-1 max-w-md text-sm text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
