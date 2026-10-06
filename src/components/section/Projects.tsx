"use client";
import { useRef } from "react";
import SectionHeading from "../common/SectionHeading";
import { projects } from "@/lib/data";
import Container from "../common/Container";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Badge } from "../ui/badge";
import { ArrowUpRight } from "lucide-react";
import { GithubIcon } from "../icons";

export function ScrollBand() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const x1 = useTransform(scrollYProgress, [0, 1], ["8%", "-40%"]);
    const x2 = useTransform(scrollYProgress, [0, 1], ["-40%", "8%"]);
    return (
        <div ref={ref} aria-hidden className="select-none overflow-hidden py-10">
            <motion.p style={{ x: x1 }} className="whitespace-nowrap text-7xl font-semibold tracking-tight text-transparent [-webkit-text-stroke:1px_var(--primary)] sm:text-9xl">Design. Build. Ship. Repeat. Design. Build.</motion.p>
            <motion.p style={{ x: x2 }} className="whitespace-nowrap text-7xl font-semibold tracking-tight text-gradient sm:text-9xl">Next.js. React. TypeScript. Next.js. React.</motion.p>
        </div>
    );
}

function ProjectCard({ p, i, n, progress }: { p: (typeof projects)[number]; i: number; n: number; progress: MotionValue<number> }) {
    const scale = useTransform(progress, [i / n, 1], [1, 1 - (n - 1 - i) * 0.045]);
    const gold = i % 2 === 1;
    return (
        <div className="sticky" style={{ top: `calc(5.5rem + ${i * 1.1}rem)` }}>
            <motion.article style={{ scale, transformOrigin: "top center" }} className="group relative grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-primary/10 md:grid-cols-2">
                <div className="flex flex-col p-8 sm:p-10">
                    <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{p.title}</h3>
                    <p className="mt-3 text-muted-foreground">{p.description}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">{p.tags.map((t) => <li key={t}><Badge>{t}</Badge></li>)}</ul>
                    <div className="mt-auto flex items-center gap-6 pt-8 text-sm font-medium">
                        <a href={p.live} className="inline-flex items-center gap-1 text-gold">Live demo <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
                        <a href={p.repo} className="inline-flex items-center gap-1.5 hover:text-gold"><GithubIcon className="size-4" /> Source</a>
                    </div>
                </div>
                <div className="relative min-h-60 overflow-hidden" style={{ backgroundImage: gold ? "var(--gold-gradient)" : "var(--gradient)" }}>
                    {/* <Meteors count={10} /> */}
                    <motion.div whileHover={{ y: -8, rotate: -1.5 }} className="absolute inset-7 rounded-2xl bg-background/90 p-4 shadow-2xl backdrop-blur">
                        <div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-primary" /><span className="size-2.5 rounded-full bg-gold" /><span className="size-2.5 rounded-full bg-muted-foreground/40" /></div>
                        <div className="mt-5 space-y-3">
                            {[80, 55, 70, 40].map((w, k) => <motion.div key={k} animate={{ opacity: [0.35, 0.9, 0.35] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.3 }} style={{ width: `${w}%` }} className="h-3 rounded-full bg-muted" />)}
                            <div className="grid grid-cols-3 gap-3 pt-2">{[0, 1, 2].map((k) => <motion.div key={k} animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: k * 0.4 }} className="h-14 rounded-xl bg-secondary" />)}</div>
                        </div>
                    </motion.div>
                </div>

            </motion.article>
        </div>
    );
}

export default function Projects() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
    return (
        <section id="projects">

            <Container>
                <SectionHeading
                    label="Selected Work"
                    title="Projects that"
                    highlightedText="show the work"
                    description="A selection of full-stack and web projects I've built to solve real problems, explore modern technologies, and continuously sharpen my engineering skills."
                />


                <div ref={ref} className="flex flex-col gap-16 pb-16">
                    {projects.map((p, i) => <ProjectCard key={p.title} p={p} i={i} n={projects.length} progress={scrollYProgress} />)}
                </div>
            </Container>

        </section>
    );
}
