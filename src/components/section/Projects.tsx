"use client";

/**
 * Projects section built on the shadcn/ui Carousel (Embla) — "robot torch" edition.
 *
 * Requires:  npx shadcn@latest add carousel
 *
 * Behaviour (unchanged):
 *  - 3 slides on desktop, 2 on tablet, 1 on mobile
 *  - auto-play with a visible countdown (ring + segmented progress)
 *  - pauses on hover / keyboard focus / hidden tab / off-screen
 *  - no mouse-drag or wheel scrolling – only auto-play, buttons, segments, arrow keys
 *  - the ACTIVE card is the CENTER card (center-aligned carousel)
 *
 * This version:
 *  - The robot stands at the top-left corner of the CENTERED content container
 *    (not the far corner of the full-width section).
 *  - The torch light is a real soft light: feathered cone gradients + heavy blur + distance
 *    fade, so there are no visible box / triangle edges anywhere.
 *  - The torch is gripped by the robot's hand (fist + thumb wrap the handle).
 *  - The rotating gradient "border beam" on the active card is removed.
 *  - Responsive: the robot scales down on tablet / laptop and the aim is re-measured
 *    from the real layout (scale-aware). Hidden on phones where the card is full width.
 */

import {
    AnimatePresence,
    motion,
    useAnimationFrame,
    useInView,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    ExternalLink,
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
    type CSSProperties,
    type FocusEvent,
    type KeyboardEvent,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type RefObject,
} from "react";

import { projects } from "@/lib/data";

import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import { Reveal, SpotlightCard } from "../animations/animations";
import { Badge } from "../ui/badge";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "../ui/carousel";
import { GithubIcon } from "../icons";

/* ============================================================
   CONSTANTS
============================================================ */

/** Time each slide stays before auto-advancing (ms). */
const AUTOPLAY_MS = 5200;

const EASE = [0.22, 1, 0.36, 1] as const;
const GOLD = "#ffd36a";
const SPRING = { type: "spring", stiffness: 420, damping: 22 } as const;

type Project = (typeof projects)[number];

const pad2 = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const GRID_LINES =
    "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)";

/** The constellation is visible at the edges and fades out behind the cards / heading. */
const EDGE_ONLY_MASK =
    "radial-gradient(ellipse 62% 58% at 50% 52%, transparent 30%, black 100%)";

/** Robot geometry (px, inside the 150 × 170 robot box, before responsive scaling). */
const ROBOT_W = 150;
const ROBOT_H = 170;
const PIVOT = { x: 102, y: 82 }; // right shoulder — the arm rotates around this point
const TIP_X = 50; // torch lens, measured from the shoulder along the arm

type Aim = {
    angle: number; // degrees, shoulder → target
    beamLen: number; // px (robot units), from the torch lens
    endH: number; // px (robot units), beam height at its far end
};

const DEFAULT_AIM: Aim = { angle: 30, beamLen: 720, endH: 420 };

/** Dust motes drifting along the beam (deterministic). */
const MOTES = Array.from({ length: 16 }, (_, i) => ({
    yFrac: ((i * 37) % 100) / 100 - 0.5,
    delay: (i % 8) * 0.45,
    dur: 2.6 + (i % 5) * 0.5,
    size: 1.5 + (i % 3),
}));

