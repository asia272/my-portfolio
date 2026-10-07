"use client";

import {
    AnimatePresence,
    motion,
    useAnimationFrame,
    useInView,
    useMotionValue,
    useReducedMotion,
    useTransform,
    type MotionValue,
} from "motion/react";

import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Pause,
    Play,
} from "lucide-react";

import Link from "next/link";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode,
    type RefObject,
} from "react";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";

import { Reveal } from "../animations/animations";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "../ui/carousel";

import ProjectCard from "../ProjectCard";

import {
    AnimatedBackground,
    useBackgroundPointer,
} from "../common/AnimatedBackground";

/* ============================================================
   CONSTANTS
============================================================ */

/** Time each slide stays before auto-advancing (ms). */
const AUTOPLAY_MS = 5200;

const EASE = [0.22, 1, 0.36, 1] as const;
const GOLD = "#ffd36a";
const SPRING = {
    type: "spring",
    stiffness: 420,
    damping: 22,
} as const;

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

/** Robot geometry (px, inside the 150 × 170 robot box, before responsive scaling). */
const ROBOT_W = 150;
const ROBOT_H = 170;
const PIVOT = { x: 102, y: 82 };
const TIP_X = 50;

type Aim = {
    angle: number;
    beamLen: number;
    endH: number;
};

const DEFAULT_AIM: Aim = {
    angle: 30,
    beamLen: 720,
    endH: 420,
};

/** Dust motes drifting along the beam (deterministic). */
const MOTES = Array.from({ length: 16 }, (_, i) => ({
    yFrac: ((i * 37) % 100) / 100 - 0.5,
    delay: (i % 8) * 0.45,
    dur: 2.6 + (i % 5) * 0.5,
    size: 1.5 + (i % 3),
}));

/**
 * Soft light cone with feathered edges.
 */
const cone = (half: number, alpha: number, rgb: string) =>
    `conic-gradient(
        from ${90 - half}deg at 0% 50%,
        rgba(${rgb},0) 0deg,
        rgba(${rgb},${(alpha * 0.18).toFixed(3)}) ${(half * 0.22).toFixed(2)}deg,
        rgba(${rgb},${(alpha * 0.45).toFixed(3)}) ${(half * 0.5).toFixed(2)}deg,
        rgba(${rgb},${(alpha * 0.78).toFixed(3)}) ${(half * 0.78).toFixed(2)}deg,
        rgba(${rgb},${alpha}) ${half.toFixed(2)}deg,
        rgba(${rgb},${(alpha * 0.78).toFixed(3)}) ${(half * 1.22).toFixed(2)}deg,
        rgba(${rgb},${(alpha * 0.45).toFixed(3)}) ${(half * 1.5).toFixed(2)}deg,
        rgba(${rgb},${(alpha * 0.18).toFixed(3)}) ${(half * 1.78).toFixed(2)}deg,
        rgba(${rgb},0) ${(half * 2).toFixed(2)}deg,
        rgba(${rgb},0) 360deg
    )`;

/** Light fades with distance from the lens. */
const distanceFade = (len: number, reach = 1) =>
    `radial-gradient(circle ${Math.round(
        len * reach
    )}px at 0% 50%, #000 0%, rgba(0,0,0,0.85) 28%, rgba(0,0,0,0.4) 65%, transparent 100%)`;

/* ============================================================
   ROBOT WITH TORCH
============================================================ */

