"use client";

import {
    AnimatePresence,
    animate,
    motion,
    useAnimationFrame,
    useInView,
    useMotionValue,
    useMotionValueEvent,
    useReducedMotion,
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
    useRef,
    useState,
    type FocusEvent,
    type KeyboardEvent,
} from "react";

import { projects } from "@/lib/data";

import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import { Reveal, SpotlightCard } from "../animations/animations";
import { Badge } from "../ui/badge";
import { GithubIcon } from "../icons";

/* ============================================================
   CONSTANTS
============================================================ */

/** Time each slide stays before auto-advancing (ms). */
const AUTOPLAY_MS = 5200;
/** Space between cards (px). */
const GAP = 24;
/** Inner padding of the track (px) – keeps the first card off the fade mask. */
const PAD = 28;

const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 140, damping: 24, mass: 0.95 } as const;

type Project = (typeof projects)[number];

const pad2 = (n: number) => String(n).padStart(2, "0");

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
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="
                group/btn relative flex size-11 items-center justify-center rounded-full
                border border-border/80 bg-background/70 text-muted-foreground
                transition-all duration-300
                hover:border-primary/40 hover:bg-primary/10 hover:text-foreground
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                active:scale-90
            "
        >
            {children}
        </button>
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
 * The current segment grows wider, fills with the auto-play timer
 * and shows a glowing head that travels along the bar.
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
        <motion.button
            type="button"
            onClick={() => onSelect(index)}
            aria-label={`Go to project ${index + 1} of ${total}`}
            aria-current={isCurrent}
            initial={false}
            // animate={{ flexGrow: isCurrent ? 3.4 : 1 }}
            animate={{ flexGrow: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="group/seg relative flex h-7 min-w-0 basis-0 items-center focus-visible:outline-none"
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
        </motion.button>
    );
}

/* ============================================================
   SLIDE (card + depth/parallax tied to carousel position)
============================================================ */

