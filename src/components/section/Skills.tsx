
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    AnimatePresence,
    LayoutGroup,
    motion,
    useInView,
    useMotionTemplate,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
} from "motion/react";
import Container from "../common/Container";
import SectionHeading from "../common/SectionHeading";
import { skillGroups } from "@/lib/data";
import { Reveal, Counter, EASE } from "../animations/animations";
import { OrbitingCircles } from "../magic/effects";
import { Badge } from "../ui/badge";

/* =====================================================================
   Helpers
   ===================================================================== */

/** Soft static grid + one slow glow. Clean, no moving clutter. */
function Backdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_70%)]" />
            <motion.div
                className="absolute left-1/2 top-1/2 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/10 blur-[170px]"
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}


/** Pointer-following 3D tilt (disabled for reduced motion). */
function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
    const reduce = useReducedMotion();
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const cfg = { stiffness: 140, damping: 18, mass: 0.6 };
    const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), cfg);
    const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), cfg);
    return (
        <motion.div
            className={className}
            style={reduce ? undefined : { rotateX, rotateY, transformPerspective: 1200, transformStyle: "preserve-3d" }}
            onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                mx.set((e.clientX - r.left) / r.width - 0.5);
                my.set((e.clientY - r.top) / r.height - 0.5);
            }}
            onMouseLeave={() => { mx.set(0); my.set(0); }}
        >
            {children}
        </motion.div>
    );
}

function Ring({ size, reverse = false, dash = "4 10", opacity = 0.35 }: { size: string; reverse?: boolean; dash?: string; opacity?: number }) {
    return (
        <motion.svg
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-primary"
            style={{ width: size, height: size, opacity }}
            viewBox="0 0 100 100"
            animate={{ rotate: reverse ? -360 : 360 }}
            transition={{ duration: reverse ? 90 : 60, repeat: Infinity, ease: "linear" }}
        >
            <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="0.35" strokeDasharray={dash} />
        </motion.svg>
    );
}

/* =====================================================================
   Tab data
   ===================================================================== */

type Tab = { title: string; items: string[] };

function useTabs(): Tab[] {
    return useMemo(() => {
        const all = Array.from(new Set(skillGroups.flatMap((g) => g.items)));
        return [{ title: "All", items: all }, ...skillGroups.map((g) => ({ title: g.title, items: g.items }))];
    }, []);
}

/* =====================================================================
   Orbit: reacts to the selected tab, label in the middle is plain text
   ===================================================================== */

function Orbit({ tab }: { tab: Tab }) {
    const inner = tab.items.slice(0, 4);
    const outer = tab.items.slice(4, 10);
    return (
        <div className="relative mx-auto h-[360px] w-full max-w-[360px] [--r1:105px] [--r2:165px] sm:h-[500px] sm:max-w-[500px] sm:[--r1:140px] sm:[--r2:230px]">
            <Ring size="calc(var(--r1) * 2)" opacity={0.5} />
            <Ring size="calc(var(--r2) * 2)" reverse dash="2 8" opacity={0.4} />
            <Ring size="calc(var(--r2) * 2 + 70px)" dash="1 14" opacity={0.18} />

            {/* center label: text only */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab.title}
                        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
                        transition={{ duration: 0.45, ease: EASE }}
                    >
                        <div className="mt-1 text-2xl font-semibold sm:text-3xl">{tab.title}</div>
                        <div className="mt-1 text-sm tabular-nums text-primary">{tab.items.length} technologies</div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tab.title}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.08 }}
                    transition={{ duration: 0.5, ease: EASE }}
                >
                    <OrbitingCircles items={inner} radius="var(--r1)" duration={28} />
                    {outer.length > 0 && <OrbitingCircles items={outer} radius="var(--r2)" duration={45} reverse />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

/* =====================================================================
   Chip + panel
   ===================================================================== */

function SkillChip({ label, index }: { label: string; index: number }) {
    const x = useMotionValue(-999);
    const y = useMotionValue(-999);
    const glow = useMotionTemplate`radial-gradient(80px circle at ${x}px ${y}px, color-mix(in srgb, var(--primary) 30%, transparent), transparent 80%)`;
    return (
        <motion.li
            layout
            initial={{ opacity: 0, scale: 0.6, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: EASE, delay: index * 0.03 } }}
            exit={{ opacity: 0, scale: 0.7, filter: "blur(6px)", transition: { duration: 0.2 } }}
            transition={{ layout: { type: "spring", stiffness: 380, damping: 32 } }}
        >
            <motion.div
                whileHover={{ y: -4, scale: 1.07 }}
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    x.set(e.clientX - r.left);
                    y.set(e.clientY - r.top);
                }}
                className="group/chip relative overflow-hidden rounded-full"
            >
                <motion.span aria-hidden style={{ background: glow }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/chip:opacity-100" />
                <Badge className="relative cursor-default gap-2 px-4 py-1.5 text-foreground">
                    <span className="size-1.5 rounded-full bg-primary" />
                    {label}
                </Badge>
            </motion.div>
        </motion.li>
    );
}

