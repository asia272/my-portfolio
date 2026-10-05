"use client";


import {
    motion,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from "motion/react";
import { useRef } from "react";

import {
    ABOUT_PARAGRAPHS,
    EDUCATION,
    STATS,
    VALUES,
} from "@/data/portfolio";
import { Badge } from "../ui/badge";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import {
    GraduationCap,
    Globe,
    Sparkles,
    Wrench,
} from "lucide-react";
import {
    Counter,
    Reveal,
    SpotlightCard,
} from "@/components/animations/animations";

/* ============================================================
   ABOUT
============================================================ */

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







export default function About() {
    const sectionRef = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();

    /*
     * Section scroll progress.
     *
     * Used only for the subtle background movement and the
     * education timeline reveal.
     */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start 0.82", "end 0.25"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        mass: 0.5,
    });

    /* ----------------------------------------------------------
       Background parallax
    ---------------------------------------------------------- */

    const leftGlowY = useTransform(
        smoothProgress,
        [0, 1],
        reduceMotion ? [0, 0] : [-60, 80],
    );

    const rightGlowY = useTransform(
        smoothProgress,
        [0, 1],
        reduceMotion ? [0, 0] : [70, -70],
    );

    const gridY = useTransform(
        smoothProgress,
        [0, 1],
        reduceMotion ? [0, 0] : [0, -35],
    );
    const VALUE_ICONS = {
        sparkles: Sparkles,
        wrench: Wrench,
        globe: Globe,
    } as const;
    return (
        <section
            id="about"
            ref={sectionRef}
            className="relative section overflow-hidden"
        >
            {/* ======================================================
          PREMIUM BACKGROUND
      ====================================================== */}

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            >
                {/* Subtle technical grid */}

                <motion.div
                    style={{ y: gridY }}
                    className="absolute inset-0 opacity-[0.025]"
                >
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                linear-gradient(
                  to right,
                  var(--foreground) 1px,
                  transparent 1px
                ),
                linear-gradient(
                  to bottom,
                  var(--foreground) 1px,
                  transparent 1px
                )
              `,
                            backgroundSize: "64px 64px",
                            maskImage:
                                "radial-gradient(ellipse 75% 65% at 50% 45%, black, transparent 78%)",
                            WebkitMaskImage:
                                "radial-gradient(ellipse 75% 65% at 50% 45%, black, transparent 78%)",
                        }}
                    />
                </motion.div>

                {/* Left purple/blue glow */}

                <motion.div
                    style={{ y: leftGlowY }}
                    className="absolute -left-52 top-24 size-[430px] rounded-full bg-[var(--chart-2)]/10 blur-[120px]"
                />

                {/* Right purple glow */}

                <motion.div
                    style={{ y: rightGlowY }}
                    className="absolute -right-52 bottom-20 size-[460px] rounded-full bg-[var(--chart-3)]/10 blur-[125px]"
                />

                {/* Small ambient glow */}

                <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--chart-4)]/[0.025] blur-[150px]" />
            </div>

            {/* ======================================================
          SECTION HEADING
      ====================================================== */}
            <Container>

                <SectionHeading
                    label="About me"
                    title="Building with"
                    highlightedText="purpose & passion"
                    description="A self-driven developer who learns by building real things."
                />


                <div className="grid items-start gap-12 lg:grid-cols-2">
                    {/* ====================================================
            LEFT
            Story + Values
        ==================================================== */}

                    <div className="space-y-6">
                        {/* --------------------------------------------------
              ABOUT PARAGRAPHS
          -------------------------------------------------- */}

                        {ABOUT_PARAGRAPHS.map((paragraph, index) => (
                            <Reveal
                                key={index}
                                delay={index * 0.08}
                            >
                                <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                                    {paragraph}
                                </p>
                            </Reveal>
                        ))}

                        {/* --------------------------------------------------
              VALUES
          -------------------------------------------------- */}

                        <div className="grid items-stretch gap-4 pt-4 sm:grid-cols-3">
                            {VALUES.map((value, index) => (
                                <Reveal
                                    key={value.title}
                                    delay={0.1 * index}
                                    className="h-full"
                                >
                                    <SpotlightCard className="flex h-full min-h-[190px] flex-col p-5">
                                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                                            {(() => {
                                                const ValueIcon = VALUE_ICONS[value.icon];

                                                return <ValueIcon className="size-5" />;
                                            })()}
                                        </span>

                                        <h3 className="mt-4 text-sm font-semibold">
                                            {value.title}
                                        </h3>

                                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                            {value.description}
                                        </p>
                                    </SpotlightCard>
                                </Reveal>
                            ))}
                        </div>
                    </div>

                    {/* ====================================================
            RIGHT
            Stats + Education
        ==================================================== */}

                    <div className="space-y-8">
                        {/* --------------------------------------------------
              STATS
          -------------------------------------------------- */}

                        <div className="grid grid-cols-2 gap-4">
                            {STATS.map((stat, index) => (
                                <Reveal key={stat.label} delay={0.08 * index}>
                                    <SpotlightCard className="p-6 text-center">
                                        <p className="text-gold text-4xl font-extrabold sm:text-5xl">
                                            <Counter to={stat.value} suffix={stat.suffix} />
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                                    </SpotlightCard>
                                </Reveal>
                            ))}
                        </div>

                        {/* --------------------------------------------------
              EDUCATION
          -------------------------------------------------- */}

                        <Reveal delay={0.15}>
                            <div className="glass relative overflow-hidden rounded-xl p-6 sm:p-8">
                                {/* ==================================================
                  CARD AMBIENT LIGHT
              ================================================== */}

                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -right-32 -top-32 size-72 rounded-full bg-[var(--chart-2)]/8 blur-[90px]"
                                />

                                <div
                                    aria-hidden
                                    className="pointer-events-none absolute -bottom-32 -left-32 size-72 rounded-full bg-[var(--chart-3)]/7 blur-[90px]"
                                />

                                {/* ==================================================
                  EDUCATION HEADER
              ================================================== */}

                                <motion.h3
                                    initial={{
                                        opacity: 0,
                                        x: -20,
                                        filter: "blur(8px)",
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        x: 0,
                                        filter: "blur(0px)",
                                    }}
                                    viewport={{
                                        once: true,
                                        margin: "-70px",
                                    }}
                                    transition={{
                                        duration: 0.7,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                    className="relative flex items-center gap-3 text-lg font-semibold"
                                >
                                    <motion.span
                                        initial={{
                                            scale: 0,
                                            rotate: -20,
                                        }}
                                        whileInView={{
                                            scale: 1,
                                            rotate: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                        }}
                                        transition={{
                                            duration: 0.65,
                                            type: "spring",
                                            stiffness: 180,
                                            damping: 14,
                                        }}
                                        className="grid size-9 place-items-center rounded-xl bg-primary/10"
                                    >
                                        <GraduationCap className="size-5 text-gold" />
                                    </motion.span>

                                    Education
                                </motion.h3>

                                {/* ==================================================
                  TIMELINE
              ================================================== */}

                                <EducationTimeline />
                            </div>
                        </Reveal>
                    </div>
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
            </Container>

        </section>
    );
}



/* ============================================================
   PREMIUM EDUCATION TIMELINE
============================================================ */

function EducationTimeline() {
    const timelineRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ["start 0.78", "end 0.58"],
    });

    const progress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 26,
        mass: 0.4,
    });

    return (
        <div
            ref={timelineRef}
            className="relative mt-8 pl-8"
        >
            {/* Straight base timeline line */}
            <div
                aria-hidden
                className="absolute left-[6px] top-0 bottom-0 w-px bg-border/70"
            />

            {/* Straight animated timeline line */}
            <motion.div
                aria-hidden
                style={{ scaleY: progress }}
                className="absolute left-[5px] top-0 bottom-0 w-[2px] origin-top bg-primary"
            />

            {/* Education entries */}
            <ol>
                {EDUCATION.map((entry, index) => (
                    <EducationItem
                        key={entry.title}
                        entry={entry}
                        index={index}
                    />
                ))}
            </ol>
        </div>
    );
}
/* ============================================================
   EDUCATION ITEM
============================================================ */

function EducationItem({
    entry,
    index,
}: {
    entry: (typeof EDUCATION)[number];
    index: number;
}) {
    return (
        <Reveal
            delay={index * 0.07}
            className="group relative pb-9 last:pb-0"
        >
            {/* ==================================================
                TIMELINE NODE
            ================================================== */}

            <motion.span
                initial={{
                    scale: 0,
                    opacity: 0,
                }}
                whileInView={{
                    scale: 1,
                    opacity: 1,
                }}
                viewport={{
                    once: true,
                    margin: "-80px",
                }}
                transition={{
                    duration: 0.45,
                    delay: index * 0.07,
                    type: "spring",
                    stiffness: 240,
                    damping: 18,
                }}
                className="absolute -left-[2rem] top-[5px] size-3 rounded-full border-2 border-background bg-primary ring-4 ring-primary/20"
            >
                <span className="size-[3px] rounded-full bg-background" />
            </motion.span>

            {/* ==================================================
                PERIOD
            ================================================== */}

            <motion.div
                initial={{
                    opacity: 0,
                    y: 8,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    once: true,
                    margin: "-80px",
                }}
                transition={{
                    duration: 0.5,
                    delay: 0.08 + index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-flex"
            >
                <Badge variant="gold">
                    {entry.period}
                </Badge>
            </motion.div>

            {/* ==================================================
                TITLE
            ================================================== */}

            <motion.h4
                initial={{
                    opacity: 0,
                    y: 8,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    once: true,
                    margin: "-80px",
                }}
                transition={{
                    duration: 0.55,
                    delay: 0.14 + index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-3 text-base font-semibold tracking-tight transition-colors duration-300 group-hover:text-[var(--primary)] sm:text-lg"
            >
                {entry.title}
            </motion.h4>

            {/* ==================================================
                INSTITUTION
            ================================================== */}

            <motion.p
                initial={{
                    opacity: 0,
                    y: 6,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    once: true,
                    margin: "-80px",
                }}
                transition={{
                    duration: 0.5,
                    delay: 0.19 + index * 0.07,
                }}
                className="mt-1 text-sm font-medium text-[var(--primary)]"
            >
                {entry.place}
            </motion.p>

            {/* ==================================================
                DESCRIPTION
            ================================================== */}

            <motion.p
                initial={{
                    opacity: 0,
                    y: 6,
                }}
                whileInView={{
                    opacity: 1,
                    y: 0,
                }}
                viewport={{
                    once: true,
                    margin: "-80px",
                }}
                transition={{
                    duration: 0.55,
                    delay: 0.24 + index * 0.07,
                    ease: [0.22, 1, 0.36, 1],
                }}
                className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground"
            >
                {entry.description}
            </motion.p>

        </Reveal>
    );
}
/* ============================================================
   VALUE ICON
============================================================ */

/*
 * This keeps the old VALUES data completely unchanged.
 *
 * If your existing Icon component already handles all these
 * names, you can simply use that component here instead.
 */

function ValueIcon({
    name,
}: {
    name: string;
}) {
    return (
        <span className="text-[13px] font-semibold">
            {name.slice(0, 1).toUpperCase()}
        </span>
    );
}