function RobotTorch({
    aim,
    activeIndex,
    reduced,
    robotRef,
}: {
    aim: Aim;
    activeIndex: number;
    reduced: boolean;
    robotRef: RefObject<HTMLDivElement | null>;
}) {
    const rad = (aim.angle * Math.PI) / 180;

    const eyeX = Math.cos(rad) * 2.6;
    const eyeY = Math.sin(rad) * 2.6;

    const theta = clamp(
        (Math.atan2(aim.endH / 2, aim.beamLen) * 180) / Math.PI + 7,
        18,
        34
    );

    const flicker = reduced
        ? undefined
        : {
            opacity: [0.88, 1, 0.8, 1, 0.92],
        };

    const flickerTransition = {
        duration: 3.2,
        repeat: Infinity,
        ease: "easeInOut",
    } as const;

    return (
        <div
            ref={robotRef}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-10 hidden origin-top-left scale-[0.55] md:-top-16 md:block lg:-top-14 lg:scale-[0.75] xl:-top-12 xl:scale-100"
            style={{
                width: ROBOT_W,
                height: ROBOT_H,
            }}
        >
            <motion.div
                className="absolute inset-0"
                animate={
                    reduced
                        ? undefined
                        : {
                            y: [0, -5, 0],
                        }
                }
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                {/* ---------------- body ---------------- */}
                <svg
                    viewBox={`0 0 ${ROBOT_W} ${ROBOT_H}`}
                    className="absolute inset-0 size-full overflow-visible"
                >
                    <defs>
                        <linearGradient
                            id="rb-metal"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                        >
                            <stop offset="0" stopColor="#e6ebf5" />
                            <stop offset="1" stopColor="#8d99b1" />
                        </linearGradient>

                        <linearGradient
                            id="rb-dark"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="0" stopColor="#161c31" />
                            <stop offset="1" stopColor="#070a14" />
                        </linearGradient>

                        <linearGradient
                            id="rb-flame"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="0" stopColor={GOLD} />
                            <stop
                                offset="1"
                                stopColor={GOLD}
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>

                    {/* back arm */}
                    <rect
                        x="26"
                        y="80"
                        width="12"
                        height="38"
                        rx="6"
                        fill="url(#rb-metal)"
                        stroke="#5b6784"
                        strokeOpacity="0.5"
                    />

                    {/* thruster flame */}
                    <motion.path
                        d="M58 126 L90 126 L74 166 Z"
                        fill="url(#rb-flame)"
                        style={{
                            transformOrigin: "74px 126px",
                        }}
                        animate={
                            reduced
                                ? undefined
                                : {
                                    scaleY: [1, 1.3, 0.9, 1.2, 1],
                                }
                        }
                        transition={{
                            duration: 0.9,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* torso */}
                    <rect
                        x="42"
                        y="66"
                        width="62"
                        height="60"
                        rx="18"
                        fill="url(#rb-metal)"
                        stroke="#5b6784"
                        strokeOpacity="0.55"
                    />

                    <rect
                        x="52"
                        y="108"
                        width="42"
                        height="6"
                        rx="3"
                        fill="#1a2138"
                        opacity="0.45"
                    />

                    <circle
                        cx="73"
                        cy="88"
                        r="9"
                        fill="url(#rb-dark)"
                    />

                    <motion.circle
                        cx="73"
                        cy="88"
                        r="4.8"
                        fill={GOLD}
                        animate={
                            reduced
                                ? undefined
                                : {
                                    opacity: [0.55, 1, 0.55],
                                }
                        }
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* neck */}
                    <rect
                        x="64"
                        y="58"
                        width="18"
                        height="10"
                        rx="3"
                        fill="#7d89a3"
                    />

                    {/* antenna */}
                    <line
                        x1="73"
                        y1="9"
                        x2="73"
                        y2="22"
                        stroke="#7d89a3"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    <motion.circle
                        cx="73"
                        cy="7"
                        r="4.5"
                        fill={GOLD}
                        animate={
                            reduced
                                ? undefined
                                : {
                                    scale: [1, 1.35, 1],
                                    opacity: [0.7, 1, 0.7],
                                }
                        }
                        style={{
                            transformBox: "fill-box",
                            transformOrigin: "center",
                        }}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* head */}
                    <rect
                        x="37"
                        y="31"
                        width="9"
                        height="18"
                        rx="4.5"
                        fill="#7d89a3"
                    />

                    <rect
                        x="100"
                        y="31"
                        width="9"
                        height="18"
                        rx="4.5"
                        fill="#7d89a3"
                    />

                    <rect
                        x="44"
                        y="20"
                        width="58"
                        height="42"
                        rx="16"
                        fill="url(#rb-metal)"
                        stroke="#5b6784"
                        strokeOpacity="0.55"
                    />

                    <rect
                        x="51"
                        y="30"
                        width="44"
                        height="22"
                        rx="11"
                        fill="url(#rb-dark)"
                    />

                    {/* eyes */}
                    <motion.g
                        animate={{
                            x: eyeX,
                            y: eyeY,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 90,
                            damping: 14,
                        }}
                    >
                        <motion.g
                            style={{
                                transformBox: "fill-box",
                                transformOrigin: "center",
                            }}
                            animate={
                                reduced
                                    ? undefined
                                    : {
                                        scaleY: [1, 1, 0.1, 1],
                                    }
                            }
                            transition={{
                                duration: 4.5,
                                times: [0, 0.94, 0.97, 1],
                                repeat: Infinity,
                            }}
                        >
                            <circle
                                cx="64"
                                cy="41"
                                r="7.5"
                                fill={GOLD}
                                opacity="0.22"
                            />

                            <circle
                                cx="82"
                                cy="41"
                                r="7.5"
                                fill={GOLD}
                                opacity="0.22"
                            />

                            <circle
                                cx="64"
                                cy="41"
                                r="4.2"
                                fill={GOLD}
                            />

                            <circle
                                cx="82"
                                cy="41"
                                r="4.2"
                                fill={GOLD}
                            />
                        </motion.g>
                    </motion.g>

                    {/* shoulder joint */}
                    <circle
                        cx={PIVOT.x}
                        cy={PIVOT.y}
                        r="9"
                        fill="url(#rb-metal)"
                        stroke="#5b6784"
                        strokeOpacity="0.55"
                    />
                </svg>

                {/* ---------------- aiming arm + torch + beam ---------------- */}
                <div
                    className="absolute"
                    style={{
                        left: PIVOT.x,
                        top: PIVOT.y,
                    }}
                >
                    <motion.div
                        className="absolute left-0 top-0"
                        style={{
                            transformOrigin: "0px 0px",
                        }}
                        initial={false}
                        animate={{
                            rotate: aim.angle,
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 55,
                            damping: 13,
                        }}
                    >
                        <motion.div
                            key={activeIndex}
                            className="absolute left-0 top-0"
                            style={{
                                transformOrigin: "0px 0px",
                            }}
                            animate={
                                reduced
                                    ? undefined
                                    : {
                                        rotate: [0, -7, 3, 0],
                                    }
                            }
                            transition={{
                                duration: 1,
                                ease: EASE,
                            }}
                        >
                            {/* beam */}
                            <motion.div
                                key={`beam-${activeIndex}`}
                                className="absolute"
                                style={{
                                    left: TIP_X,
                                    top: -aim.endH / 2,
                                    width: aim.beamLen,
                                    height: aim.endH,
                                }}
                                initial={
                                    reduced
                                        ? false
                                        : {
                                            opacity: 0.2,
                                        }
                                }
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.8,
                                }}
                            >
                                {/* wide ambient halo */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        filter: "blur(34px)",
                                    }}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(
                                                theta * 1.15,
                                                0.32,
                                                "255,211,106"
                                            ),
                                            WebkitMaskImage:
                                                distanceFade(
                                                    aim.beamLen,
                                                    1.08
                                                ),
                                            maskImage: distanceFade(
                                                aim.beamLen,
                                                1.08
                                            ),
                                        }}
                                    />
                                </div>

                                {/* main torch beam */}
                                <motion.div
                                    className="absolute inset-0"
                                    style={{
                                        filter: "blur(16px)",
                                    }}
                                    animate={flicker}
                                    transition={flickerTransition}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(
                                                theta * 0.9,
                                                0.48,
                                                "255,211,106"
                                            ),
                                            WebkitMaskImage:
                                                distanceFade(
                                                    aim.beamLen,
                                                    1
                                                ),
                                            maskImage: distanceFade(
                                                aim.beamLen,
                                                1
                                            ),
                                        }}
                                    />
                                </motion.div>

                                {/* concentrated center light */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        filter: "blur(10px)",
                                    }}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(
                                                theta * 0.42,
                                                0.68,
                                                "255,240,190"
                                            ),
                                            WebkitMaskImage:
                                                distanceFade(
                                                    aim.beamLen,
                                                    0.72
                                                ),
                                            maskImage: distanceFade(
                                                aim.beamLen,
                                                0.72
                                            ),
                                        }}
                                    />
                                </div>

                                {/* main light body */}
                                <motion.div
                                    className="absolute inset-0"
                                    style={{
                                        filter: "blur(14px)",
                                    }}
                                    animate={flicker}
                                    transition={flickerTransition}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(
                                                theta * 0.68,
                                                0.42,
                                                "255,211,106"
                                            ),
                                            WebkitMaskImage:
                                                distanceFade(
                                                    aim.beamLen,
                                                    0.95
                                                ),
                                            maskImage: distanceFade(
                                                aim.beamLen,
                                                0.95
                                            ),
                                        }}
                                    />
                                </motion.div>

                                {/* hot core */}
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        filter: "blur(9px)",
                                    }}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(
                                                theta * 0.28,
                                                0.6,
                                                "255,240,190"
                                            ),
                                            WebkitMaskImage:
                                                distanceFade(
                                                    aim.beamLen,
                                                    0.6
                                                ),
                                            maskImage: distanceFade(
                                                aim.beamLen,
                                                0.6
                                            ),
                                        }}
                                    />
                                </div>

                                {/* dust motes */}
                                {!reduced &&
                                    MOTES.map((m, i) => (
                                        <motion.span
                                            key={i}
                                            className="absolute left-0 rounded-full"
                                            style={{
                                                top: "50%",
                                                width: m.size,
                                                height: m.size,
                                                background: "#ffe9a8",
                                                boxShadow:
                                                    "0 0 6px 1px rgba(255,211,106,0.8)",
                                            }}
                                            animate={{
                                                x: [0, aim.beamLen],
                                                y: [
                                                    0,
                                                    m.yFrac *
                                                    aim.endH *
                                                    0.7,
                                                ],
                                                opacity: [
                                                    0,
                                                    0.9,
                                                    0.9,
                                                    0,
                                                ],
                                            }}
                                            transition={{
                                                duration: m.dur,
                                                delay: m.delay,
                                                repeat: Infinity,
                                                ease: "linear",
                                            }}
                                        />
                                    ))}
                            </motion.div>

                            {/* arm + torch + gripping hand */}
                            <svg
                                width="1"
                                height="1"
                                className="absolute left-0 top-0 overflow-visible"
                            >
                                <defs>
                                    <radialGradient id="rb-glow">
                                        <stop
                                            offset="0"
                                            stopColor="#fff3c4"
                                            stopOpacity="0.95"
                                        />
                                        <stop
                                            offset="0.45"
                                            stopColor={GOLD}
                                            stopOpacity="0.55"
                                        />
                                        <stop
                                            offset="1"
                                            stopColor={GOLD}
                                            stopOpacity="0"
                                        />
                                    </radialGradient>
                                </defs>

                                <rect
                                    x="-4"
                                    y="-6"
                                    width="46"
                                    height="12"
                                    rx="6"
                                    fill="url(#rb-metal)"
                                    stroke="#5b6784"
                                    strokeOpacity="0.55"
                                />

                                <circle
                                    cx="42"
                                    cy="0"
                                    r="7"
                                    fill="#7d89a3"
                                    stroke="#5b6784"
                                    strokeOpacity="0.55"
                                />

                                <rect
                                    x="40"
                                    y="-5"
                                    width="38"
                                    height="10"
                                    rx="5"
                                    fill="url(#rb-metal)"
                                    stroke="#5b6784"
                                    strokeOpacity="0.55"
                                />

                                {/* torch handle */}
                                <rect
                                    x="45"
                                    y="-6"
                                    width="40"
                                    height="12"
                                    rx="4"
                                    fill="#2a3350"
                                    stroke="#0b1020"
                                    strokeOpacity="0.7"
                                />

                                <rect
                                    x="73"
                                    y="-6"
                                    width="3"
                                    height="12"
                                    fill={GOLD}
                                    opacity="0.85"
                                />

                                <rect
                                    x="79"
                                    y="-6"
                                    width="3"
                                    height="12"
                                    fill={GOLD}
                                    opacity="0.55"
                                />

                                {/* torch head */}
                                <path
                                    d="M83 -7 L50 -15 L50 15 L83 7 Z"
                                    fill="#3b466b"
                                    stroke="#0b1020"
                                    strokeOpacity="0.7"
                                />

                                {/* hand */}
                                <rect
                                    x="66"
                                    y="-11"
                                    width="28"
                                    height="22"
                                    rx="10"
                                    fill="url(#rb-metal)"
                                    stroke="#5b6784"
                                    strokeOpacity="0.6"
                                />

                                <path
                                    d="M75 -9 V9 M82 -9 V9 M89 -9 V9"
                                    stroke="#5b6784"
                                    strokeOpacity="0.5"
                                    strokeWidth="1.4"
                                    strokeLinecap="round"
                                />

                                <ellipse
                                    cx="80"
                                    cy="-11.5"
                                    rx="7"
                                    ry="3.4"
                                    fill="url(#rb-metal)"
                                    stroke="#5b6784"
                                    strokeOpacity="0.6"
                                />

                                {/* wrist cuff */}
                                <rect
                                    x="62"
                                    y="-7"
                                    width="7"
                                    height="14"
                                    rx="3"
                                    fill="#7d89a3"
                                    stroke="#5b6784"
                                    strokeOpacity="0.55"
                                />

                                {/* lens */}
                                <motion.circle
                                    cx={TIP_X - 4}
                                    cy="0"
                                    r="22"
                                    fill="url(#rb-glow)"
                                    style={{
                                        transformBox: "fill-box",
                                        transformOrigin: "center",
                                    }}
                                    animate={
                                        reduced
                                            ? undefined
                                            : {
                                                scale: [1, 1.25, 1],
                                                opacity: [
                                                    0.75,
                                                    1,
                                                    0.75,
                                                ],
                                            }
                                    }
                                    transition={{
                                        duration: 1.8,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                />

                                <ellipse
                                    cx="126"
                                    cy="0"
                                    rx="3.4"
                                    ry="12"
                                    fill="#fff3c4"
                                />

                                {/* flare */}
                                {!reduced && (
                                    <motion.circle
                                        key={`flare-${activeIndex}`}
                                        cx={TIP_X - 4}
                                        cy="0"
                                        r="26"
                                        fill="url(#rb-glow)"
                                        style={{
                                            transformBox: "fill-box",
                                            transformOrigin: "center",
                                        }}
                                        initial={{
                                            scale: 0.4,
                                            opacity: 1,
                                        }}
                                        animate={{
                                            scale: 2.4,
                                            opacity: 0,
                                        }}
                                        transition={{
                                            duration: 0.9,
                                            ease: EASE,
                                        }}
                                    />
                                )}
                            </svg>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}

/* ============================================================
   SMALL UI PIECES
============================================================ */

function ControlButton({
    label,
    onClick,
    children,
}: {
    label: string;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <motion.button
            type="button"
            aria-label={label}
            onClick={onClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.88 }}
            transition={SPRING}
            className="
                group/btn relative flex size-11 items-center justify-center rounded-full
                border border-border/80 bg-background/70 text-muted-foreground
                transition-colors duration-300
                hover:border-primary/40 hover:bg-primary/10 hover:text-foreground
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
            "
        >
            {children}
        </motion.button>
    );
}