function SkillPanel({ tabs, tab, setTab, auto, duration }: { tabs: Tab[]; tab: number; setTab: (i: number) => void; auto: boolean; duration: number }) {
    const px = useMotionValue(-999);
    const py = useMotionValue(-999);
    const spot = useMotionTemplate`radial-gradient(420px circle at ${px}px ${py}px, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)`;
    const total = tabs[0].items.length;

    return (
        <Tilt max={4}>
            <div
                onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    px.set(e.clientX - r.left);
                    py.set(e.clientY - r.top);
                }}
                className="group relative overflow-hidden rounded-[28px] border border-border bg-card/70 p-6 backdrop-blur-xl sm:p-8"
            >

                <motion.div aria-hidden style={{ background: spot }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Tabs */}
                <LayoutGroup id="skill-tabs">
                    <div role="tablist" className="relative flex flex-wrap gap-1 rounded-xl border border-border bg-background/60 p-4">
                        {tabs.map((t, i) => (
                            <button
                                key={t.title}
                                role="tab"
                                aria-selected={tab === i}
                                onClick={() => setTab(i)}
                                className="relative rounded-xl px-4 py-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                {tab === i && (
                                    <motion.span
                                        layoutId="pill"
                                        className="
        absolute
        inset-0
        rounded-md
        bg-gold-dark
      
    "
                                        transition={{
                                            type: "spring",
                                            stiffness: 420,
                                            damping: 32,
                                        }}
                                    />
                                )}
                                {tab === i && auto && (
                                    <motion.span
                                        key={`progress-${tab}`}
                                        aria-hidden
                                        className="absolute inset-x-4 bottom-1 h-[4px] origin-left rounded-full bg-black"
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration, ease: "linear" }}
                                    />
                                )}
                                <span className={`relative flex items-center gap-2 ${tab === i ? "text-black" : "text-muted-foreground hover:text-foreground"}`}>
                                    {t.title}
                                    <span className={`rounded-full px-1.5 text-[10px] tabular-nums ${tab === i ? "bg-white/25" : "bg-muted"}`}>{t.items.length}</span>
                                </span>
                            </button>
                        ))}
                    </div>
                </LayoutGroup>

                {/* Chips */}
                <div className="relative mt-8 min-h-[190px]">
                    <AnimatePresence mode="popLayout">
                        <motion.ul key={tab} layout className="flex flex-wrap gap-3">
                            {tabs[tab].items.map((s, i) => (
                                <SkillChip key={s} label={s} index={i} />
                            ))}
                        </motion.ul>
                    </AnimatePresence>
                </div>
                {/* Stats */}
                <div className="relative mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
                    {[
                        { v: <Counter to={tabs.length} />, l: "Focus areas" },
                        { v: <Counter to={total} suffix="+" />, l: "Technologies" },
                        {
                            v: (
                                <span className="inline-flex items-center gap-2">
                                    <span className="relative flex size-2.5">
                                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-70" />
                                        <span className="relative inline-flex size-2.5 rounded-full bg-gold" />
                                    </span>
                                    Live
                                </span>
                            ),
                            l: "Always learning",
                        },
                    ].map((s, i) => (
                        <motion.div
                            key={s.l}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, ease: EASE, delay: 0.2 + i * 0.1 }}
                        >
                            <div className="text-2xl font-semibold tabular-nums sm:text-3xl">{s.v}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </Tilt>
    );
}

/* =====================================================================
   Section
   ===================================================================== */

export function Skills() {
    const ref = useRef<HTMLElement>(null);
    const tabs = useTabs();
    const [tab, setTab] = useState(0);

    const reduce = useReducedMotion();
    const inView = useInView(ref, { amount: 0.3 });

    /** Auto-play: All -> Frontend -> Backend -> ... then back to All. */
    const AUTO_SECONDS = 4;
    const auto = inView && !reduce;
    useEffect(() => {
        if (!auto) return;
        const t = setTimeout(() => setTab((c) => (c + 1) % tabs.length), AUTO_SECONDS * 1000);
        return () => clearTimeout(t);
    }, [auto, tab, tabs.length]);

    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const orbitY = useSpring(useTransform(scrollYProgress, [0, 1], [50, -50]), { stiffness: 80, damping: 22 });
    const orbitScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0.88, 1, 1, 0.94]);

    return (
        <section id="skills" ref={ref} className="section relative overflow-hidden">
            <Backdrop />

            <Container>
                <SectionHeading
                    label="Skills & Technologies"
                    title="Technologies I use to"
                    highlightedText=" turn ideas into products."
                    description="A practical toolkit built through continuous learning, experimentation and real-world projects."
                    align="start"
                />

                <div
                    className="grid items-center gap-12 lg:grid-cols-2"   >
                    <Reveal>
                        <motion.div style={{ y: orbitY, scale: orbitScale }}>
                            <Tilt max={6}>
                                <Orbit tab={tabs[tab]} />
                            </Tilt>
                        </motion.div>
                    </Reveal>

                    <Reveal delay={0.12}>
                        <SkillPanel tabs={tabs} tab={tab} setTab={setTab} auto={auto} duration={AUTO_SECONDS} />
                    </Reveal>
                </div>
            </Container>
        </section>
    );
}