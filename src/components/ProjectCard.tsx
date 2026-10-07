
"use client";

import {
    AnimatePresence,
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
    type MotionValue,
} from "motion/react";

import {
    ArrowUpRight,
    ExternalLink,
} from "lucide-react";

import Link from "next/link";

import {
    useEffect,
    type CSSProperties,
    type PointerEvent as ReactPointerEvent,
} from "react";

import { Badge } from "./ui/badge";
import { SpotlightCard } from "./animations/animations";
import { GithubIcon } from "./icons";

const EASE = [0.22, 1, 0.36, 1] as const;

const GOLD = "#ffd36a";

export interface ProjectCardData {
    title: string;
    description: string;
    image: string;


    type: string;

    live: string;
    repo: string;

    detailHref?: string;
}

interface ProjectCardProps {
    project: ProjectCardData;

    index?: number;

    isActive?: boolean;

    reduced?: boolean;

    revealed?: boolean;

    timer?: MotionValue<number>;

    showTimer?: boolean;

    className?: string;
}

/* ---------------------------------------------
   Project type badge styles
--------------------------------------------- */

const getProjectTypeStyle = (type: string) => {
    const normalized = type.toLowerCase();

    if (
        normalized.includes("full") ||
        normalized.includes("stack")
    ) {
        return {
            className:
                "border-violet-400/30 bg-violet-500/10 text-violet-500 dark:text-violet-300",
        };
    }

    if (
        normalized.includes("e-commerce") ||
        normalized.includes("ecommerce")
    ) {
        return {
            className:
                "border-emerald-400/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
        };
    }

    if (normalized.includes("saas")) {
        return {
            className:
                "border-blue-400/30 bg-blue-500/10 text-blue-600 dark:text-blue-300",
        };
    }

    if (
        normalized.includes("gen") ||
        normalized.includes("ai")
    ) {
        return {
            className:
                "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
        };
    }

    if (
        normalized.includes("mobile") ||
        normalized.includes("app")
    ) {
        return {
            className:
                "border-cyan-400/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300",
        };
    }

    if (
        normalized.includes("web") ||
        normalized.includes("development")
    ) {
        return {
            className:
                "border-amber-400/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
        };
    }

    return {
        className:
            "border-primary/25 bg-primary/10 text-primary",
    };
};

/**
 * Reusable project card.
 *
 * The card intentionally shows only the essential
 * project information. Detailed information belongs
 * on the dedicated project detail page.
 */