function Slide({
    project,
    index,
    total,
    x,
    step,
    view,
    cardW,
    reduced,
}: {
    project: Project;
    index: number;
    total: number;
    x: MotionValue<number>;
    step: MotionValue<number>;
    view: MotionValue<number>;
    cardW: MotionValue<number>;
    reduced: boolean;
}) {
    /** -1 (far left) … 0 (centered) … 1 (far right) */
    const dist = useTransform([x, step, view, cardW], (v: number[]) => {
        const [xv, s, vw, cw] = v;

        if (!vw) return 0;

        const center = PAD + index * s + xv + cw / 2;

        return Math.max(
            -1.4,
            Math.min(1.4, (center - vw / 2) / (vw / 2)),
        );
    });

    const scale = useTransform(
        dist,
        (d) => 1 - Math.min(Math.abs(d), 1) * 0.05,
    );

    const opacity = useTransform(
        dist,
        (d) => 1 - Math.min(Math.abs(d), 1.2) * 0.42,
    );

    const rotateY = useTransform(dist, (d) => d * -5);

    const gold = index % 2 === 1;
    const accent = gold ? "#ffd36a" : "var(--primary)";

    return (
        <motion.div
            data-slide
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${total}`}
            style={
                reduced
                    ? undefined
                    : {
                        scale,
                        opacity,
                        rotateY,
                        transformPerspective: 1400,
                    }
            }
            className="
    w-[calc(100vw-56px)]
    shrink-0
    will-change-transform
    sm:w-[calc((100vw-56px)/2-12px)]
    lg:w-[calc((100vw-56px)/3-16px)]
"
        >
            <SpotlightCard className="group h-full overflow-hidden rounded-[1.75rem] border-border/70 bg-card/80 backdrop-blur-xl transition-colors duration-500 hover:border-primary/30">
                {/* ---------- Project Image ---------- */}
                <div className="relative h-[245px] overflow-hidden sm:h-[275px]">
                    {/* Image background */}
                    <div className="absolute inset-0 bg-secondary" />

                    {/* Project image */}
                    <img
                        src={project?.image}
                        alt={`${project.title} project preview`}
                        className="absolute inset-0 size-full object-cover"
                    />

                    {/* Subtle overlay for readability */}
                    <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"
                    />

                    {/* Project number */}
                    <div className="absolute left-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[11px] font-medium text-white/90 backdrop-blur-md">
                        {pad2(index + 1)}
                    </div>

                    {/* External-link indicator */}
                    <div className="absolute right-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/90 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
                        <ArrowUpRight
                            className="size-4"
                            aria-hidden
                        />
                    </div>
                </div>

                {/* ---------- Content ---------- */}
                <div className="relative flex min-h-[255px] flex-col p-6 sm:p-7">
                    <div className="mb-3 flex items-center gap-2">
                        <span
                            className="size-1.5 rounded-full"
                            style={{ background: accent }}
                        />

                        <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                            Selected Project
                        </span>
                    </div>

                    <h3 className="text-2xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-primary sm:text-[1.65rem]">
                        {project.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {project.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 5).map((tag: string) => (
                            <Badge
                                key={tag}
                                className="border-border/70 bg-secondary/70 text-[10px] font-medium text-muted-foreground transition-colors duration-300 group-hover:border-primary/20 group-hover:text-foreground"
                            >
                                {tag}
                            </Badge>
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
    );
}

/* ============================================================
   CAROUSEL
============================================================ */

function ProjectsShowcase() {
    const reduced = !!useReducedMotion();
    const count = projects.length;

    const sectionRef = useRef<HTMLElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    /* ---------- motion values (shared with every slide) ---------- */
    const x = useMotionValue(0);
    const stepMV = useMotionValue(GAP + 440);
    const viewMV = useMotionValue(0);
    const cardMV = useMotionValue(440);
    const timer = useMotionValue(0); // 0 → 1 auto-play countdown

    /* ---------- state ---------- */
    const [maxScroll, setMaxScroll] = useState(0);
    const [visible, setVisible] = useState(1);
    const [lead, setLead] = useState(0);
    const [atEnd, setAtEnd] = useState(false);
    const [playing, setPlaying] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [docHidden, setDocHidden] = useState(false);

    /* ---------- refs for callbacks ---------- */
    const stepRef = useRef(GAP + 440);
    const maxRef = useRef(0);
    const elapsed = useRef(0);
    const controls = useRef<ReturnType<typeof animate> | null>(null);

    const inView = useInView(sectionRef, { amount: 0.3 });

    /* ---------- measuring ---------- */
    const measure = useCallback(() => {
        const stage = stageRef.current;
        const track = trackRef.current;
        if (!stage || !track) return;

        const card = track.querySelector<HTMLElement>("[data-slide]");
        const cw = card?.offsetWidth ?? 440;
        const s = cw + GAP;
        const vw = stage.clientWidth;
        const max = Math.max(0, track.scrollWidth - vw);

        stepRef.current = s;
        maxRef.current = max;
        stepMV.set(s);
        cardMV.set(cw);
        viewMV.set(vw);
        setMaxScroll(max);
        setVisible(Math.max(1, Math.floor((vw + GAP) / s)));

        // keep the current position valid after a resize
        const clamped = Math.max(-max, Math.min(0, x.get()));
        if (clamped !== x.get()) x.set(clamped);
    }, [cardMV, stepMV, viewMV, x]);

    useEffect(() => {
        measure();
        const stage = stageRef.current;
        const track = trackRef.current;
        if (!stage || !track) return;
        const ro = new ResizeObserver(measure);
        ro.observe(stage);
        ro.observe(track);
        return () => ro.disconnect();
    }, [measure]);

    useEffect(() => {
        const onVis = () => setDocHidden(document.hidden);
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);

    /* ---------- derived index (counter, segments) ---------- */
    useMotionValueEvent(x, "change", (v) => {
        const max = maxRef.current;
        setAtEnd(max > 0 && v <= -max + 2);
        setLead(Math.max(0, Math.min(count - 1, Math.round(-v / stepRef.current))));
    });

    /* ---------- navigation ---------- */
    const goTo = useCallback(
        (i: number) => {
            const idx = Math.max(0, Math.min(count - 1, i));
            const target = -Math.min(idx * stepRef.current, maxRef.current);
            controls.current?.stop();
            elapsed.current = 0;
            timer.set(0);
            controls.current = animate(x, target, reduced ? { duration: 0 } : SPRING);
        },
        [count, reduced, timer, x]
    );

    const next = useCallback(() => {
        if (maxRef.current <= 0) return;
        const end = x.get() <= -maxRef.current + 2;
        goTo(end ? 0 : Math.round(-x.get() / stepRef.current) + 1);
    }, [goTo, x]);

    const prev = useCallback(() => {
        if (maxRef.current <= 0) return;
        const start = x.get() >= -2;
        goTo(start ? count - 1 : Math.round(-x.get() / stepRef.current) - 1);
    }, [count, goTo, x]);

    /* ---------- auto-play ---------- */
    const interactive = maxScroll > 0;
    const canPlay = playing && !reduced && interactive && !hovered && !focused && inView && !docHidden;
    const showTimer = playing && !reduced && interactive;

    useAnimationFrame((_, delta) => {
        if (!canPlay) return;
        elapsed.current += Math.min(delta, 100);
        timer.set(Math.min(1, elapsed.current / AUTOPLAY_MS));
        if (elapsed.current >= AUTOPLAY_MS) next();
    });

    /* ---------- keyboard + focus ---------- */
    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
        else if (e.key === "Home") { e.preventDefault(); goTo(0); }
        else if (e.key === "End") { e.preventDefault(); goTo(count - 1); }
    };

    const onFocus = (e: FocusEvent<HTMLDivElement>) => {
        if (e.target.matches(":focus-visible")) setFocused(true);
    };
    const onBlur = (e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
    };

    /* ---------- derived display values ---------- */
    const current = atEnd ? count - 1 : lead;
    const windowStart = atEnd ? Math.max(0, count - visible) : lead;

    return (
        <section id="projects" ref={sectionRef} className="relative overflow-hidden py-24 sm:py-28 lg:py-32">
            {/* ---------- Background ---------- */}
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:64px_64px]" />
                <motion.div
                    initial={reduced ? false : { opacity: 0, scale: 0.85 }}
                    whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 1.2, ease: EASE }}
                    className="absolute left-1/2 top-0 size-[520px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-[120px]"
                />
                <div className="absolute right-[8%] top-[40%] size-40 rounded-full bg-[#ffd36a]/[0.03] blur-3xl" />
            </div>

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
                    <div
                        role="region"
                        aria-roledescription="carousel"
                        aria-label="Projects"
                        tabIndex={0}
                        onKeyDown={onKeyDown}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        onMouseEnter={() => setHovered(true)}
                        onMouseLeave={() => setHovered(false)}
                        className="mt-14 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-8 focus-visible:ring-offset-background sm:mt-16"
                    >
                        {/* ---------- Stage (auto-moving, no drag / wheel) ---------- */}
                        <div
                            ref={stageRef}
                            className="relative -mx-1 overflow-hidden px-1 py-8 [mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)]"
                        >
                            <motion.div
                                ref={trackRef}
                                style={{ x, columnGap: GAP, paddingInline: PAD }}
                                className="flex w-max"
                            >
                                {projects.map((project, i) => (
                                    <Slide
                                        key={`${project.title}-${i}`}
                                        project={project}
                                        index={i}
                                        total={count}
                                        x={x}
                                        step={stepMV}
                                        view={viewMV}
                                        cardW={cardMV}
                                        reduced={reduced}
                                    />
                                ))}
                            </motion.div>
                        </div>

                        {/* ---------- Control dock: counter · progress · handlers ---------- */}
                        <div className="relative mt-2 overflow-hidden rounded-2xl border border-border/70 bg-card/60 px-4 py-3 backdrop-blur-xl sm:px-5">
                            {/* soft top highlight */}
                            <div
                                aria-hidden
                                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
                            />

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                                {/* Counter */}
                                <div className="order-1 flex min-w-0 items-center gap-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                            <RollingNumber value={current + 1} />
                                        </span>
                                        <span className="text-xs font-medium text-muted-foreground">
                                            / {pad2(count)}
                                        </span>
                                    </div>
                                </div>

                                {/* Segmented progress */}
                                <div className="order-3 flex w-full min-w-0 items-center gap-1.5 sm:order-2 sm:w-auto sm:flex-1">
                                    {projects.map((p, i) => (
                                        <Segment
                                            key={`${p.title}-seg-${i}`}
                                            index={i}
                                            current={current}
                                            inWindow={i >= windowStart && i < windowStart + visible}
                                            timer={timer}
                                            showTimer={showTimer}
                                            onSelect={goTo}
                                            total={count}
                                        />
                                    ))}
                                </div>

                                {/* Handlers */}
                                <div className="order-2 ml-auto flex items-center gap-2 sm:order-3 sm:ml-0">
                                    <ControlButton label="Previous project" onClick={prev}>
                                        <ArrowLeft className="size-4 transition-transform duration-300 group-hover/btn:-translate-x-0.5" aria-hidden />
                                    </ControlButton>

                                    <button
                                        type="button"
                                        aria-label={playing ? "Pause auto-play" : "Start auto-play"}
                                        aria-pressed={!playing}
                                        onClick={() => setPlaying((p) => !p)}
                                        className="
                                            relative flex size-11 items-center justify-center rounded-full
                                            border border-border/80 bg-background/70 text-foreground
                                            transition-all duration-300 hover:border-primary/40 hover:bg-primary/10
                                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                                            active:scale-90
                                        "
                                    >
                                        <svg viewBox="0 0 44 44" className="pointer-events-none absolute inset-0 -rotate-90" aria-hidden>
                                            <circle cx="22" cy="22" r="20.5" fill="none" strokeWidth="1.5" className="stroke-border" />
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
                                                {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4 translate-x-px" aria-hidden />}
                                            </motion.span>
                                        </AnimatePresence>
                                    </button>

                                    <ControlButton label="Next project" onClick={next}>
                                        <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" aria-hidden />
                                    </ControlButton>
                                </div>
                            </div>
                        </div>

                        {/* Screen-reader announcement */}
                        <p className="sr-only" aria-live={playing ? "off" : "polite"}>
                            Showing project {current + 1} of {count}: {projects[current]?.title}
                        </p>
                    </div>
                </Reveal>

                {/* ---------- CTA ---------- */}
                <Reveal delay={0.12} className="mt-14 flex justify-center sm:mt-16">
                    <Link href="/projects" className="custom-btn group inline-flex items-center gap-2">
                        See all projects
                        <ArrowUpRight
                            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                            aria-hidden
                        />
                    </Link>
                </Reveal>
            </Container>
        </section>
    );
}

export default function Projects() {
    if (!projects.length) return null;
    return <ProjectsShowcase />;
}