/**
 * Soft light cone with feathered edges.
 * A conic gradient centred on the torch lens; `half` is the half-angle in degrees.
 * Alpha is 0 at both edges and peaks on the axis, so no hard edge ever shows.
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
    `radial-gradient(circle ${Math.round(len * reach)}px at 0% 50%, #000 0%, rgba(0,0,0,0.85) 28%, rgba(0,0,0,0.4) 65%, transparent 100%)`;

/* ============================================================
   ROBOT WITH TORCH
   The arm group rotates around the shoulder; the beam is a child of the arm,
   so it always leaves the torch lens no matter how the arm moves.
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

    // half-angle of the light cone so that it exactly spans the beam box (edges fade to 0)
    const theta = clamp(
        (Math.atan2(aim.endH / 2, aim.beamLen) * 180) / Math.PI + 7,
        18,
        34
    );

    const flicker = reduced ? undefined : { opacity: [0.88, 1, 0.8, 1, 0.92] };
    const flickerTransition = { duration: 3.2, repeat: Infinity, ease: "easeInOut" } as const;

    return (
        <div
            ref={robotRef}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 z-10 hidden origin-top-left scale-[0.55] md:-top-16 md:block lg:-top-14 lg:scale-[0.75] xl:-top-12 xl:scale-100"
            style={{ width: ROBOT_W, height: ROBOT_H }}
        >
            {/* whole robot hovers */}
            <motion.div
                className="absolute inset-0"
                animate={reduced ? undefined : { y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* ---------------- body ---------------- */}
                <svg viewBox={`0 0 ${ROBOT_W} ${ROBOT_H}`} className="absolute inset-0 size-full overflow-visible">
                    <defs>
                        <linearGradient id="rb-metal" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#e6ebf5" />
                            <stop offset="1" stopColor="#8d99b1" />
                        </linearGradient>
                        <linearGradient id="rb-dark" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#161c31" />
                            <stop offset="1" stopColor="#070a14" />
                        </linearGradient>
                        <linearGradient id="rb-flame" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor={GOLD} />
                            <stop offset="1" stopColor={GOLD} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* back arm */}
                    <rect x="26" y="80" width="12" height="38" rx="6" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.5" />

                    {/* thruster flame */}
                    <motion.path
                        d="M58 126 L90 126 L74 166 Z"
                        fill="url(#rb-flame)"
                        style={{ transformOrigin: "74px 126px" }}
                        animate={reduced ? undefined : { scaleY: [1, 1.3, 0.9, 1.2, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* torso */}
                    <rect x="42" y="66" width="62" height="60" rx="18" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.55" />
                    <rect x="52" y="108" width="42" height="6" rx="3" fill="#1a2138" opacity="0.45" />
                    <circle cx="73" cy="88" r="9" fill="url(#rb-dark)" />
                    <motion.circle
                        cx="73"
                        cy="88"
                        r="4.8"
                        fill={GOLD}
                        animate={reduced ? undefined : { opacity: [0.55, 1, 0.55] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* neck */}
                    <rect x="64" y="58" width="18" height="10" rx="3" fill="#7d89a3" />

                    {/* antenna */}
                    <line x1="73" y1="9" x2="73" y2="22" stroke="#7d89a3" strokeWidth="3" strokeLinecap="round" />
                    <motion.circle
                        cx="73"
                        cy="7"
                        r="4.5"
                        fill={GOLD}
                        animate={reduced ? undefined : { scale: [1, 1.35, 1], opacity: [0.7, 1, 0.7] }}
                        style={{ transformBox: "fill-box", transformOrigin: "center" }}
                        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    />

                    {/* head */}
                    <rect x="37" y="31" width="9" height="18" rx="4.5" fill="#7d89a3" />
                    <rect x="100" y="31" width="9" height="18" rx="4.5" fill="#7d89a3" />
                    <rect x="44" y="20" width="58" height="42" rx="16" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.55" />
                    <rect x="51" y="30" width="44" height="22" rx="11" fill="url(#rb-dark)" />

                    {/* eyes — look toward the active card, blink now and then */}
                    <motion.g animate={{ x: eyeX, y: eyeY }} transition={{ type: "spring", stiffness: 90, damping: 14 }}>
                        <motion.g
                            style={{ transformBox: "fill-box", transformOrigin: "center" }}
                            animate={reduced ? undefined : { scaleY: [1, 1, 0.1, 1] }}
                            transition={{ duration: 4.5, times: [0, 0.94, 0.97, 1], repeat: Infinity }}
                        >
                            <circle cx="64" cy="41" r="7.5" fill={GOLD} opacity="0.22" />
                            <circle cx="82" cy="41" r="7.5" fill={GOLD} opacity="0.22" />
                            <circle cx="64" cy="41" r="4.2" fill={GOLD} />
                            <circle cx="82" cy="41" r="4.2" fill={GOLD} />
                        </motion.g>
                    </motion.g>

                    {/* shoulder joint */}
                    <circle cx={PIVOT.x} cy={PIVOT.y} r="9" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.55" />
                </svg>

                {/* ---------------- aiming arm + torch + beam ---------------- */}
                <div className="absolute" style={{ left: PIVOT.x, top: PIVOT.y }}>
                    {/* aims at the active card (spring) */}
                    <motion.div
                        className="absolute left-0 top-0"
                        style={{ transformOrigin: "0px 0px" }}
                        initial={false}
                        animate={{ rotate: aim.angle }}
                        transition={{ type: "spring", stiffness: 55, damping: 13 }}
                    >
                        {/* swing every time a new card takes the center */}
                        <motion.div
                            key={activeIndex}
                            className="absolute left-0 top-0"
                            style={{ transformOrigin: "0px 0px" }}
                            animate={reduced ? undefined : { rotate: [0, -7, 3, 0] }}
                            transition={{ duration: 1, ease: EASE }}
                        >
                            {/* ---- the beam: layered, feathered, blurred light (re-ignites on every change) ---- */}
                            <motion.div
                                key={`beam-${activeIndex}`}
                                className="absolute"
                                style={{ left: TIP_X, top: -aim.endH / 2, width: aim.beamLen, height: aim.endH }}
                                initial={reduced ? false : { opacity: 0.2 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8 }}
                            >

                                {/* wide ambient halo */}
                                <div className="absolute inset-0" style={{ filter: "blur(34px)" }}>
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(theta * 1.15, 0.32, "255,211,106"),
                                            WebkitMaskImage: distanceFade(aim.beamLen, 1.08),
                                            maskImage: distanceFade(aim.beamLen, 1.08),
                                        }}
                                    />
                                </div>

                                {/* main torch beam */}
                                <motion.div
                                    className="absolute inset-0"
                                    style={{ filter: "blur(16px)" }}
                                    animate={flicker}
                                    transition={flickerTransition}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(theta * 0.9, 0.48, "255,211,106"),
                                            WebkitMaskImage: distanceFade(aim.beamLen, 1),
                                            maskImage: distanceFade(aim.beamLen, 1),
                                        }}
                                    />
                                </motion.div>

                                {/* concentrated center light */}
                                <div className="absolute inset-0" style={{ filter: "blur(10px)" }}>
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(theta * 0.42, 0.68, "255,240,190"),
                                            WebkitMaskImage: distanceFade(aim.beamLen, 0.72),
                                            maskImage: distanceFade(aim.beamLen, 0.72),
                                        }}
                                    />
                                </div>

                                {/* main light body */}
                                <motion.div
                                    className="absolute inset-0"
                                    style={{ filter: "blur(14px)" }}
                                    animate={flicker}
                                    transition={flickerTransition}
                                >
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(theta * 0.68, 0.42, "255,211,106"),
                                            WebkitMaskImage: distanceFade(aim.beamLen, 0.95),
                                            maskImage: distanceFade(aim.beamLen, 0.95),
                                        }}
                                    />
                                </motion.div>

                                {/* hot core near the lens */}
                                <div className="absolute inset-0" style={{ filter: "blur(9px)" }}>
                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: cone(theta * 0.28, 0.6, "255,240,190"),
                                            WebkitMaskImage: distanceFade(aim.beamLen, 0.6),
                                            maskImage: distanceFade(aim.beamLen, 0.6),
                                        }}
                                    />
                                </div>

                                {/* dust motes drifting along the beam */}
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
                                                boxShadow: "0 0 6px 1px rgba(255,211,106,0.8)",
                                            }}
                                            animate={{
                                                x: [0, aim.beamLen],
                                                y: [0, m.yFrac * aim.endH * 0.7],
                                                opacity: [0, 0.9, 0.9, 0],
                                            }}
                                            transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "linear" }}
                                        />
                                    ))}
                            </motion.div>

                            {/* ---- arm + torch + gripping hand ---- */}
                            <svg width="1" height="1" className="absolute left-0 top-0 overflow-visible">
                                <defs>
                                    <radialGradient id="rb-glow">
                                        <stop offset="0" stopColor="#fff3c4" stopOpacity="0.95" />
                                        <stop offset="0.45" stopColor={GOLD} stopOpacity="0.55" />
                                        <stop offset="1" stopColor={GOLD} stopOpacity="0" />
                                    </radialGradient>
                                </defs>

                                {/* upper arm, elbow, forearm (forearm runs right into the hand) */}
                                <rect x="-4" y="-6" width="46" height="12" rx="6" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.55" />
                                <circle cx="42" cy="0" r="7" fill="#7d89a3" stroke="#5b6784" strokeOpacity="0.55" />
                                <rect x="40" y="-5" width="38" height="10" rx="5" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.55" />

                                {/* torch handle (inside the fist) + gold rings */}
                                <rect x="45" y="-6" width="40" height="12" rx="4" fill="#2a3350" stroke="#0b1020" strokeOpacity="0.7" />
                                <rect x="73" y="-6" width="3" height="12" fill={GOLD} opacity="0.85" />
                                <rect x="79" y="-6" width="3" height="12" fill={GOLD} opacity="0.55" />

                                {/* torch head (flared reflector) */}
                                <path
                                    d="M83 -7 L50 -15 L50 15 L83 7 Z"
                                    fill="#3b466b"
                                    stroke="#0b1020"
                                    strokeOpacity="0.7"
                                />

                                {/* hand: fist wrapped around the handle */}
                                <rect x="66" y="-11" width="28" height="22" rx="10" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.6" />
                                <path d="M75 -9 V9 M82 -9 V9 M89 -9 V9" stroke="#5b6784" strokeOpacity="0.5" strokeWidth="1.4" strokeLinecap="round" />
                                {/* thumb on top */}
                                <ellipse cx="80" cy="-11.5" rx="7" ry="3.4" fill="url(#rb-metal)" stroke="#5b6784" strokeOpacity="0.6" />
                                {/* wrist cuff */}
                                <rect x="62" y="-7" width="7" height="14" rx="3" fill="#7d89a3" stroke="#5b6784" strokeOpacity="0.55" />

                                {/* lens + glow */}
                                <motion.circle
                                    cx={TIP_X - 4}
                                    cy="0"
                                    r="22"
                                    fill="url(#rb-glow)"
                                    style={{ transformBox: "fill-box", transformOrigin: "center" }}
                                    animate={reduced ? undefined : { scale: [1, 1.25, 1], opacity: [0.75, 1, 0.75] }}
                                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                                />
                                <ellipse cx="126" cy="0" rx="3.4" ry="12" fill="#fff3c4" />

                                {/* flare when the torch re-aims */}
                                {!reduced && (
                                    <motion.circle
                                        key={`flare-${activeIndex}`}
                                        cx={TIP_X - 4}
                                        cy="0"
                                        r="26"
                                        fill="url(#rb-glow)"
                                        style={{ transformBox: "fill-box", transformOrigin: "center" }}
                                        initial={{ scale: 0.4, opacity: 1 }}
                                        animate={{ scale: 2.4, opacity: 0 }}
                                        transition={{ duration: 0.9, ease: EASE }}
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
   ANIMATED BACKGROUND  (calm, low-noise, edge-weighted)
============================================================ */

/** Soft aurora blob: drifts on its own + parallaxes with scroll. */
function Blob({
    scroll,
    range,
    position,
    color,
    path,
    duration,
    reduced,
}: {
    scroll: MotionValue<number>;
    range: [number, number];
    position: string;
    color: string;
    path: { x: number[]; y: number[]; scale: number[] };
    duration: number;
    reduced: boolean;
}) {
    const y = useTransform(scroll, [0, 1], range);

    return (
        <motion.div aria-hidden style={{ y }} className={`absolute ${position}`}>
            <motion.div
                style={{ background: color }}
                className="size-full rounded-full blur-[110px]"
                animate={reduced ? undefined : path}
                transition={{ duration, ease: "easeInOut", repeat: Infinity, repeatType: "mirror" }}
            />
        </motion.div>
    );
}

/**
 * Interactive constellation (canvas):
 *  - nodes drift through a slow flow field and link up when close
 *  - the cursor gently pushes nodes away and draws live links to them
 *  - pauses when off-screen / tab hidden, DPR-aware, auto-resizes
 */
function NetworkCanvas({
    pointerX,
    pointerY,
    glow,
    running,
}: {
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    glow: MotionValue<number>;
    running: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const runningRef = useRef(running);

    useEffect(() => {
        runningRef.current = running;
    }, [running]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        type Node = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            r: number;
            gold: boolean;
            phase: number;
        };

        const TAU = Math.PI * 2;
        const LINK = 140;
        const LINK2 = LINK * LINK;
        const MOUSE_R = 190;
        const MOUSE_R2 = MOUSE_R * MOUSE_R;

        let nodes: Node[] = [];
        let w = 0;
        let h = 0;
        let raf = 0;
        let last = performance.now();
        let tick = 0;
        let primary = "#6366f1";

        const readColor = () => {
            const c = getComputedStyle(canvas).color;
            if (c) primary = c;
        };

        const seed = () => {
            const count = clamp(Math.round((w * h) / 22000), 22, 58);
            nodes = Array.from({ length: count }, (_, i) => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: 1 + Math.random() * 1.6,
                gold: i % 6 === 0,
                phase: Math.random() * TAU,
            }));
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = canvas.clientWidth;
            h = canvas.clientHeight;
            if (!w || !h) return;
            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        };

        readColor();
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);
            if (!runningRef.current || !w || !h) {
                last = now;
                return;
            }

            const dt = Math.min(now - last, 50) / 16.67;
            last = now;
            const t = now / 1000;
            if (tick++ % 120 === 0) readColor(); // follows light / dark theme changes

            const mx = pointerX.get();
            const my = pointerY.get();
            const mouseOn = glow.get() > 0.05;
            const damp = Math.pow(0.992, dt);

            ctx.clearRect(0, 0, w, h);

            /* ---------- update ---------- */
            for (const n of nodes) {
                if (mouseOn) {
                    const dx = n.x - mx;
                    const dy = n.y - my;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < MOUSE_R2) {
                        const d = Math.sqrt(d2) || 1;
                        const f = (1 - d / MOUSE_R) * 0.06 * dt;
                        n.vx += (dx / d) * f;
                        n.vy += (dy / d) * f;
                    }
                }

                // slow flow field keeps everything gently swirling
                n.vx += Math.cos(n.y * 0.004 + t * 0.3) * 0.0028 * dt;
                n.vy += Math.sin(n.x * 0.004 + t * 0.3) * 0.0028 * dt;

                n.vx *= damp;
                n.vy *= damp;

                const sp = Math.hypot(n.vx, n.vy);
                if (sp > 1.2) {
                    n.vx = (n.vx / sp) * 1.2;
                    n.vy = (n.vy / sp) * 1.2;
                }

                n.x += n.vx * dt;
                n.y += n.vy * dt;

                if (n.x < -20) n.x = w + 20;
                else if (n.x > w + 20) n.x = -20;
                if (n.y < -20) n.y = h + 20;
                else if (n.y > h + 20) n.y = -20;
            }

            /* ---------- links ---------- */
            ctx.lineWidth = 1;
            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];
                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;
                    if (d2 > LINK2) continue;

                    const k = 1 - Math.sqrt(d2) / LINK;
                    ctx.globalAlpha = k * 0.3;
                    ctx.strokeStyle = a.gold && b.gold ? GOLD : primary;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            /* ---------- cursor links ---------- */
            if (mouseOn) {
                ctx.strokeStyle = primary;
                for (const n of nodes) {
                    const dx = n.x - mx;
                    const dy = n.y - my;
                    const d2 = dx * dx + dy * dy;
                    if (d2 > MOUSE_R2) continue;
                    ctx.globalAlpha = (1 - Math.sqrt(d2) / MOUSE_R) * 0.45;
                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(n.x, n.y);
                    ctx.stroke();
                }
            }

            /* ---------- nodes ---------- */
            for (const n of nodes) {
                const pulse = 1 + 0.3 * Math.sin(t * 2 + n.phase);
                ctx.fillStyle = n.gold ? GOLD : primary;
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r * pulse, 0, TAU);
                ctx.fill();
                if (n.gold) {
                    ctx.globalAlpha = 0.1;
                    ctx.beginPath();
                    ctx.arc(n.x, n.y, n.r * pulse * 4, 0, TAU);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
        };

        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [pointerX, pointerY, glow]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 size-full text-primary opacity-60"
        />
    );
}

