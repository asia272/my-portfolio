"use client";

import { useRef, type ReactNode, type MouseEvent } from "react";
import {
    motion,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type Variants,
} from "framer-motion";

import Container from "@/components/common/Container";
import SectionHeading from "@/components/common/SectionHeading";
import { Counter, Reveal, ScrollFillText, SpotlightCard } from "../animations";
import { stats } from "@/lib/data";
import { CodeWindow } from "../magic/effects";
import AboutTimeLine from "../AboutTimeLine";

/* ================================================================
   CONFIG
================================================================ */

const skills = [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "Node.js",
    "MongoDB",
    "PostgreSQL",
    "Prisma",
    "Framer Motion",
    "REST APIs",
    "Auth",
    "Vercel",
];

const floatingChips = [
    { label: "Pakistan", className: "right-6 top-5 sm:right-8", delay: 0 },
    { label: "Open to work", className: "bottom-24 right-6 sm:right-10", delay: 1.2 },
];

const principles = [
    { k: "Focus", v: "Modern web experiences" },
    { k: "Approach", v: "Build · Refine · Ship" },
    { k: "Mindset", v: "Always improving" },
];

/* ================================================================
   REUSABLE ANIMATION PIECES
================================================================ */

/** 3D tilt card that follows the cursor with spring physics */
function TiltCard({
    children,
    className = "",
    intensity = 7,
}: {
    children: ReactNode;
    className?: string;
    intensity?: number;
}) {
    const reduce = useReducedMotion();
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
        stiffness: 180,
        damping: 18,
    });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
        stiffness: 180,
        damping: 18,
    });

    const onMove = (e: MouseEvent<HTMLDivElement>) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
    };

    const onLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={
                reduce
                    ? undefined
                    : {
                        rotateX,
                        rotateY,
                        transformPerspective: 1200,
                        transformStyle: "preserve-3d",
                    }
            }
            className={className}
        >
            {children}
        </motion.div>
    );
}

