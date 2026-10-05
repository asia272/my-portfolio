import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-white shadow-lg shadow-primary/30 [background-image:var(--gradient)] hover:brightness-110",
        gold: "text-black shadow-lg shadow-gold/25 [background-image:var(--gold-gradient)] hover:brightness-105",
        outline: "glass hover:bg-muted",
        ghost: "hover:bg-muted",
      },
      size: { default: "px-7 py-3.5", sm: "px-4 py-2 text-sm", icon: "size-10" },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({ className, variant, size, ...props }: ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