/* ============================================================
   PAGINATION SEGMENT
============================================================ */

function Segment({
    index,
    current,
    inWindow,
    timer,
    showTimer,
    onSelect,
    total,
}: {
    index: number;
    current: number;
    inWindow: boolean;
    timer: MotionValue<number>;
    showTimer: boolean;
    onSelect: (i: number) => void;
    total: number;
}) {
    const isCurrent = index === current;
    const done = index < current;

    const headLeft = useTransform(timer, (v) => `${v * 100}%`);

    return (
        <button
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to project ${index + 1} of ${total}`}
            aria-current={isCurrent}
            className="group/seg relative flex h-7 min-w-0 flex-1 basis-0 items-center focus-visible:outline-none"
        >
            <span
                className={`relative block h-[4px] w-full rounded-full transition-[height,background-color] duration-500 group-hover/seg:h-[6px] group-focus-visible/seg:h-[6px] ${inWindow
                    ? "bg-primary/25"
                    : "bg-border"
                    }`}
            >
                <span className="absolute inset-0 overflow-hidden rounded-full">
                    <motion.span
                        initial={false}
                        animate={{
                            scaleX:
                                done || (isCurrent && !showTimer)
                                    ? 1
                                    : 0,
                        }}
                        transition={{
                            duration: 0.55,
                            ease: EASE,
                        }}
                        style={{
                            transformOrigin: "left",
                        }}
                        className="absolute inset-0 rounded-full bg-primary"
                    />

                    {isCurrent && showTimer && (
                        <motion.span
                            style={{
                                scaleX: timer,
                                transformOrigin: "left",
                            }}
                            className="absolute inset-0 overflow-hidden rounded-full bg-primary"
                        >
                            <motion.span
                                aria-hidden
                                animate={{
                                    x: ["-100%", "100%"],
                                }}
                                transition={{
                                    duration: 1.6,
                                    repeat: Infinity,
                                    ease: "linear",
                                }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                        </motion.span>
                    )}
                </span>

                {isCurrent && showTimer && (
                    <motion.span
                        aria-hidden
                        style={{
                            left: headLeft,
                        }}
                        className="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_3px_color-mix(in_srgb,var(--primary)_70%,transparent)]"
                    />
                )}
            </span>
        </button>
    );
}

/* ============================================================
   CENTER STAGE
============================================================ */

function CenterStage({
    activeIndex,
    reduced,
    columnRef,
}: {
    activeIndex: number;
    reduced: boolean;
    columnRef: RefObject<HTMLDivElement | null>;
}) {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 bottom-[7.5rem] flex justify-center"
        >
            <div
                ref={columnRef}
                className="relative h-full w-full md:w-1/2 lg:w-1/3"
            >
                {/* warm floor glow */}
                <div
                    className="absolute inset-x-[8%] bottom-0 h-14 rounded-[50%] blur-2xl"
                    style={{
                        background: "rgba(255, 211, 106, 0.26)",
                    }}
                />

                {/* ripple */}
                {!reduced && (
                    <motion.span
                        key={activeIndex}
                        initial={{
                            scale: 0.55,
                            opacity: 0.7,
                        }}
                        animate={{
                            scale: 1.55,
                            opacity: 0,
                        }}
                        transition={{
                            duration: 1.2,
                            ease: EASE,
                        }}
                        className="absolute inset-x-[8%] bottom-1 h-10 rounded-[50%] border"
                        style={{
                            borderColor: "rgba(255, 211, 106, 0.6)",
                        }}
                    />
                )}
            </div>
        </div>
    );
}

/* ============================================================
   SHOWCASE
============================================================ */

function ProjectsShowcase() {
    const reduced = !!useReducedMotion();

    /*
     * REAL PROJECT DATA
     * Convex returns undefined while loading, then the actual
     * projects from the database.
     */
    const projects = useQuery(api.projects.getActive);

    const sectionRef = useRef<HTMLElement>(null);
    const robotRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [centered, setCentered] = useState(0);
    const [snapCount, setSnapCount] = useState(0);
    const [inViewSlides, setInViewSlides] = useState<number[]>([]);
    const [aim, setAim] = useState<Aim>(DEFAULT_AIM);

    const [playing, setPlaying] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [docHidden, setDocHidden] = useState(false);

    const timer = useMotionValue(0);
    const elapsed = useRef(0);
    const lastCentered = useRef(0);

    const inView = useInView(sectionRef, {
        amount: 0.3,
    });

    const revealed = useInView(sectionRef, {
        once: true,
        amount: 0.2,
    });

    /* ---------- cursor-follow glow (shared hook) ---------- */

    const { pointerX, pointerY, glow, onPointerMove, onPointerLeave } =
        useBackgroundPointer(sectionRef, reduced);

    /* ---------- aim robot ---------- */

    const measureAim = useCallback(() => {
        const robot = robotRef.current;
        const stage = stageRef.current;

        if (!robot || !stage) return;

        const r = robot.getBoundingClientRect();
        const s = stage.getBoundingClientRect();

        if (!r.width || !s.width) return;

        const scale = r.width / ROBOT_W || 1;

        const sx = r.left + PIVOT.x * scale;
        const sy = r.top + PIVOT.y * scale;

        const tx = s.left + s.width * 0.32;
        const ty = s.top + s.height * 0.3;

        const dx = tx - sx;
        const dy = ty - sy;

        const dist = Math.hypot(dx, dy) / scale;

        const stageW = s.width / scale;

        const reach = Math.max(60, dist - TIP_X);

        const beamLen = reach + stageW * 0.3;

        const endH = clamp((stageW * beamLen) / reach, 200, 640);

        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        setAim((p) =>
            Math.abs(p.angle - angle) < 0.2 &&
                Math.abs(p.beamLen - beamLen) < 2 &&
                Math.abs(p.endH - endH) < 2
                ? p
                : {
                    angle,
                    beamLen,
                    endH,
                }
        );
    }, []);

    useEffect(() => {
        measureAim();

        const ro = new ResizeObserver(measureAim);

        if (sectionRef.current) {
            ro.observe(sectionRef.current);
        }

        window.addEventListener("resize", measureAim);

        const timers = [400, 1200, 2400].map((ms) =>
            window.setTimeout(measureAim, ms)
        );

        return () => {
            ro.disconnect();

            window.removeEventListener("resize", measureAim);

            timers.forEach(window.clearTimeout);
        };
    }, [measureAim, revealed, projects]);

    /* ---------- Embla options ---------- */

    const opts = useMemo(
        () => ({
            align: "center" as const,
            loop: true,
            slidesToScroll: 1,
            watchDrag: false,
            duration: reduced ? 6 : 32,
            inViewThreshold: 0.5,
        }),
        [reduced]
    );

    /* ---------- depth effect ---------- */

    const applyDepth = useCallback(
        (embla: NonNullable<CarouselApi>) => {
            if (reduced) return;

            const root = embla.rootNode().getBoundingClientRect();

            if (!root.width) return;

            const cx = root.left + root.width / 2;

            let best = 0;
            let bestAbs = Infinity;

            embla.slideNodes().forEach((node, idx) => {
                const el =
                    node.querySelector<HTMLElement>("[data-depth]");

                if (!el) return;

                const r = node.getBoundingClientRect();

                if (!r.width) return;

                const d = clamp(
                    (r.left + r.width / 2 - cx) / r.width,
                    -2,
                    2
                );

                const abs = Math.abs(d);

                if (abs < bestAbs) {
                    bestAbs = abs;
                    best = idx;
                }

                const w = clamp(1 - abs, 0, 1);

                const side = clamp(d, -1, 1);

                el.style.setProperty("--active", w.toFixed(3));

                el.style.transform = `perspective(1400px) translateY(${(1 - w) * 16
                    }px) rotateY(${side * -8
                    }deg) scale(${0.88 + w * 0.12})`;

                el.style.opacity = String(0.38 + w * 0.62);

                el.style.filter =
                    w > 0.995
                        ? "none"
                        : `blur(${((1 - w) * 1.4).toFixed(2)}px)`;
            });

            if (best !== lastCentered.current) {
                lastCentered.current = best;

                setCentered(best);
            }
        },
        [reduced]
    );

    /* ---------- sync Embla ---------- */

    useEffect(() => {
        if (!carouselApi) return;

        const syncSelected = () => {
            setCurrent(carouselApi.selectedScrollSnap());

            elapsed.current = 0;
            timer.set(0);
        };

        const syncInView = () =>
            setInViewSlides(carouselApi.slidesInView());

        const onScroll = () => applyDepth(carouselApi);

        const onReInit = () => {
            setSnapCount(carouselApi.scrollSnapList().length);

            syncSelected();
            syncInView();
            applyDepth(carouselApi);
        };

        onReInit();

        carouselApi.on("select", syncSelected);
        carouselApi.on("slidesInView", syncInView);
        carouselApi.on("scroll", onScroll);
        carouselApi.on("resize", onScroll);
        carouselApi.on("reInit", onReInit);

        return () => {
            carouselApi.off("select", syncSelected);
            carouselApi.off("slidesInView", syncInView);
            carouselApi.off("scroll", onScroll);
            carouselApi.off("resize", onScroll);
            carouselApi.off("reInit", onReInit);
        };
    }, [carouselApi, applyDepth, timer]);

    useEffect(() => {
        const onVis = () => setDocHidden(document.hidden);

        document.addEventListener("visibilitychange", onVis);

        return () =>
            document.removeEventListener("visibilitychange", onVis);
    }, []);

    /* ---------- navigation ---------- */

    const next = useCallback(() => {
        if (!carouselApi) return;

        if (carouselApi.canScrollNext()) {
            carouselApi.scrollNext();
        } else {
            carouselApi.scrollTo(0);
        }
    }, [carouselApi]);

    const prev = useCallback(() => {
        if (!carouselApi) return;

        if (carouselApi.canScrollPrev()) {
            carouselApi.scrollPrev();
        } else {
            carouselApi.scrollTo(
                carouselApi.scrollSnapList().length - 1
            );
        }
    }, [carouselApi]);

    const goTo = useCallback(
        (i: number) => carouselApi?.scrollTo(i),
        [carouselApi]
    );

    /* ---------- auto-play ---------- */

    const interactive = projects !== undefined && snapCount > 1;

    const canPlay =
        !!carouselApi &&
        playing &&
        !reduced &&
        interactive &&
        !hovered &&
        !focused &&
        inView &&
        !docHidden;

    const showTimer = playing && !reduced && interactive;

    useAnimationFrame((_, delta) => {
        if (!canPlay) return;

        elapsed.current += Math.min(delta, 100);

        timer.set(Math.min(1, elapsed.current / AUTOPLAY_MS));

        if (elapsed.current >= AUTOPLAY_MS) {
            elapsed.current = 0;
            next();
        }
    });

    /* ---------- keyboard ---------- */

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Home") {
            e.preventDefault();
            goTo(0);
        } else if (e.key === "End") {
            e.preventDefault();
            goTo(snapCount - 1);
        }
    };

    const onFocus = (e: FocusEvent<HTMLDivElement>) => {
        if (e.target.matches(":focus-visible")) {
            setFocused(true);
        }
    };

    const onBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (
            !e.currentTarget.contains(e.relatedTarget as Node | null)
        ) {
            setFocused(false);
        }
    };

    /* ============================================================
       LOADING STATE
    ============================================================ */

    if (projects === undefined) {
        return (
            <section
                id="projects"
                ref={sectionRef}
                className="relative overflow-hidden py-24 sm:py-28 lg:py-32"
            >
                <Container>
                    <Reveal>
                        <SectionHeading
                            label="Selected Work"
                            title="Projects that"
                            highlightedText="show the work"
                            description="A selection of full-stack and web projects I've built to solve real problems, explore modern technologies, and continuously sharpen my engineering skills."
                        />
                    </Reveal>

                    <div className="mt-14 flex min-h-[300px] items-center justify-center">
                        <div className="size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                    </div>
                </Container>
            </section>
        );
    }

    /* ============================================================
       EMPTY STATE
    ============================================================ */

    if (projects.length === 0) {
        return null;
    }

    /* ============================================================
       ACTIVE PROJECT
    ============================================================ */

    const activeIndex = reduced ? current : centered;

    return (
        <section
            id="projects"
            ref={sectionRef}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className="relative overflow-hidden py-24 sm:py-28 lg:py-32"
        >
            {/* ---------- Animated background ---------- */}

            <AnimatedBackground
                reduced={reduced}
                running={inView && !docHidden}
                targetRef={sectionRef}
                pointerX={pointerX}
                pointerY={pointerY}
                glow={glow}
            />

            <Container className="relative">
                <Reveal>
                    <SectionHeading
                        label="Selected Work"
                        title="Projects that"
                        highlightedText="show the work"
                        description="A selection of full-stack and web projects I've built to solve real problems, explore modern technologies, and continuously sharpen my engineering skills."
                    />
                </Reveal>

                <Reveal delay={0.08}>
                    <Carousel
                        setApi={setCarouselApi}
                        opts={opts}
                        aria-label="Projects"
                        tabIndex={0}
                        onKeyDown={onKeyDown}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        className="mt-14 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-8 focus-visible:ring-offset-background sm:mt-16"
                    >
                        {/* ---------- Center stage ---------- */}

                        <CenterStage
                            activeIndex={activeIndex}
                            reduced={reduced}
                            columnRef={stageRef}
                        />

                        {/* ---------- Slides ---------- */}

                        <CarouselContent className="ml-0 py-8">
                            {projects.map((project, i) => (
                                <CarouselItem
                                    key={`${project.slug ?? project.title}-${i}`}
                                    className="basis-full px-3 md:basis-1/2 lg:basis-1/3"
                                >
                                    <ProjectCard
                                        project={{
                                            title: project.title,
                                            description:
                                                project.description ?? "",
                                            image: project.image ?? "",
                                            live: project.liveDemo ?? "#",
                                            type: project.type,
                                            repo: project.github ?? "#",
                                            detailHref: `/projects/${project.slug}`,
                                        }}
                                        index={i}
                                        isActive={i === activeIndex}
                                        reduced={reduced}
                                        revealed={revealed}
                                        timer={timer}
                                        showTimer={showTimer}
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* ---------- Control dock ---------- */}

                        <div className="relative">
                            <div className="flex flex-col items-center gap-4">
                                {/* Segmented progress */}

                                <div className="flex w-full items-center gap-1.5">
                                    {Array.from(
                                        { length: snapCount },
                                        (_, i) => (
                                            <Segment
                                                key={i}
                                                index={i}
                                                current={current}
                                                inWindow={inViewSlides.includes(
                                                    i
                                                )}
                                                timer={timer}
                                                showTimer={showTimer}
                                                onSelect={goTo}
                                                total={snapCount}
                                            />
                                        )
                                    )}
                                </div>

                                {/* Handlers */}

                                <div className="flex items-center justify-center gap-2">
                                    <ControlButton
                                        label="Previous project"
                                        onClick={prev}
                                    >
                                        <ArrowLeft
                                            className="size-4 transition-transform duration-300 group-hover/btn:-translate-x-0.5"
                                            aria-hidden
                                        />
                                    </ControlButton>

                                    <motion.button
                                        type="button"
                                        aria-label={
                                            playing
                                                ? "Pause auto-play"
                                                : "Start auto-play"
                                        }
                                        aria-pressed={!playing}
                                        onClick={() =>
                                            setPlaying((p) => !p)
                                        }
                                        whileHover={{
                                            scale: 1.1,
                                        }}
                                        whileTap={{
                                            scale: 0.88,
                                        }}
                                        transition={SPRING}
                                        className="
                                            relative flex size-11 items-center justify-center rounded-full
                                            border border-border/80 bg-background/70 text-foreground
                                            transition-colors duration-300
                                            hover:border-primary/40 hover:bg-primary/10
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                                        "
                                    >
                                        <svg
                                            viewBox="0 0 44 44"
                                            className="pointer-events-none absolute inset-0 -rotate-90"
                                            aria-hidden
                                        >
                                            <circle
                                                cx="22"
                                                cy="22"
                                                r="20.5"
                                                fill="none"
                                                strokeWidth="1.5"
                                                className="stroke-border"
                                            />

                                            {showTimer && (
                                                <motion.circle
                                                    cx="22"
                                                    cy="22"
                                                    r="20.5"
                                                    fill="none"
                                                    strokeWidth="1.75"
                                                    strokeLinecap="round"
                                                    className="stroke-primary"
                                                    style={{
                                                        pathLength: timer,
                                                    }}
                                                />
                                            )}
                                        </svg>

                                        <AnimatePresence
                                            mode="wait"
                                            initial={false}
                                        >
                                            <motion.span
                                                key={
                                                    playing
                                                        ? "pause"
                                                        : "play"
                                                }
                                                initial={{
                                                    scale: 0.4,
                                                    opacity: 0,
                                                    rotate: -40,
                                                }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: 1,
                                                    rotate: 0,
                                                }}
                                                exit={{
                                                    scale: 0.4,
                                                    opacity: 0,
                                                    rotate: 40,
                                                }}
                                                transition={{
                                                    duration: 0.22,
                                                    ease: EASE,
                                                }}
                                                className="flex"
                                            >
                                                {playing ? (
                                                    <Pause
                                                        className="size-4"
                                                        aria-hidden
                                                    />
                                                ) : (
                                                    <Play
                                                        className="size-4 translate-x-px"
                                                        aria-hidden
                                                    />
                                                )}
                                            </motion.span>
                                        </AnimatePresence>
                                    </motion.button>

                                    <ControlButton
                                        label="Next project"
                                        onClick={next}
                                    >
                                        <ArrowRight
                                            className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                                            aria-hidden
                                        />
                                    </ControlButton>
                                </div>
                            </div>
                        </div>

                        {/* Screen-reader announcement */}

                        <p
                            className="sr-only"
                            aria-live={playing ? "off" : "polite"}
                        >
                            Showing project {current + 1} of {snapCount}:{" "}
                            {projects[current]?.title}
                        </p>
                    </Carousel>
                </Reveal>

                {/* ---------- CTA ---------- */}

                <Reveal delay={0.12} className="mt-14 flex sm:mt-16">
                    <Link
                        href="/projects"
                        className="custom-btn group inline-flex items-center gap-2"
                    >
                        See all projects

                        <ArrowUpRight
                            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden
                        />
                    </Link>
                </Reveal>

                {/* ---------- Robot ---------- */}

                <RobotTorch
                    aim={aim}
                    activeIndex={activeIndex}
                    reduced={reduced}
                    robotRef={robotRef}
                />
            </Container>
        </section>
    );
}

export default function Projects() {
    return <ProjectsShowcase />;
}