function AnimatedBackground({
    reduced,
    running,
    targetRef,
    pointerX,
    pointerY,
    glow,
}: {
    reduced: boolean;
    running: boolean;
    targetRef: RefObject<HTMLElement | null>;
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    glow: MotionValue<number>;
}) {
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    });

    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {/* ---- very soft rotating halo ---- */}
            <div className="absolute left-1/2 top-[58%] size-[900px] -translate-x-1/2 -translate-y-1/2">
                <motion.div
                    className="size-full rounded-full opacity-[0.10] blur-3xl"
                    style={{
                        background: `conic-gradient(from 0deg, transparent, color-mix(in srgb, var(--primary) 70%, transparent), transparent 40%, color-mix(in srgb, ${GOLD} 55%, transparent) 62%, transparent 80%)`,
                    }}
                    animate={reduced ? undefined : { rotate: 360 }}
                    transition={{ duration: 70, ease: "linear", repeat: Infinity }}
                />
            </div>

            {/* ---- aurora blobs (drift + scroll parallax) ---- */}
            <Blob
                scroll={scrollYProgress}
                range={[-70, 70]}
                position="-left-[8%] top-[6%] size-[460px]"
                color="color-mix(in srgb, var(--primary) 12%, transparent)"
                path={{ x: [0, 90, -30, 0], y: [0, 60, 110, 0], scale: [1, 1.2, 0.95, 1] }}
                duration={24}
                reduced={reduced}
            />
            <Blob
                scroll={scrollYProgress}
                range={[60, -60]}
                position="-right-[6%] top-[34%] size-[380px]"
                color="rgba(255, 211, 106, 0.07)"
                path={{ x: [0, -80, 20, 0], y: [0, -50, 40, 0], scale: [1, 0.9, 1.15, 1] }}
                duration={28}
                reduced={reduced}
            />
            <Blob
                scroll={scrollYProgress}
                range={[-40, 90]}
                position="left-[32%] -bottom-[12%] size-[520px]"
                color="rgba(124, 92, 255, 0.08)"
                path={{ x: [0, 70, -60, 0], y: [0, -40, 30, 0], scale: [1, 1.1, 0.92, 1] }}
                duration={32}
                reduced={reduced}
            />

            {/* ---- faint moving grid, faded toward the edges ---- */}
            <div
                className="absolute inset-0"
                style={{
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                    maskImage: "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                }}
            >
                <motion.div
                    className="absolute -inset-16 opacity-[0.035]"
                    style={{ backgroundImage: GRID_LINES, backgroundSize: "64px 64px" }}
                    animate={reduced ? undefined : { x: [0, 64], y: [0, 64] }}
                    transition={{ duration: 18, ease: "linear", repeat: Infinity }}
                />
            </div>

            {!reduced && (
                <>
                    {/* ---- constellation: only visible at the edges, never behind the cards ---- */}
                    <div
                        className="absolute inset-0"
                        style={{ WebkitMaskImage: EDGE_ONLY_MASK, maskImage: EDGE_ONLY_MASK }}
                    >
                        <NetworkCanvas
                            pointerX={pointerX}
                            pointerY={pointerY}
                            glow={glow}
                            running={running}
                        />
                    </div>

                    {/* ---- cursor-follow glow ---- */}
                    <motion.div
                        className="absolute left-0 top-0 -ml-[260px] -mt-[260px] size-[520px] rounded-full"
                        style={{
                            x: pointerX,
                            y: pointerY,
                            opacity: glow,
                            background:
                                "radial-gradient(circle, color-mix(in srgb, var(--primary) 12%, transparent), transparent 65%)",
                        }}
                    />
                </>
            )}
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

/** Rolling number – the old digit slides out, the new one slides in. */
function RollingNumber({ value }: { value: number }) {
    return (
        <span className="relative inline-flex h-[1em] w-[1.3em] overflow-hidden leading-none tabular-nums">
            <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                    key={value}
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-110%", opacity: 0 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="inline-block"
                >
                    {pad2(value)}
                </motion.span>
            </AnimatePresence>
        </span>
    );
}

/**
 * One pagination segment.
 * The current segment fills with the auto-play timer and shows a
 * glowing head that travels along the bar.
 */
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
                className={`relative block h-[4px] w-full rounded-full transition-[height,background-color] duration-500 group-hover/seg:h-[6px] group-focus-visible/seg:h-[6px] ${inWindow ? "bg-primary/25" : "bg-border"
                    }`}
            >
                <span className="absolute inset-0 overflow-hidden rounded-full">
                    {/* completed / static fill */}
                    <motion.span
                        initial={false}
                        animate={{ scaleX: done || (isCurrent && !showTimer) ? 1 : 0 }}
                        transition={{ duration: 0.55, ease: EASE }}
                        style={{ transformOrigin: "left" }}
                        className="absolute inset-0 rounded-full bg-primary"
                    />
                    {/* live timer fill */}
                    {isCurrent && showTimer && (
                        <motion.span
                            style={{ scaleX: timer, transformOrigin: "left" }}
                            className="absolute inset-0 overflow-hidden rounded-full bg-primary"
                        >
                            <motion.span
                                aria-hidden
                                animate={{ x: ["-100%", "100%"] }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                        </motion.span>
                    )}
                </span>

                {/* glowing head */}
                {isCurrent && showTimer && (
                    <motion.span
                        aria-hidden
                        style={{ left: headLeft }}
                        className="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_3px_color-mix(in_srgb,var(--primary)_70%,transparent)]"
                    />
                )}
            </span>
        </button>
    );
}

/* ============================================================
   CENTER STAGE
   Floor glow + ripple under the center slot. The column also acts as the
   measuring target for the robot's torch (same width as one slide).
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
            <div ref={columnRef} className="relative h-full w-full md:w-1/2 lg:w-1/3">
                {/* warm floor glow */}
                <div
                    className="absolute inset-x-[8%] bottom-0 h-14 rounded-[50%] blur-2xl"
                    style={{ background: "rgba(255, 211, 106, 0.26)" }}
                />

                {/* ripple every time a new card takes the center */}
                {!reduced && (
                    <motion.span
                        key={activeIndex}
                        initial={{ scale: 0.55, opacity: 0.7 }}
                        animate={{ scale: 1.55, opacity: 0 }}
                        transition={{ duration: 1.2, ease: EASE }}
                        className="absolute inset-x-[8%] bottom-1 h-10 rounded-[50%] border"
                        style={{ borderColor: "rgba(255, 211, 106, 0.6)" }}
                    />
                )}
            </div>
        </div>
    );
}

