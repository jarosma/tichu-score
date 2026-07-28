import { cn } from "@/lib/utils";
import type { AriaRole, ReactNode } from "react";

interface InlineMessageProps {
  children: ReactNode;
  variant?: "info" | "success" | "warning" | "error";
  id?: string;
  role?: AriaRole;
  "aria-live"?: "assertive" | "off" | "polite";
}

const variants = {
  info: "border-border bg-muted text-muted-foreground",
  success:
    "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  error: "border-destructive/30 bg-destructive/5 text-destructive",
};

export function InlineMessage({
  children,
  variant = "info",
  id,
  role,
  "aria-live": ariaLive,
}: InlineMessageProps) {
  const isAlert = variant === "error" || variant === "warning";

  return (
    <div
      id={id}
      role={role ?? (isAlert ? "alert" : "status")}
      aria-live={ariaLive ?? (isAlert ? "assertive" : "polite")}
      aria-atomic="true"
      className={cn("rounded-lg border px-4 py-3 text-sm", variants[variant])}
    >
      {children}
    </div>
  );
}
