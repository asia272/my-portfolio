"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="size-10 rounded-full"
                aria-label="Toggle theme"
            />
        );
    }

    const isDark = theme === "dark";

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="
        size-10
        rounded-full
        text-foreground
        transition-all
        duration-300
        hover:bg-primary/10
        hover:text-primary
      "
            aria-label={
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            }
        >
            {isDark ? (
                <Sun className="size-5" />
            ) : (
                <Moon className="size-5" />
            )}
        </Button>
    );
}