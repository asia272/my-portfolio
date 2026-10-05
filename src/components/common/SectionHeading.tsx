"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
    breadcrumb?: string;
    label?: string;
    title: string;
    highlightedText?: string;
    description?: string;
    maxWidth?: string;
    titleMaxWidth?: string;
    fontSize?: string;
    letterSpacing?: string;

    /**
     * Content alignment.
     * Defaults to "center".
     */
    align?: "center" | "start";

    className?: string;
}

export default function SectionHeading({
    breadcrumb,
    label,
    title,
    highlightedText,
    description,
    maxWidth = "max-w-4xl",
    titleMaxWidth = "max-w-2xl",
    fontSize = "clamp(1.75rem, 2.8vw, 2.2rem)",
    letterSpacing = "0.66px",
    align = "center",
    className,
}: SectionHeadingProps) {
    const isCenter = align === "center";

    return (
        <div
            className={cn(
                "mb-8 w-full",
                maxWidth,
                isCenter ? "mx-auto text-center" : "text-start",
                className
            )}
        >
            {/* Breadcrumb */}
            {breadcrumb && (
                <nav
                    aria-label="Breadcrumb"
                    className={cn(
                        "mb-7 flex items-center gap-2 text-sm font-medium",
                        isCenter ? "justify-center" : "justify-start"
                    )}
                >
                    <Link
                        href="/"
                        className="
                            text-muted-foreground
                            transition-colors
                            duration-300
                            hover:text-primary
                        "
                    >
                        Home
                    </Link>

                    <span
                        aria-hidden="true"
                        className="text-muted-foreground/40"
                    >
                        /
                    </span>

                    <span className="text-foreground/80">
                        {breadcrumb}
                    </span>
                </nav>
            )}

            {/* Label */}
            {label && (
                <div className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-dark">
                    <span className="h-px w-7 bg-gold-dark/70" />

                    <span>{label}</span>

                    <span className="h-px w-7 bg-gold-dark/70" />
                </div>
            )}

            {/* Title */}
            <h1
                className={cn(
                    "font-bold leading-tight text-foreground",
                    titleMaxWidth,
                    isCenter ? "mx-auto" : "mx-0"
                )}
                style={{
                    fontSize,
                    letterSpacing,
                }}
            >
                {title}

                {highlightedText && (
                    <>
                        {" "}
                        <span className="font-medium tracking-tight text-primary">
                            {highlightedText}
                        </span>
                    </>
                )}
            </h1>

            {/* Description */}
            {description && (
                <p
                    className={cn(
                        "mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8",
                        isCenter ? "mx-auto" : "mx-0"
                    )}
                >
                    {description}
                </p>
            )}
        </div>
    );
}