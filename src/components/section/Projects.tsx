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
    Carousel, CarouselContent,
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
const SPRING = {
    type: "spring",
    stiffness: 420,
    damping: 22,
} as const;

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

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
    const stageRef = useRef<HTMLDivElement>(null);

    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [centered, setCentered] = useState(0);
    const [snapCount, setSnapCount] = useState(0);
    const [inViewSlides, setInViewSlides] = useState<number[]>([]);

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
                                            mediaType: project.mediaType,
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
            </Container>
        </section>
    );
}

export default function Projects() {
    return <ProjectsShowcase />;
}