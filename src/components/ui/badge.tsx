import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: ReactNode;
  variant?: "purple" | "gold" | "muted";
  className?: string;
}

const variants = {
  purple: "border-primary/30 bg-primary/10 text-primary",
  gold: "border-gold/40 bg-gold/10 text-gold-dark dark:text-gold",
  muted: "border-border bg-muted/60 text-muted-foreground",
};

export function Badge({ children, variant = "purple", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
