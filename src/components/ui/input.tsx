import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const base = "w-full border-b border-border bg-transparent py-4 text-lg outline-none transition-colors placeholder:text-muted-foreground focus:border-gold";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(base, className)} {...props} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(base, "resize-none", className)} {...props} />;
}
