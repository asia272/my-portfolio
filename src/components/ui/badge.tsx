import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: ComponentProps<"span">) {
  return <span className={cn("inline-flex items-center rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-gold hover:text-gold", className)} {...props} />;
}