/* ============================================================
   PROJECT CARD
   - the `data-depth` wrapper is what the carousel scales / fades / tilts / blurs;
     it receives the `--active` CSS variable (0 → 1) while the slide travels to the center
   - `isActive` (the card nearest the center) switches on the discrete effects
   - (the rotating gradient border ring has been removed)
============================================================ */

function ProjectCard({
    project,
    index,
    isActive,
    reduced,
    revealed,
    timer,
    showTimer,
}: {
    project: Project;
    index: number;
    isActive: boolean;
    reduced: boolean;
    revealed: boolean;
    timer: MotionValue<number>;
    showTimer: boolean;
}) {
    const accent = index % 2 === 1 ? GOLD : "var(--primary)";

    // With reduced motion the scroll-driven depth effect is off,
    // so the active state is applied statically instead.
    const staticDepth = reduced
        ? ({ "--active": isActive ? 1 : 0, opacity: isActive ? 1 : 0.55 } as CSSProperties)
        : undefined;

    /* ---------- 3D mouse tilt (active card only) ---------- */
    const rx = useMotionValue(0);
    const ry = useMotionValue(0);
    const tiltX = useSpring(rx, { stiffness: 180, damping: 18 });
    const tiltY = useSpring(ry, { stiffness: 180, damping: 18 });

    useEffect(() => {
        if (!isActive) {
            rx.set(0);
            ry.set(0);
        }
    }, [isActive, rx, ry]);

    const onTilt = (e: ReactPointerEvent<HTMLDivElement>) => {
        if (!isActive || reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        if (!r.width || !r.height) return;
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 8);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
    };
    const onTiltEnd = () => {
        rx.set(0);
        ry.set(0);
    };

    return (
        <motion.div
            initial={false}
            animate={reduced || revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
            transition={{ duration: 0.9, ease: EASE, delay: reduced ? 0 : 0.1 + (index % 3) * 0.12 }}
            className="h-full"
        >
            <div data-depth style={staticDepth} className="h-full will-change-transform">
                <motion.div
                    onPointerMove={onTilt}
                    onPointerLeave={onTiltEnd}
                    style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 1100 }}
                    className="relative h-full"
                >
                    {/* ---------- Active glow ---------- */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[1.75rem]"
                        style={{
                            boxShadow:
                                "0 24px 60px -20px color-mix(in srgb, var(--primary) calc(var(--active, 0) * 65%), transparent)",
                        }}
                    />

                    <SpotlightCard className="group relative h-full overflow-hidden rounded-[1.75rem] border-border/70 bg-card/95 backdrop-blur-xl transition-colors duration-500 hover:border-primary/30">
                        {/* ---------- Active timer line (top edge) ---------- */}
                        {isActive && showTimer && (
                            <span
                                aria-hidden
                                className="absolute inset-x-0 top-0 z-20 h-[3px] bg-border/30"
                            >
                                <motion.span
                                    style={{ scaleX: timer, transformOrigin: "left" }}
                                    className="block h-full bg-gradient-to-r from-primary to-[#ffd36a]"
                                />
                            </span>
                        )}

                        {/* ---------- Torch light landing on the card (top-left, where the beam comes from) ---------- */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 z-[15]"
                            style={{ opacity: "var(--active, 0)" }}
                        >
                            <motion.div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "radial-gradient(ellipse 85% 60% at 0% 0%, rgba(255,211,106,0.34), rgba(255,211,106,0.10) 45%, transparent 72%)",
                                }}
                                animate={reduced ? undefined : { opacity: [0.8, 1, 0.72, 1, 0.88] }}
                                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                            />
                        </div>

                        {/* flare burst when the beam lands on this card */}
                        {isActive && !reduced && (
                            <motion.div
                                aria-hidden
                                initial={{ opacity: 0.95, scale: 0.4 }}
                                animate={{ opacity: 0, scale: 1.7 }}
                                transition={{ duration: 1.1, ease: EASE }}
                                className="pointer-events-none absolute -left-16 -top-16 z-[16] size-72 rounded-full"
                                style={{
                                    background:
                                        "radial-gradient(circle, rgba(255,243,196,0.9), rgba(255,211,106,0.35) 40%, transparent 70%)",
                                }}
                            />
                        )}

                        {/* ---------- Project Image ---------- */}
                        <div className="relative h-[245px] overflow-hidden sm:h-[275px]">
                            <div className="absolute inset-0 bg-secondary" />

                            {/* hover zoom (CSS) wraps the active Ken-Burns zoom (motion) */}
                            <div
                                className="absolute inset-0 transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                                style={{ filter: "saturate(calc(0.6 + var(--active, 0) * 0.4))" }}
                            >
                                <motion.img
                                    src={project?.image}
                                    alt={`${project.title} project preview`}
                                    loading="lazy"
                                    decoding="async"
                                    animate={{ scale: isActive && !reduced ? 1.1 : 1 }}
                                    transition={
                                        isActive
                                            ? { duration: AUTOPLAY_MS / 1000 + 1.5, ease: "linear" }
                                            : { duration: 0.9, ease: EASE }
                                    }
                                    className="size-full object-cover"
                                />
                            </div>

                            <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"
                            />

                            {/* shine sweep when the card reaches the center */}
                            {isActive && !reduced && (
                                <motion.span
                                    aria-hidden
                                    initial={{ x: "-150%" }}
                                    animate={{ x: "450%" }}
                                    transition={{ duration: 1.2, ease: EASE, delay: 0.15 }}
                                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                />
                            )}

                            <div
                                className={`absolute left-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border text-[11px] font-medium backdrop-blur-md transition-colors duration-500 ${isActive
                                    ? "border-primary bg-primary text-primary-foreground shadow-[0_0_18px_color-mix(in_srgb,var(--primary)_60%,transparent)]"
                                    : "border-white/15 bg-black/25 text-white/90"
                                    }`}
                            >
                                {pad2(index + 1)}
                            </div>

                            <div className="absolute right-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/90 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
                                <ArrowUpRight className="size-4" aria-hidden />
                            </div>
                        </div>

                        {/* ---------- Content ---------- */}
                        <div className="relative flex min-h-[255px] flex-col p-6 sm:p-7">
                            <div className="mb-3 flex items-center gap-2">
                                <span className="relative flex size-1.5">
                                    {isActive && !reduced && (
                                        <motion.span
                                            aria-hidden
                                            animate={{ scale: [1, 3], opacity: [0.6, 0] }}
                                            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                                            className="absolute inset-0 rounded-full"
                                            style={{ background: accent }}
                                        />
                                    )}
                                    <span className="relative size-1.5 rounded-full" style={{ background: accent }} />
                                </span>

                                <AnimatePresence mode="wait" initial={false}>
                                    <motion.span
                                        key={isActive ? "live" : "idle"}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.25, ease: EASE }}
                                        className={`text-[11px] font-medium uppercase tracking-[0.16em] ${isActive ? "text-primary" : "text-muted-foreground"
                                            }`}
                                    >
                                        {isActive ? "Now Viewing" : "Selected Project"}
                                    </motion.span>
                                </AnimatePresence>
                            </div>

                            <h3
                                className={`relative w-fit text-2xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary sm:text-[1.65rem] ${isActive ? "text-primary" : ""
                                    }`}
                            >
                                {project.title}
                                {/* underline draws in when the card becomes active */}
                                <motion.span
                                    aria-hidden
                                    initial={false}
                                    animate={{ scaleX: isActive ? 1 : 0 }}
                                    transition={{ duration: 0.6, ease: EASE, delay: isActive ? 0.15 : 0 }}
                                    style={{ transformOrigin: "left" }}
                                    className="absolute -bottom-1.5 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-primary to-[#ffd36a]"
                                />
                            </h3>

                            <p
                                className={`mt-3 line-clamp-3 text-sm leading-6 transition-colors duration-500 ${isActive ? "text-foreground/80" : "text-muted-foreground"
                                    }`}
                            >
                                {project.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-1.5">
                                {project.tags.slice(0, 5).map((tag: string, t: number) => (
                                    <motion.span
                                        key={tag}
                                        className="inline-flex"
                                        animate={
                                            isActive && !reduced
                                                ? { y: [8, 0], opacity: [0, 1] }
                                                : { y: 0, opacity: 1 }
                                        }
                                        transition={{ duration: 0.5, ease: EASE, delay: isActive ? 0.2 + t * 0.06 : 0 }}
                                    >
                                        <Badge
                                            className={`text-[10px] font-medium transition-colors duration-300 group-hover:border-primary/20 group-hover:text-foreground ${isActive
                                                ? "border-primary/30 bg-primary/10 text-foreground"
                                                : "border-border/70 bg-secondary/70 text-muted-foreground"
                                                }`}
                                        >
                                            {tag}
                                        </Badge>
                                    </motion.span>
                                ))}
                            </div>

                            <div className="mt-auto flex items-center gap-5 pt-7">
                                <a
                                    href={project.live}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-300 hover:text-primary/75 focus-visible:outline-none focus-visible:underline"
                                >
                                    Live demo
                                    <ExternalLink
                                        className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        aria-hidden
                                    />
                                </a>

                                <a
                                    href={project.repo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors duration-300 hover:text-foreground focus-visible:outline-none focus-visible:underline"
                                >
                                    <GithubIcon className="size-4" aria-hidden />
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

/* ============================================================
   SHOWCASE
============================================================ */

function ProjectsShowcase() {
    const reduced = !!useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);
    const robotRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0); // selected snap (segment bar, screen reader)
    const [centered, setCentered] = useState(0); // card nearest the center (active card)
    const [snapCount, setSnapCount] = useState(projects.length);
    const [inViewSlides, setInViewSlides] = useState<number[]>([]);
    const [aim, setAim] = useState<Aim>(DEFAULT_AIM);

    const [playing, setPlaying] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [docHidden, setDocHidden] = useState(false);

    const timer = useMotionValue(0); // 0 → 1 auto-play countdown
    const elapsed = useRef(0);
    const lastCentered = useRef(0);

    const inView = useInView(sectionRef, { amount: 0.3 });
    const revealed = useInView(sectionRef, { once: true, amount: 0.2 });

    // With reduced motion there is no scroll-driven tracking, so follow the selected snap.
    const activeIndex = reduced ? current : centered;

    /* ---------- cursor-follow glow (springs for a floaty feel) ---------- */
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);
    const pointerX = useSpring(rawX, { stiffness: 90, damping: 20, mass: 0.6 });
    const pointerY = useSpring(rawY, { stiffness: 90, damping: 20, mass: 0.6 });
    const glow = useSpring(0, { stiffness: 60, damping: 20 });

    const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
        if (reduced || e.pointerType !== "mouse") return;
        const rect = sectionRef.current?.getBoundingClientRect();
        if (!rect) return;
        rawX.set(e.clientX - rect.left);
        rawY.set(e.clientY - rect.top);
        glow.set(1);
    };
    const onPointerLeave = () => glow.set(0);

    /* ---------- aim the robot's torch at the active (center) card ----------
       Scale-aware: the robot is CSS-scaled per breakpoint, so all distances are
       converted back into the robot's own (unscaled) units for the beam. */
    const measureAim = useCallback(() => {
        const robot = robotRef.current;
        const stage = stageRef.current;
        if (!robot || !stage) return;

        const r = robot.getBoundingClientRect();
        const s = stage.getBoundingClientRect();
        if (!r.width || !s.width) return; // robot hidden on small screens

        const scale = r.width / ROBOT_W || 1;

        const sx = r.left + PIVOT.x * scale;
        const sy = r.top + PIVOT.y * scale;
        const tx = s.left + s.width * 0.32; // upper-left part of the active card
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
            Math.abs(p.angle - angle) < 0.2 && Math.abs(p.beamLen - beamLen) < 2 && Math.abs(p.endH - endH) < 2
                ? p
                : { angle, beamLen, endH }
        );
    }, []);

    useEffect(() => {
        measureAim();

        const ro = new ResizeObserver(measureAim);
        if (sectionRef.current) ro.observe(sectionRef.current);
        window.addEventListener("resize", measureAim);

        // the section reveals with a slide-up, so re-measure once it has settled
        const timers = [400, 1200, 2400].map((ms) => window.setTimeout(measureAim, ms));

        return () => {
            ro.disconnect();
            window.removeEventListener("resize", measureAim);
            timers.forEach(window.clearTimeout);
        };
    }, [measureAim, revealed]);

    /* ---------- Embla options ---------- */
    const opts = useMemo(
        () => ({
            align: "center" as const, // the selected slide always sits in the middle
            loop: true,
            slidesToScroll: 1,
            watchDrag: false, // no mouse / touch drag
            duration: reduced ? 6 : 32, // higher = slower, smoother slide
            inViewThreshold: 0.5,
        }),
        [reduced]
    );

    /**
     * Depth effect, driven by scroll position and measured from the viewport CENTER.
     * d = 0 → the slide is dead center. `--active` goes 0 → 1 as a slide approaches the
     * center, so scale / fade / blur / glow interpolate smoothly while the carousel moves.
     * The slide nearest the center becomes the active card.
     */
    const applyDepth = useCallback(
        (embla: NonNullable<CarouselApi>) => {
            if (reduced) return;
            const root = embla.rootNode().getBoundingClientRect();
            if (!root.width) return;
            const cx = root.left + root.width / 2;

            let best = 0;
            let bestAbs = Infinity;

            embla.slideNodes().forEach((node, idx) => {
                const el = node.querySelector<HTMLElement>("[data-depth]");
                if (!el) return;
                const r = node.getBoundingClientRect();
                if (!r.width) return;

                const d = clamp((r.left + r.width / 2 - cx) / r.width, -2, 2);
                const abs = Math.abs(d);
                if (abs < bestAbs) {
                    bestAbs = abs;
                    best = idx;
                }

                const w = clamp(1 - abs, 0, 1); // 1 = centered
                const side = clamp(d, -1, 1);

                el.style.setProperty("--active", w.toFixed(3));
                el.style.transform = `perspective(1400px) translateY(${(1 - w) * 16}px) rotateY(${side * -8}deg) scale(${0.88 + w * 0.12})`;
                el.style.opacity = String(0.38 + w * 0.62);
                el.style.filter = w > 0.995 ? "none" : `blur(${((1 - w) * 1.4).toFixed(2)}px)`;
            });

            if (best !== lastCentered.current) {
                lastCentered.current = best;
                setCentered(best);
            }
        },
        [reduced]
    );

    /* ---------- sync with Embla ---------- */
    useEffect(() => {
        if (!api) return;

        const syncSelected = () => {
            setCurrent(api.selectedScrollSnap());
            elapsed.current = 0; // restart countdown on every slide change
            timer.set(0);
        };
        const syncInView = () => setInViewSlides(api.slidesInView());
        const onScroll = () => applyDepth(api);
        const onReInit = () => {
            setSnapCount(api.scrollSnapList().length);
            syncSelected();
            syncInView();
            applyDepth(api);
        };

        onReInit();

        api.on("select", syncSelected);
        api.on("slidesInView", syncInView);
        api.on("scroll", onScroll);
        api.on("resize", onScroll);
        api.on("reInit", onReInit);

        return () => {
            api.off("select", syncSelected);
            api.off("slidesInView", syncInView);
            api.off("scroll", onScroll);
            api.off("resize", onScroll);
            api.off("reInit", onReInit);
        };
    }, [api, applyDepth, timer]);

    useEffect(() => {
        const onVis = () => setDocHidden(document.hidden);
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    /* ---------- navigation ---------- */
    const next = useCallback(() => {
        if (!api) return;
        if (api.canScrollNext()) api.scrollNext();
        else api.scrollTo(0);
    }, [api]);

    const prev = useCallback(() => {
        if (!api) return;
        if (api.canScrollPrev()) api.scrollPrev();
        else api.scrollTo(api.scrollSnapList().length - 1);
    }, [api]);

    const goTo = useCallback((i: number) => api?.scrollTo(i), [api]);

    /* ---------- auto-play ---------- */
    const interactive = snapCount > 1;
    const canPlay = !!api && playing && !reduced && interactive && !hovered && !focused && inView && !docHidden;
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

    /* ---------- keyboard + focus (arrow keys are handled by shadcn Carousel) ---------- */
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Home") { e.preventDefault(); goTo(0); }
        else if (e.key === "End") { e.preventDefault(); goTo(snapCount - 1); }
    };
    const onFocus = (e: FocusEvent<HTMLDivElement>) => {
        if (e.target.matches(":focus-visible")) setFocused(true);
    };
    const onBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
    };

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
                        setApi={setApi}
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
                        {/* ---------- Center stage (floor glow + measuring target) ---------- */}
                        <CenterStage activeIndex={activeIndex} reduced={reduced} columnRef={stageRef} />

                        {/* ---------- Slides: 1 mobile · 2 tablet · 3 desktop — centered ---------- */}
                        <CarouselContent className="ml-0 py-8">
                            {projects.map((project, i) => (
                                <CarouselItem
                                    key={`${project.title}-${i}`}
                                    className="basis-full px-3 md:basis-1/2 lg:basis-1/3"
                                >
                                    <ProjectCard
                                        project={project}
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

                        {/* ---------- Control dock: counter · progress · handlers ---------- */}
                        <div className="relative ">

                            <div className="flex flex-col items-center gap-4">
                                {/* Segmented progress — full width */}
                                <div className="flex w-full items-center gap-1.5">
                                    {Array.from({ length: snapCount }, (_, i) => (
                                        <Segment
                                            key={i}
                                            index={i}
                                            current={current}
                                            inWindow={inViewSlides.includes(i)}
                                            timer={timer}
                                            showTimer={showTimer}
                                            onSelect={goTo}
                                            total={snapCount}
                                        />
                                    ))}
                                </div>

                                {/* Handlers — centered on second row */}
                                <div className="flex items-center justify-center gap-2">
                                    <ControlButton label="Previous project" onClick={prev}>
                                        <ArrowLeft
                                            className="size-4 transition-transform duration-300 group-hover/btn:-translate-x-0.5"
                                            aria-hidden
                                        />
                                    </ControlButton>

                                    <motion.button
                                        type="button"
                                        aria-label={playing ? "Pause auto-play" : "Start auto-play"}
                                        aria-pressed={!playing}
                                        onClick={() => setPlaying((p) => !p)}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.88 }}
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
                                                    style={{ pathLength: timer }}
                                                />
                                            )}
                                        </svg>

                                        <AnimatePresence mode="wait" initial={false}>
                                            <motion.span
                                                key={playing ? "pause" : "play"}
                                                initial={{ scale: 0.4, opacity: 0, rotate: -40 }}
                                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                                exit={{ scale: 0.4, opacity: 0, rotate: 40 }}
                                                transition={{ duration: 0.22, ease: EASE }}
                                                className="flex"
                                            >
                                                {playing ? (
                                                    <Pause className="size-4" aria-hidden />
                                                ) : (
                                                    <Play
                                                        className="size-4 translate-x-px"
                                                        aria-hidden
                                                    />
                                                )}
                                            </motion.span>
                                        </AnimatePresence>
                                    </motion.button>

                                    <ControlButton label="Next project" onClick={next}>
                                        <ArrowRight
                                            className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                                            aria-hidden
                                        />
                                    </ControlButton>
                                </div>
                            </div>
                        </div>
                        {/* Screen-reader announcement */}
                        <p className="sr-only" aria-live={playing ? "off" : "polite"}>
                            Showing project {current + 1} of {snapCount}: {projects[current]?.title}
                        </p>
                    </Carousel>
                </Reveal>

                {/* ---------- CTA ---------- */}
                <Reveal delay={0.12} className="mt-14 flex  sm:mt-16">
                    <Link href="/projects" className="custom-btn group inline-flex items-center gap-2">
                        See all projects
                        <ArrowUpRight
                            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden
                        />
                    </Link>
                </Reveal>

                {/* ---------- Robot: top-left corner of the centered container, torch aimed at the active card ---------- */}
                <RobotTorch aim={aim} activeIndex={activeIndex} reduced={reduced} robotRef={robotRef} />
            </Container>
        </section>
    );
}

export default function Projects() {
    if (!projects.length) return null;
    return <ProjectsShowcase />;
}