/** Card wrapper with a slowly rotating conic-gradient border */
function GlowBorder({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const reduce = useReducedMotion();

    return (
        <div className={`relative overflow-hidden rounded-3xl p-px ${className}`}>
            <motion.div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[250%] -translate-x-1/2 -translate-y-1/2 opacity-70"
                style={{
                    background:
                        "conic-gradient(from 0deg, transparent 0deg, var(--chart-2) 60deg, transparent 120deg, transparent 200deg, var(--chart-3) 260deg, transparent 320deg)",
                }}
                animate={reduce ? undefined : { rotate: 360 }}
                transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            />
            <div className="relative h-full rounded-[inherit]">{children}</div>
        </div>
    );
}

/** Infinite horizontal marquee of skill pills */
function SkillsMarquee() {
    const reduce = useReducedMotion();
    const items = [...skills, ...skills];

    return (
        <div
            className="relative overflow-hidden py-1"
            style={{
                maskImage:
                    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
                WebkitMaskImage:
                    "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
        >
            <motion.div
                className="flex w-max gap-3"
                animate={reduce ? undefined : { x: ["0%", "-50%"] }}
                transition={{ duration: 32, ease: "linear", repeat: Infinity }}
            >
                {items.map((s, i) => (
                    <span
                        key={`${s}-${i}`}
                        className="flex items-center gap-2 whitespace-nowrap rounded-full border border-border/70 bg-background/40 px-4 py-2 text-sm font-medium text-muted-foreground backdrop-blur transition-colors hover:border-gold/60 hover:text-foreground"
                    >
                        <span className="size-1.5 rounded-full bg-gold" />
                        {s}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}

/** Floating chip that gently bobs */
function FloatingChip({
    label,
    className,
    delay,
}: {
    label: string;
    className: string;
    delay: number;
}) {
    const reduce = useReducedMotion();

    return (
        <motion.span
            className={`pointer-events-none absolute z-20 hidden items-center gap-2 rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-lg backdrop-blur-md md:flex ${className}`}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + delay * 0.2, type: "spring", stiffness: 160 }}
        >
            <motion.span
                className="flex items-center gap-2"
                animate={reduce ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
            >
                <span className="size-1.5 rounded-full bg-gold" />
                {label}
            </motion.span>
        </motion.span>
    );
}

const staggerParent: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const staggerChild: Variants = {
    hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
    show: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

/* ================================================================
   ABOUT SECTION
================================================================ */

export default function About() {
    const reduce = useReducedMotion();
    const sectionRef = useRef<HTMLElement>(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    // Parallax for background orbs
    const orbY1 = useTransform(scrollYProgress, [0, 1], [-120, 160]);
    const orbY2 = useTransform(scrollYProgress, [0, 1], [140, -160]);
    const gridY = useTransform(scrollYProgress, [0, 1], [0, -80]);

    // Scroll progress line
    const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

    // Mouse-follow spotlight over the whole section
    const mx = useMotionValue(-400);
    const my = useMotionValue(-400);
    const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, color-mix(in oklab, var(--chart-2) 14%, transparent), transparent 70%)`;

    const onSectionMove = (e: MouseEvent<HTMLElement>) => {
        if (reduce || !sectionRef.current) return;
        const r = sectionRef.current.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
    };

    return (
        <section
            id="about"
            ref={sectionRef}
            onMouseMove={onSectionMove}
            className="section relative overflow-hidden"
        >
            {/* ============================================================
                BACKGROUND LAYERS
            ============================================================ */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                {/* Grid */}
                <motion.div
                    style={{
                        y: reduce ? 0 : gridY,
                        backgroundImage:
                            "linear-gradient(to right, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--foreground) 6%, transparent) 1px, transparent 1px)",
                        backgroundSize: "56px 56px",
                        maskImage:
                            "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)",
                        WebkitMaskImage:
                            "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)",
                    }}
                    className="absolute inset-0"
                />

                {/* Parallax orbs */}
                <motion.div
                    style={{ y: reduce ? 0 : orbY1 }}
                    className="absolute -left-32 top-20 size-[420px] rounded-full bg-[var(--chart-2)]/15 blur-[110px]"
                />
                <motion.div
                    style={{ y: reduce ? 0 : orbY2 }}
                    className="absolute -right-32 bottom-10 size-[460px] rounded-full bg-[var(--chart-3)]/15 blur-[120px]"
                />

                {/* Cursor spotlight */}
                <motion.div style={{ background: spotlight }} className="absolute inset-0" />
            </div>

            {/* Scroll progress line */}
            <motion.div
                aria-hidden
                style={{ scaleX: progress }}
                className="absolute inset-x-0 top-0 z-30 h-[2px] origin-left bg-gradient-to-r from-[var(--chart-2)] via-gold to-[var(--chart-3)]"
            />

            <Container>
                <SectionHeading
                    label="About"
                    title="Building with"
                    highlightedText="purpose & passion"
                    description="I'm a Next.js full-stack developer from Pakistan focused on creating modern, scalable, and user-friendly digital experiences."
                />

                {/* ============================================================
                    INTRODUCTION + CODE WINDOW + STATS
                ============================================================ */}
                <div className="grid gap-5 lg:grid-cols-3">
                    {/* Main Introduction */}
                    <Reveal className="lg:col-span-2">
                        <TiltCard className="h-full" intensity={4}>
                            <GlowBorder className="h-full">
                                <SpotlightCard className="group relative h-full overflow-hidden p-7 sm:p-9 lg:p-10">
                                    {/* Decorative glows */}
                                    <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-[var(--chart-2)]/10 blur-3xl transition-opacity duration-700 group-hover:opacity-90" />
                                    <div className="pointer-events-none absolute -bottom-24 -left-24 size-64 rounded-full bg-[var(--chart-3)]/10 blur-3xl transition-opacity duration-700 group-hover:opacity-90" />

                                    {floatingChips.map((c) => (
                                        <FloatingChip key={c.label} {...c} />
                                    ))}

                                    <div className="relative z-10 flex h-full flex-col justify-between">
                                        <div>
                                            <div className="mb-7 flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="relative flex size-2.5">
                                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-gold opacity-50" />
                                                        <span className="relative inline-flex size-2.5 rounded-full bg-gold" />
                                                    </span>

                                                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                                        A little about me
                                                    </span>
                                                </div>

                                                <span className="hidden rounded-full border border-border/70 bg-background/40 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur sm:block">
                                                    Next.js · Full-Stack
                                                </span>
                                            </div>

                                            <ScrollFillText
                                                className="max-w-4xl text-2xl font-medium leading-[1.35] tracking-tight sm:text-3xl lg:text-[2.15rem]"
                                                text="I'm a Computer Science student from Pakistan who learned web development by building real things. I care about the details that make an app feel finished: spacing, typography, motion, accessibility and clear error handling. My goal is to turn an idea into a deployed, polished product."
                                            />
                                        </div>

                                        {/* Principles */}
                                        <motion.div
                                            variants={staggerParent}
                                            initial="hidden"
                                            whileInView="show"
                                            viewport={{ once: true, margin: "-60px" }}
                                            className="mt-10 grid gap-4 border-t border-border/60 pt-5 sm:grid-cols-3"
                                        >
                                            {principles.map((p) => (
                                                <motion.div
                                                    key={p.k}
                                                    variants={staggerChild}
                                                    whileHover={reduce ? undefined : { y: -3 }}
                                                    className="relative pl-4"
                                                >
                                                    <span className="absolute left-0 top-1 h-8 w-px bg-gradient-to-b from-gold to-transparent" />
                                                    <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                                                        {p.k}
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium">{p.v}</p>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    </div>
                                </SpotlightCard>
                            </GlowBorder>
                        </TiltCard>
                    </Reveal>

                    {/* Code Window */}
                    <Reveal delay={0.1}>
                        <TiltCard className="h-full" intensity={8}>
                            <SpotlightCard className="group relative h-full min-h-[320px] overflow-hidden">
                                <div className="pointer-events-none absolute -bottom-20 -right-20 size-52 rounded-full bg-[var(--chart-3)]/10 blur-3xl transition-opacity duration-700 group-hover:opacity-100" />

                                <motion.div
                                    className="relative h-full overflow-hidden rounded-3xl"
                                    animate={reduce ? undefined : { y: [0, -5, 0] }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <CodeWindow />
                                </motion.div>
                            </SpotlightCard>
                        </TiltCard>
                    </Reveal>

                    {/* Stats */}
                    {stats.map((s, i) => (
                        <Reveal key={s.label} delay={0.15 + i * 0.08}>
                            <TiltCard className="h-full" intensity={10}>
                                <SpotlightCard className="group relative h-full overflow-hidden p-6 sm:p-7">
                                    <div className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-[var(--chart-2)]/10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-[var(--chart-3)]/15" />

                                    {/* Animated bottom bar */}
                                    <span className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-[var(--chart-2)] via-gold to-[var(--chart-3)] transition-transform duration-700 ease-out group-hover:scale-x-100" />

                                    <div className="relative">
                                        <div className="mb-8 flex items-center justify-between">
                                            <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                                Metric
                                            </span>

                                            <motion.span
                                                className="size-2 rounded-full bg-gold/80 shadow-[0_0_12px_var(--primary)]"
                                                animate={
                                                    reduce
                                                        ? undefined
                                                        : { scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }
                                                }
                                                transition={{
                                                    duration: 2.4,
                                                    delay: i * 0.3,
                                                    repeat: Infinity,
                                                }}
                                            />
                                        </div>

                                        <div className="text-5xl font-semibold tracking-[-0.04em] text-gradient sm:text-6xl">
                                            <Counter to={s.value} suffix={s.suffix} />
                                        </div>

                                        <p className="mt-3 max-w-[180px] text-sm leading-relaxed text-muted-foreground">
                                            {s.label}
                                        </p>
                                    </div>
                                </SpotlightCard>
                            </TiltCard>
                        </Reveal>
                    ))}
                </div>

                {/* ============================================================
                    SKILLS MARQUEE
                ============================================================ */}
                <Reveal delay={0.1}>
                    <div className="mt-14">
                        <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                            Tools I build with
                        </p>
                        <SkillsMarquee />
                    </div>
                </Reveal>

                {/* ============================================================
                    TIMELINE
                ============================================================ */}
                <div className="mt-20 sm:mt-24">
                    <Reveal>
                        <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gold">
                                    My journey
                                </p>

                                <h3 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                                    From learning to building
                                </h3>

                                <motion.span
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                                    className="mt-3 block h-[2px] w-24 origin-left rounded-full bg-gradient-to-r from-gold to-transparent"
                                />
                            </div>

                            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-right">
                                A continuous journey of learning, experimenting,
                                building real projects, and becoming a better
                                developer.
                            </p>
                        </div>
                    </Reveal>

                    <AboutTimeLine />
                </div>
            </Container>
        </section>
    );
}