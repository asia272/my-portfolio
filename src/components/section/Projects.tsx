"use client";

/**
 * Projects section built on the shadcn/ui Carousel (Embla).
 *
 * Requires:  npx shadcn@latest add carousel
 *
 * Behaviour (same as before):
 *  - 3 slides on desktop, 2 on tablet, 1 on mobile
 *  - auto-play with a visible countdown (ring + segmented progress)
 *  - pauses on hover / keyboard focus / hidden tab / off-screen
 *  - no mouse-drag or wheel scrolling – only auto-play, buttons, segments, arrow keys
 *  - depth effect (scale / fade / tilt) on slides based on their position
 */

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
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode,
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

type Project = (typeof projects)[number];

const pad2 = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

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
   PROJECT CARD
   (the outer wrapper is what the carousel scales / fades / tilts)
============================================================ */

function ProjectCard({ project, index }: { project: Project; index: number }) {
    const accent = index % 2 === 1 ? "#ffd36a" : "var(--primary)";

    return (
        <div data-depth className="h-full will-change-transform">
            <SpotlightCard className="group h-full overflow-hidden rounded-[1.75rem] border-border/70 bg-card/80 backdrop-blur-xl transition-colors duration-500 hover:border-primary/30">
                {/* ---------- Project Image ---------- */}
                <div className="relative h-[245px] overflow-hidden sm:h-[275px]">
                    <div className="absolute inset-0 bg-secondary" />

                    <img
                        src={project?.image}
                        alt={`${project.title} project preview`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 size-full object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                    />

                    <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10"
                    />

                    <div className="absolute left-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[11px] font-medium text-white/90 backdrop-blur-md">
                        {pad2(index + 1)}
                    </div>

                    <div className="absolute right-5 top-5 z-10 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/90 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:opacity-100">
                        <ArrowUpRight className="size-4" aria-hidden />
                    </div>
                </div>

                {/* ---------- Content ---------- */}
                <div className="relative flex min-h-[255px] flex-col p-6 sm:p-7">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="size-1.5 rounded-full" style={{ background: accent }} />
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
                            <GithubIcon className="size-4" aria-hidden />
                            Source
                        </a>
                    </div>
                </div>
            </SpotlightCard>
        </div>
    );
}

/* ============================================================
   SHOWCASE
============================================================ */

function ProjectsShowcase() {
    const reduced = !!useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [snapCount, setSnapCount] = useState(projects.length);
    const [inViewSlides, setInViewSlides] = useState<number[]>([]);

    const [playing, setPlaying] = useState(true);
    const [hovered, setHovered] = useState(false);
    const [focused, setFocused] = useState(false);
    const [docHidden, setDocHidden] = useState(false);

    const timer = useMotionValue(0); // 0 → 1 auto-play countdown
    const elapsed = useRef(0);

    const inView = useInView(sectionRef, { amount: 0.3 });

    /* ---------- Embla options ---------- */
    const opts = useMemo(
        () => ({
            align: "start" as const,
            loop: true,
            slidesToScroll: 1,
            watchDrag: false, // no mouse / touch drag
            duration: reduced ? 6 : 32, // higher = slower, smoother slide
            inViewThreshold: 0.5,
        }),
        [reduced]
    );

    /* ---------- depth effect (scale / fade / tilt by position) ---------- */
    const applyDepth = useCallback(
        (embla: NonNullable<CarouselApi>) => {
            if (reduced) return;
            const viewport = embla.rootNode().getBoundingClientRect();
            const half = viewport.width / 2;
            if (!half) return;
            const center = viewport.left + half;

            embla.slideNodes().forEach((node) => {
                const el = node.querySelector<HTMLElement>("[data-depth]");
                if (!el) return;
                const r = node.getBoundingClientRect();
                const d = clamp((r.left + r.width / 2 - center) / half, -1.4, 1.4);
                el.style.transform = `perspective(1400px) rotateY(${d * -5}deg) scale(${1 - Math.min(Math.abs(d), 1) * 0.05
                    })`;
                el.style.opacity = String(1 - Math.min(Math.abs(d), 1.2) * 0.42);
            });
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
                        {/* ---------- Slides: 1 mobile · 2 tablet · 3 desktop ---------- */}
                        <CarouselContent className="-ml-6 py-8">
                            {projects.map((project, i) => (
                                <CarouselItem
                                    key={`${project.title}-${i}`}
                                    className="basis-full pl-6 md:basis-1/2 lg:basis-1/3"
                                >
                                    <ProjectCard project={project} index={i} />
                                </CarouselItem>
                            ))}
                        </CarouselContent>

                        {/* ---------- Control dock: counter · progress · handlers ---------- */}
                        <div className="relative mt-2 overflow-hidden rounded-2xl border border-border/70 bg-card/60 px-4 py-3 backdrop-blur-xl sm:px-5">
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
                                            / {pad2(snapCount)}
                                        </span>
                                    </div>
                                </div>

                                {/* Segmented progress */}
                                <div className="order-3 flex w-full min-w-0 items-center gap-1.5 sm:order-2 sm:w-auto sm:flex-1">
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
                            Showing project {current + 1} of {snapCount}: {projects[current]?.title}
                        </p>
                    </Carousel>
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