export default function ProjectCard({
    project,
    index = 0,
    isActive = false,
    reduced = false,
    revealed = true,
    timer,
    showTimer = false,
    className = "",
}: ProjectCardProps) {
    const prefersReducedMotion = useReducedMotion();

    const shouldReduceMotion =
        reduced || !!prefersReducedMotion;

    const accent =
        index % 2 === 1
            ? GOLD
            : "var(--primary)";

    /* ---------------------------------------------
       3D mouse tilt
    --------------------------------------------- */

    const rx = useMotionValue(0);
    const ry = useMotionValue(0);

    const tiltX = useSpring(rx, {
        stiffness: 180,
        damping: 18,
    });

    const tiltY = useSpring(ry, {
        stiffness: 180,
        damping: 18,
    });

    useEffect(() => {
        if (!isActive) {
            rx.set(0);
            ry.set(0);
        }
    }, [isActive, rx, ry]);

    const onTilt = (
        e: ReactPointerEvent<HTMLDivElement>,
    ) => {
        if (
            !isActive ||
            shouldReduceMotion ||
            e.pointerType !== "mouse"
        ) {
            return;
        }

        const rect =
            e.currentTarget.getBoundingClientRect();

        if (!rect.width || !rect.height) {
            return;
        }

        ry.set(
            ((e.clientX - rect.left) /
                rect.width -
                0.5) *
            8,
        );

        rx.set(
            -(
                (e.clientY - rect.top) /
                rect.height -
                0.5
            ) * 8,
        );
    };

    const onTiltEnd = () => {
        rx.set(0);
        ry.set(0);
    };

    /* ---------------------------------------------
       Detail link
    --------------------------------------------- */

    const detailHref =
        project.detailHref ?? "/projects";

    /* ---------------------------------------------
       Short description
    --------------------------------------------- */

    const SHORT_DESCRIPTION_LENGTH = 105;

    const shortDescription =
        project.description.length >
            SHORT_DESCRIPTION_LENGTH
            ? `${project.description
                .slice(
                    0,
                    SHORT_DESCRIPTION_LENGTH,
                )
                .trim()}...`
            : project.description;

    const typeStyle =
        getProjectTypeStyle(project.type);

    return (
        <motion.div
            initial={false}
            animate={
                shouldReduceMotion || revealed
                    ? {
                        opacity: 1,
                        y: 0,
                    }
                    : {
                        opacity: 0,
                        y: 48,
                    }
            }
            transition={{
                duration: 0.9,
                ease: EASE,
                delay: shouldReduceMotion
                    ? 0
                    : 0.1 + (index % 3) * 0.12,
            }}
            className={`h-full ${className}`}
        >
            <div
                data-depth
                style={
                    shouldReduceMotion
                        ? ({
                            "--active":
                                isActive ? 1 : 0,
                            opacity: isActive
                                ? 1
                                : 0.55,
                        } as CSSProperties)
                        : undefined
                }
                className="h-full will-change-transform"
            >
                <motion.div
                    onPointerMove={onTilt}
                    onPointerLeave={onTiltEnd}
                    style={{
                        rotateX: tiltX,
                        rotateY: tiltY,
                        transformPerspective: 1100,
                    }}
                    className="relative h-full"
                >
                    {/* ---------------------------------------------
                       Active glow
                    --------------------------------------------- */}

                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[1.5rem]"
                        style={{
                            boxShadow:
                                "0 24px 60px -20px color-mix(in srgb, var(--primary) calc(var(--active, 0) * 65%), transparent)",
                        }}
                    />

                    <SpotlightCard className="group relative h-full overflow-hidden rounded-[1.5rem] border-border/70 bg-card/95 backdrop-blur-xl transition-colors duration-500 hover:border-primary/30">
                        {/* ---------------------------------------------
                           Active timer
                        --------------------------------------------- */}

                        {isActive &&
                            showTimer &&
                            timer && (
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 top-0 z-20 h-[3px] bg-border/30"
                                >
                                    <motion.span
                                        style={{
                                            scaleX: timer,
                                            transformOrigin:
                                                "left",
                                        }}
                                        className="block h-full bg-gradient-to-r from-primary to-[#ffd36a]"
                                    />
                                </span>
                            )}

                        {/* ---------------------------------------------
                           Active light
                        --------------------------------------------- */}

                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[15]"
                            style={{
                                opacity:
                                    "var(--active, 0)",
                            }}
                        >
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(ellipse 85% 60% at 0% 0%, rgba(255,211,106,0.28), rgba(255,211,106,0.08) 45%, transparent 72%)",
                                }}
                                animate={
                                    shouldReduceMotion
                                        ? undefined
                                        : {
                                            opacity: [
                                                0.8,
                                                1,
                                                0.72,
                                                1,
                                                0.88,
                                            ],
                                        }
                                }
                                transition={{
                                    duration: 3.2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>

                        {/* ---------------------------------------------
                           Active flare
                        --------------------------------------------- */}

                        {isActive &&
                            !shouldReduceMotion && (
                                <motion.div
                                    aria-hidden
                                    initial={{
                                        opacity: 0.95,
                                        scale: 0.4,
                                    }}
                                    animate={{
                                        opacity: 0,
                                        scale: 1.7,
                                    }}
                                    transition={{
                                        duration: 1.1,
                                        ease: EASE,
                                    }}
                                    className="pointer-events-none absolute -left-16 -top-16 z-[16] size-72 rounded-full"
                                    style={{
                                        background:
                                            "radial-gradient(circle, rgba(255,243,196,0.9), rgba(255,211,106,0.35) 40%, transparent 70%)",
                                    }}
                                />
                            )}

                        {/* ---------------------------------------------
                           Project image
                        --------------------------------------------- */}

                        <div className="relative h-[190px] overflow-hidden sm:h-[205px]">
                            <div className="absolute inset-0 bg-secondary" />

                            <div
                                className="absolute inset-0 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                                style={{
                                    filter: "saturate(calc(0.65 + var(--active, 0) * 0.35))",
                                }}
                            >
                                <motion.img
                                    src={project.image}
                                    alt={`${project.title} project preview`}
                                    loading="lazy"
                                    decoding="async"
                                    animate={{
                                        scale:
                                            isActive &&
                                                !shouldReduceMotion
                                                ? 1.08
                                                : 1,
                                    }}
                                    transition={
                                        isActive
                                            ? {
                                                duration:
                                                    6.7,
                                                ease: "linear",
                                            }
                                            : {
                                                duration:
                                                    0.9,
                                                ease: EASE,
                                            }
                                    }
                                    className="size-full object-cover"
                                />
                            </div>

                            {/* Image overlay */}

                            <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10"
                            />

                            {/* Active shine */}

                            {isActive &&
                                !shouldReduceMotion && (
                                    <motion.span
                                        aria-hidden
                                        initial={{
                                            x: "-150%",
                                        }}
                                        animate={{
                                            x: "450%",
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            ease: EASE,
                                            delay: 0.15,
                                        }}
                                        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    />
                                )}

                            {/* Project number */}

                            <div
                                className={`absolute left-4 top-4 z-10 flex size-8 items-center justify-center rounded-full border text-[10px] font-medium backdrop-blur-md transition-all duration-500 ${isActive
                                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_60%,transparent)]"
                                    : "border-white/15 bg-black/25 text-white/90"
                                    }`}
                            >
                                {String(
                                    index + 1,
                                ).padStart(2, "0")}
                            </div>


                        </div>

                        {/* ---------------------------------------------
                           Content
                        --------------------------------------------- */}

                        <div className="flex min-h-[215px] flex-col p-5 sm:p-6">
                            {/* ---------------------------------------------
                               Project type
                            --------------------------------------------- */}

                            <div className="mb-3">
                                <Badge
                                    // variant="outline"
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide ${typeStyle.className}`}
                                >
                                    {project.type}
                                </Badge>
                            </div>

                            {/* ---------------------------------------------
                               Title
                            --------------------------------------------- */}

                            <h3
                                className={`relative line-clamp-2 min-h-[3.5rem] pr-1 text-xl font-semibold leading-7 tracking-tight transition-colors duration-300 group-hover:text-primary sm:text-[1.4rem] sm:leading-7 ${isActive ? "text-primary" : ""
                                    }`}
                            >
                                {project.title}

                                <motion.span
                                    aria-hidden
                                    initial={false}
                                    animate={{
                                        scaleX: isActive ? 1 : 0,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: EASE,
                                    }}
                                    style={{
                                        transformOrigin: "left",
                                    }}
                                    className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-primary to-[#ffd36a]"
                                />
                            </h3>

                            {/* ---------------------------------------------
                               Short description
                            --------------------------------------------- */}

                            <p
                                className={`mt-2 line-clamp-2 text-[13px] leading-5 transition-colors duration-500 ${isActive
                                    ? "text-foreground/75"
                                    : "text-muted-foreground"
                                    }`}
                                title={
                                    project.description
                                }
                            >
                                {shortDescription}
                            </p>

                            {/* ---------------------------------------------
                               Links
                            --------------------------------------------- */}


                            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                                {/* View details */}

                                <Link
                                    href={detailHref}
                                    className="group/details inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/15 hover:shadow-[0_8px_24px_-12px_var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                >
                                    <span>View Details</span>

                                    <ArrowUpRight
                                        className="size-3.5 transition-transform duration-300 group-hover/details:-translate-y-0.5 group-hover/details:translate-x-0.5"
                                        aria-hidden
                                    />
                                </Link>

                                {/* External links */}

                                <div className="flex items-center gap-2">
                                    <a
                                        href={project.live}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Open ${project.title} live demo`}
                                        title="Live Demo"
                                        className="group/link inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                    >
                                        <ExternalLink
                                            className="size-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5"
                                            aria-hidden
                                        />

                                        <span>Live</span>
                                    </a>

                                    <a
                                        href={project.repo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Open ${project.title} source code`}
                                        title="Source Code"
                                        className="group/link inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-secondary/50 px-3 py-2 text-xs font-medium text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                                    >
                                        <GithubIcon
                                            className="size-3.5 transition-transform duration-300 group-hover/link:scale-110"
                                            aria-hidden
                                        />

                                        <span>Code</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </SpotlightCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
