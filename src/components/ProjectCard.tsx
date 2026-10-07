
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

/**
 * Keep the card independent from the carousel.
 *
 * The parent decides:
 * - whether the card is active
 * - which index it has
 * - whether the reveal animation has happened
 * - timer/progress state
 * - where the detail page lives
 */

export interface ProjectCardData {
    title: string;
    description: string;
    image: string;
    tags: string[];
    live: string;
    repo: string;

    /**
     * Optional detail page URL.
     *
     * Example:
     * /projects/project/my-project
     */
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

    /**
     * Optional className so the same card can be
     * reused in different layouts.
     */
    className?: string;
}

/**
 * Reusable project card.
 *
 * This component does NOT know about:
 * - Embla
 * - CarouselApi
 * - carousel position
 * - autoplay
 * - section state
 * - robot torch
 *
 * Those things remain inside Projects.tsx.
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

    const SHORT_DESCRIPTION_LENGTH = 135;

    const shortDescription =
        project.description.length >
            SHORT_DESCRIPTION_LENGTH
            ? `${project.description.slice(
                0,
                SHORT_DESCRIPTION_LENGTH,
            ).trim()}...`
            : project.description;

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
                        className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
                        style={{
                            boxShadow:
                                "0 24px 60px -20px color-mix(in srgb, var(--primary) calc(var(--active, 0) * 65%), transparent)",
                        }}
                    />

                    <SpotlightCard className="group relative h-full overflow-hidden rounded-[1.75rem] border-border/70 bg-card/95 backdrop-blur-xl transition-colors duration-500 hover:border-primary/30">
                        {/* ---------------------------------------------
                           Active timer line
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
                                        "radial-gradient(ellipse 85% 60% at 0% 0%, rgba(255,211,106,0.34), rgba(255,211,106,0.10) 45%, transparent 72%)",
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

                        <div className="relative h-[245px] overflow-hidden sm:h-[275px]">
                            <div className="absolute inset-0 bg-secondary" />

                            <div
                                className="absolute inset-0 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                                style={{
                                    filter: "saturate(calc(0.6 + var(--active, 0) * 0.4))",
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
                                                ? 1.1
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

                            <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"
                            />

                            {/* Shine when active */}
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
                                        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                    />
                                )}

                            {/* Project number */}

                            <div
                                className={`absolute left-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border text-[11px] font-medium backdrop-blur-md transition-colors duration-500 ${isActive
                                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_60%,transparent)]"
                                    : "border-white/15 bg-black/25 text-white/90"
                                    }`}
                            >
                                {String(
                                    index + 1,
                                ).padStart(2, "0")}
                            </div>

                            {/* External arrow */}

                            <div className="absolute right-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/90 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
                                <ArrowUpRight
                                    className="size-4"
                                    aria-hidden
                                />
                            </div>
                        </div>

                        {/* ---------------------------------------------
                           Content
                        --------------------------------------------- */}

                        <div className="relative flex min-h-[255px] flex-col p-6 sm:p-7">
                            {/* Status */}

                            <div className="mb-3 flex items-center gap-2">
                                <span className="relative flex size-1.5">
                                    {isActive &&
                                        !shouldReduceMotion && (
                                            <motion.span
                                                aria-hidden
                                                animate={{
                                                    scale: [
                                                        1,
                                                        3,
                                                    ],
                                                    opacity: [
                                                        0.6,
                                                        0,
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 1.6,
                                                    repeat: Infinity,
                                                    ease: "easeOut",
                                                }}
                                                className="absolute inset-0 rounded-full"
                                                style={{
                                                    background:
                                                        accent,
                                                }}
                                            />
                                        )}

                                    <span
                                        className="relative size-1.5 rounded-full"
                                        style={{
                                            background:
                                                accent,
                                        }}
                                    />
                                </span>

                                <AnimatePresence
                                    mode="wait"
                                    initial={false}
                                >
                                    <motion.span
                                        key={
                                            isActive
                                                ? "live"
                                                : "idle"
                                        }
                                        initial={{
                                            opacity: 0,
                                            y: 6,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -6,
                                        }}
                                        transition={{
                                            duration: 0.25,
                                            ease: EASE,
                                        }}
                                        className={`text-[11px] font-medium uppercase tracking-[0.16em] ${isActive
                                            ? "text-primary"
                                            : "text-muted-foreground"
                                            }`}
                                    >
                                        {isActive
                                            ? "Now Viewing"
                                            : "Selected Project"}
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            {/* Title */}

                            <h3
                                className={`relative w-fit text-2xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary sm:text-[1.65rem] ${isActive
                                    ? "text-primary"
                                    : ""
                                    }`}
                            >
                                {project.title}

                                <motion.span
                                    aria-hidden
                                    initial={false}
                                    animate={{
                                        scaleX: isActive
                                            ? 1
                                            : 0,
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        ease: EASE,
                                        delay: isActive
                                            ? 0.15
                                            : 0,
                                    }}
                                    style={{
                                        transformOrigin:
                                            "left",
                                    }}
                                    className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-primary to-[#ffd36a]"
                                />
                            </h3>

                            {/* Short description */}

                            <p
                                className={`mt-3 line-clamp-3 text-sm leading-6 transition-colors duration-500 ${isActive
                                    ? "text-foreground/80"
                                    : "text-muted-foreground"
                                    }`}
                                title={
                                    project.description
                                }
                            >
                                {shortDescription}
                            </p>

                            {/* Tags */}

                            <div className="mt-5 flex flex-wrap gap-1.5">
                                {project.tags
                                    .slice(0, 5)
                                    .map(
                                        (
                                            tag,
                                            t,
                                        ) => (
                                            <motion.span
                                                key={
                                                    tag
                                                }
                                                className="inline-flex"
                                                animate={
                                                    isActive &&
                                                        !shouldReduceMotion
                                                        ? {
                                                            y: [
                                                                8,
                                                                0,
                                                            ],
                                                            opacity:
                                                                [
                                                                    0,
                                                                    1,
                                                                ],
                                                        }
                                                        : {
                                                            y: 0,
                                                            opacity: 1,
                                                        }
                                                }
                                                transition={{
                                                    duration: 0.5,
                                                    ease: EASE,
                                                    delay: isActive
                                                        ? 0.2 +
                                                        t *
                                                        0.06
                                                        : 0,
                                                }}
                                            >
                                                <Badge
                                                    className={`text-[10px] font-medium transition-colors duration-300 group-hover:border-primary/20 group-hover:text-foreground ${isActive
                                                        ? "border-primary/30 bg-primary/10 text-foreground"
                                                        : "border-border/70 bg-secondary/70 text-muted-foreground"
                                                        }`}
                                                >
                                                    {
                                                        tag
                                                    }
                                                </Badge>
                                            </motion.span>
                                        ),
                                    )}
                            </div>

                            {/* ---------------------------------------------
                               Links
                            --------------------------------------------- */}

                            <div className="mt-auto flex flex-wrap items-center gap-4 pt-7">
                                {/* View details */}

                                <Link
                                    href={detailHref}
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-300 hover:text-primary/75 focus-visible:outline-none focus-visible:underline"
                                >
                                    View details

                                    <ArrowUpRight
                                        className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        aria-hidden
                                    />
                                </Link>

                                {/* Live demo */}

                                <a
                                    href={
                                        project.live
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:underline"
                                >
                                    Live demo

                                    <ExternalLink
                                        className="size-3.5"
                                        aria-hidden
                                    />
                                </a>

                                {/* Source */}

                                <a
                                    href={
                                        project.repo
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:underline"
                                >
                                    <GithubIcon
                                        className="size-4"
                                        aria-hidden
                                    />

                                    Source
                                </a>
                            </div>
                        </div>
                    </SpotlightCard>
                </motion.div>
            </div>
        </motion.div>
    );
}
