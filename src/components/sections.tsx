"use client";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight, Check, Layers, Palette, Rocket, Send, ShieldCheck } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { Counter, Magnetic, Reveal, ScrollFillText, SpotlightCard, SplitText } from "./animations/animations";

import { GithubIcon } from "./icons";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input, Textarea } from "./ui/input";
import { scrollToTarget } from "@/lib/lenis";
import { process as steps, profile, projects, services, skillGroups, stats, timeline } from "@/lib/data";

const icons = { layers: Layers, palette: Palette, shield: ShieldCheck, rocket: Rocket };

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
    return (
        <section id={id} className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl"><SplitText text={title} /></h2>
            {intro && <Reveal delay={0.2}><p className="mt-4 max-w-xl text-lg text-muted-foreground">{intro}</p></Reveal>}
            <div className="mt-14">{children}</div>
        </section>
    );
}

// function Timeline() {
//   const ref = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
//   const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
//   return (
//     <div ref={ref} className="relative mt-20 pl-8">
//       <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border" />
//       <motion.div style={{ scaleY, backgroundImage: "var(--gold-gradient)" }} className="absolute bottom-0 left-[6px] top-0 w-0.5 origin-top" />
//       {timeline.map((t, i) => (
//         <Reveal key={t.title} delay={i * 0.05} className="relative pb-10 last:pb-0">
//           <span className="absolute -left-8 top-1.5 size-4 rounded-full border-2 border-gold bg-background" />
//           <p className="text-sm font-medium text-gold">{t.when}</p>
//           <h3 className="text-xl font-semibold">{t.title}</h3>
//           <p className="text-muted-foreground">{t.text}</p>
//         </Reveal>
//       ))}
//     </div>
//   );
// }

// export function About() {
//   return (
//     <Section id="about" title="About me">
//       <div className="grid gap-5 lg:grid-cols-3">
//         <Reveal className="lg:col-span-2">
//           <SpotlightCard className="h-full p-8 sm:p-10">
//             <ScrollFillText className="text-2xl font-medium leading-snug sm:text-3xl" text="I'm a Computer Science student from Pakistan who learned web development by building real things. I care about the details that make an app feel finished: spacing, typography, motion, accessibility and clear error handling. My goal is to turn an idea into a deployed, polished product." />
//           </SpotlightCard>
//         </Reveal>
//         <Reveal delay={0.1}>
//           <SpotlightCard className="h-full"><div className="relative h-full rounded-3xl"><CodeWindow /><BorderBeam duration={9} /></div></SpotlightCard>
//         </Reveal>
//         {stats.map((s, i) => (
//           <Reveal key={s.label} delay={i * 0.1}>
//             <SpotlightCard className="h-full p-7">
//               <div className="text-6xl font-semibold tracking-tight text-gradient"><Counter to={s.value} suffix={s.suffix} /></div>
//               <p className="mt-2 text-muted-foreground">{s.label}</p>
//             </SpotlightCard>
//           </Reveal>
//         ))}
//       </div>
//       <Timeline />
//     </Section>
//   );
// }

// export function Skills() {
//   const all = skillGroups.flatMap((g) => g.items);
//   return (
//     <>
//       <div className="space-y-4 py-6">
//         {/* <Marquee items={all} />
//         <Marquee items={[...all].reverse()} reverse duration={50} /> */}
//       </div>
//       <Section id="skills" title="What I work with" intro="The tools I use to take a project from an empty folder to production.">
//         <div className="grid items-center gap-12 lg:grid-cols-2">
//           <Reveal>
//             <div className="relative mx-auto h-[360px] w-full max-w-[360px] [--r1:105px] [--r2:165px] sm:h-[500px] sm:max-w-[500px] sm:[--r1:140px] sm:[--r2:230px]">
//               <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-2xl font-semibold text-white shadow-[0_0_80px_color-mix(in_srgb,var(--primary)_60%,transparent)] [background-image:var(--gradient)]">AA</div>
//               <OrbitingCircles items={skillGroups[0].items.slice(0, 4)} radius="var(--r1)" duration={28} />
//               <OrbitingCircles items={[...skillGroups[1].items.slice(0, 3), ...skillGroups[2].items.slice(0, 3)]} radius="var(--r2)" duration={45} reverse />
//             </div>
//           </Reveal>
//           <div className="grid gap-5">
//             {skillGroups.map((g, i) => (
//               <Reveal key={g.title} delay={i * 0.08}>
//                 <SpotlightCard className="p-6">
//                   <h3 className="text-lg font-semibold">{g.title}</h3>
//                   <motion.ul className="mt-4 flex flex-wrap gap-2" initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ staggerChildren: 0.06 }}>
//                     {g.items.map((s) => (
//                       <motion.li key={s} variants={{ hidden: { opacity: 0, scale: 0.7, y: 10 }, show: { opacity: 1, scale: 1, y: 0 } }} whileHover={{ y: -4, scale: 1.06 }}><Badge className="text-foreground">{s}</Badge></motion.li>
//                     ))}
//                   </motion.ul>
//                 </SpotlightCard>
//               </Reveal>
//             ))}
//           </div>
//         </div>
//       </Section>
//     </>
//   );
// }



export function Contact() {
    const [sent, setSent] = useState(false);
    function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const body = `${d.get("message")}\n\nFrom: ${d.get("name")} (${d.get("email")})`;
        window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Project inquiry")}&body=${encodeURIComponent(body)}`;
        setSent(true);
    }
    return (
        <section id="contact" className="relative mx-auto w-full max-w-6xl overflow-hidden px-6 py-24 sm:py-32">
            {/* <Ripple className="-right-40 top-20 hidden size-[700px] lg:grid" /> */}
            <h2 className="relative text-5xl font-semibold leading-[1.05] tracking-tight sm:text-8xl"><SplitText text="Let's build something great." /></h2>
            <Reveal delay={0.2} className="relative">
                <a href={`mailto:${profile.email}`} className="group mt-8 inline-block text-xl sm:text-3xl">
                    <span className="text-gradient">{profile.email}</span>
                    <span className="block h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
                </a>
            </Reveal>
            <Reveal delay={0.3} className="relative">
                <form onSubmit={submit} className="mt-14 grid max-w-2xl gap-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <Input required name="name" placeholder="Your name" aria-label="Your name" />
                        <Input required type="email" name="email" placeholder="Your email" aria-label="Your email" />
                    </div>
                    <Textarea required name="message" rows={4} placeholder="Tell me about your project" aria-label="Message" />
                    <div><Magnetic><Button variant="gold" className="px-8 py-4 font-semibold">{sent ? <><Check className="size-4" /> Opening your email app</> : <>Send message <Send className="size-4" /></>}</Button></Magnetic></div>
                </form>
            </Reveal>
        </section>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-border px-6 pb-28 pt-10 sm:pb-32">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
                <p>© {new Date().getFullYear()} {profile.name}. Built with Next.js, shadcn and Motion.</p>
                <button onClick={() => scrollToTarget("#top")} className="hover:text-gold">Back to top</button>
            </div>
        </footer>
    );
}
