// "use client";
// import { motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
// import { ArrowUpRight, Check, Layers, Palette, Rocket, Send, ShieldCheck } from "lucide-react";
// import { useRef, useState, type ReactNode } from "react";
// import { Counter, Magnetic, Reveal, ScrollFillText, SpotlightCard, SplitText } from "./animations";
// import { BorderBeam, CodeWindow, Meteors, OrbitingCircles, Ripple } from "./magic/effects";
// import { GithubIcon } from "./icons";
// import { Badge } from "./ui/badge";
// import { Button } from "./ui/button";
// import { Input, Textarea } from "./ui/input";
// import { scrollToTarget } from "@/lib/lenis";
// import { process as steps, profile, projects, services, skillGroups, stats, timeline } from "@/lib/data";

// const icons = { layers: Layers, palette: Palette, shield: ShieldCheck, rocket: Rocket };

// function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
//   return (
//     <section id={id} className="mx-auto w-full max-w-6xl px-6 py-24 sm:py-32">
//       <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl"><SplitText text={title} /></h2>
//       {intro && <Reveal delay={0.2}><p className="mt-4 max-w-xl text-lg text-muted-foreground">{intro}</p></Reveal>}
//       <div className="mt-14">{children}</div>
//     </section>
//   );
// }

// // function Timeline() {
// //   const ref = useRef<HTMLDivElement>(null);
// //   const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
// //   const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
// //   return (
// //     <div ref={ref} className="relative mt-20 pl-8">
// //       <div className="absolute bottom-0 left-[7px] top-0 w-px bg-border" />
// //       <motion.div style={{ scaleY, backgroundImage: "var(--gold-gradient)" }} className="absolute bottom-0 left-[6px] top-0 w-0.5 origin-top" />
// //       {timeline.map((t, i) => (
// //         <Reveal key={t.title} delay={i * 0.05} className="relative pb-10 last:pb-0">
// //           <span className="absolute -left-8 top-1.5 size-4 rounded-full border-2 border-gold bg-background" />
// //           <p className="text-sm font-medium text-gold">{t.when}</p>
// //           <h3 className="text-xl font-semibold">{t.title}</h3>
// //           <p className="text-muted-foreground">{t.text}</p>
// //         </Reveal>
// //       ))}
// //     </div>
// //   );
// // }

// // export function About() {
// //   return (
// //     <Section id="about" title="About me">
// //       <div className="grid gap-5 lg:grid-cols-3">
// //         <Reveal className="lg:col-span-2">
// //           <SpotlightCard className="h-full p-8 sm:p-10">
// //             <ScrollFillText className="text-2xl font-medium leading-snug sm:text-3xl" text="I'm a Computer Science student from Pakistan who learned web development by building real things. I care about the details that make an app feel finished: spacing, typography, motion, accessibility and clear error handling. My goal is to turn an idea into a deployed, polished product." />
// //           </SpotlightCard>
// //         </Reveal>
// //         <Reveal delay={0.1}>
// //           <SpotlightCard className="h-full"><div className="relative h-full rounded-3xl"><CodeWindow /><BorderBeam duration={9} /></div></SpotlightCard>
// //         </Reveal>
// //         {stats.map((s, i) => (
// //           <Reveal key={s.label} delay={i * 0.1}>
// //             <SpotlightCard className="h-full p-7">
// //               <div className="text-6xl font-semibold tracking-tight text-gradient"><Counter to={s.value} suffix={s.suffix} /></div>
// //               <p className="mt-2 text-muted-foreground">{s.label}</p>
// //             </SpotlightCard>
// //           </Reveal>
// //         ))}
// //       </div>
// //       <Timeline />
// //     </Section>
// //   );
// // }

// // export function Skills() {
// //   const all = skillGroups.flatMap((g) => g.items);
// //   return (
// //     <>
// //       <div className="space-y-4 py-6">
// //         {/* <Marquee items={all} />
// //         <Marquee items={[...all].reverse()} reverse duration={50} /> */}
// //       </div>
// //       <Section id="skills" title="What I work with" intro="The tools I use to take a project from an empty folder to production.">
// //         <div className="grid items-center gap-12 lg:grid-cols-2">
// //           <Reveal>
// //             <div className="relative mx-auto h-[360px] w-full max-w-[360px] [--r1:105px] [--r2:165px] sm:h-[500px] sm:max-w-[500px] sm:[--r1:140px] sm:[--r2:230px]">
// //               <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-2xl font-semibold text-white shadow-[0_0_80px_color-mix(in_srgb,var(--primary)_60%,transparent)] [background-image:var(--gradient)]">AA</div>
// //               <OrbitingCircles items={skillGroups[0].items.slice(0, 4)} radius="var(--r1)" duration={28} />
// //               <OrbitingCircles items={[...skillGroups[1].items.slice(0, 3), ...skillGroups[2].items.slice(0, 3)]} radius="var(--r2)" duration={45} reverse />
// //             </div>
// //           </Reveal>
// //           <div className="grid gap-5">
// //             {skillGroups.map((g, i) => (
// //               <Reveal key={g.title} delay={i * 0.08}>
// //                 <SpotlightCard className="p-6">
// //                   <h3 className="text-lg font-semibold">{g.title}</h3>
// //                   <motion.ul className="mt-4 flex flex-wrap gap-2" initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ staggerChildren: 0.06 }}>
// //                     {g.items.map((s) => (
// //                       <motion.li key={s} variants={{ hidden: { opacity: 0, scale: 0.7, y: 10 }, show: { opacity: 1, scale: 1, y: 0 } }} whileHover={{ y: -4, scale: 1.06 }}><Badge className="text-foreground">{s}</Badge></motion.li>
// //                     ))}
// //                   </motion.ul>
// //                 </SpotlightCard>
// //               </Reveal>
// //             ))}
// //           </div>
// //         </div>
// //       </Section>
// //     </>
// //   );
// // }

// export function ScrollBand() {
//   const ref = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
//   const x1 = useTransform(scrollYProgress, [0, 1], ["8%", "-40%"]);
//   const x2 = useTransform(scrollYProgress, [0, 1], ["-40%", "8%"]);
//   return (
//     <div ref={ref} aria-hidden className="select-none overflow-hidden py-10">
//       <motion.p style={{ x: x1 }} className="whitespace-nowrap text-7xl font-semibold tracking-tight text-transparent [-webkit-text-stroke:1px_var(--primary)] sm:text-9xl">Design. Build. Ship. Repeat. Design. Build.</motion.p>
//       <motion.p style={{ x: x2 }} className="whitespace-nowrap text-7xl font-semibold tracking-tight text-gradient sm:text-9xl">Next.js. React. TypeScript. Next.js. React.</motion.p>
//     </div>
//   );
// }

// function ProjectCard({ p, i, n, progress }: { p: (typeof projects)[number]; i: number; n: number; progress: MotionValue<number> }) {
//   const scale = useTransform(progress, [i / n, 1], [1, 1 - (n - 1 - i) * 0.045]);
//   const gold = i % 2 === 1;
//   return (
//     <div className="sticky" style={{ top: `calc(5.5rem + ${i * 1.1}rem)` }}>
//       <motion.article style={{ scale, transformOrigin: "top center" }} className="group relative grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl shadow-primary/10 md:grid-cols-2">
//         <div className="flex flex-col p-8 sm:p-10">
//           <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{p.title}</h3>
//           <p className="mt-3 text-muted-foreground">{p.description}</p>
//           <ul className="mt-5 flex flex-wrap gap-2">{p.tags.map((t) => <li key={t}><Badge>{t}</Badge></li>)}</ul>
//           <div className="mt-auto flex items-center gap-6 pt-8 text-sm font-medium">
//             <a href={p.live} className="inline-flex items-center gap-1 text-gold">Live demo <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
//             <a href={p.repo} className="inline-flex items-center gap-1.5 hover:text-gold"><GithubIcon className="size-4" /> Source</a>
//           </div>
//         </div>
//         <div className="relative min-h-60 overflow-hidden" style={{ backgroundImage: gold ? "var(--gold-gradient)" : "var(--gradient)" }}>
//           <Meteors count={10} />
//           <motion.div whileHover={{ y: -8, rotate: -1.5 }} className="absolute inset-7 rounded-2xl bg-background/90 p-4 shadow-2xl backdrop-blur">
//             <div className="flex gap-1.5"><span className="size-2.5 rounded-full bg-primary" /><span className="size-2.5 rounded-full bg-gold" /><span className="size-2.5 rounded-full bg-muted-foreground/40" /></div>
//             <div className="mt-5 space-y-3">
//               {[80, 55, 70, 40].map((w, k) => <motion.div key={k} animate={{ opacity: [0.35, 0.9, 0.35] }} transition={{ duration: 2.4, repeat: Infinity, delay: k * 0.3 }} style={{ width: `${w}%` }} className="h-3 rounded-full bg-muted" />)}
//               <div className="grid grid-cols-3 gap-3 pt-2">{[0, 1, 2].map((k) => <motion.div key={k} animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, delay: k * 0.4 }} className="h-14 rounded-xl bg-secondary" />)}</div>
//             </div>
//           </motion.div>
//         </div>
//         <BorderBeam duration={10} delay={i * 2} />
//       </motion.article>
//     </div>
//   );
// }

// export function Projects() {
//   const ref = useRef<HTMLDivElement>(null);
//   const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
//   return (
//     <Section id="projects" title="Selected projects" intro="Full-stack builds with authentication, databases and payments.">
//       <div ref={ref} className="flex flex-col gap-16 pb-16">
//         {projects.map((p, i) => <ProjectCard key={p.title} p={p} i={i} n={projects.length} progress={scrollYProgress} />)}
//       </div>
//     </Section>
//   );
// }

// export function Process() {
//   return (
//     <Section id="process" title="How I work" intro="A simple process so you always know what happens next.">
//       <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
//         {steps.map((s, i) => (
//           <Reveal key={s.title} delay={i * 0.1}>
//             <SpotlightCard className="h-full p-7">
//               <span className="text-6xl font-semibold text-transparent [-webkit-text-stroke:1px_var(--gold)]">{i + 1}</span>
//               <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
//               <p className="mt-2 text-muted-foreground">{s.text}</p>
//             </SpotlightCard>
//           </Reveal>
//         ))}
//       </div>
//     </Section>
//   );
// }

// export function Services() {
//   return (
//     <Section id="services" title="How I can help">
//       <div className="grid gap-5 sm:grid-cols-2">
//         {services.map((s, i) => {
//           const Icon = icons[s.icon];
//           return (
//             <Reveal key={s.title} delay={i * 0.08}>
//               <SpotlightCard className="h-full p-8">
//                 <motion.div whileHover={{ rotate: 12, scale: 1.12 }} className="mb-5 grid size-14 place-items-center rounded-2xl bg-gold/15 text-gold"><Icon className="size-7" /></motion.div>
//                 <h3 className="text-xl font-semibold">{s.title}</h3>
//                 <p className="mt-2 text-muted-foreground">{s.text}</p>
//               </SpotlightCard>
//             </Reveal>
//           );
//         })}
//       </div>
//     </Section>
//   );
// }

// export function Contact() {
//   const [sent, setSent] = useState(false);
//   function submit(e: React.FormEvent<HTMLFormElement>) {
//     e.preventDefault();
//     const d = new FormData(e.currentTarget);
//     const body = `${d.get("message")}\n\nFrom: ${d.get("name")} (${d.get("email")})`;
//     window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent("Project inquiry")}&body=${encodeURIComponent(body)}`;
//     setSent(true);
//   }
//   return (
//     <section id="contact" className="relative mx-auto w-full max-w-6xl overflow-hidden px-6 py-24 sm:py-32">
//       <Ripple className="-right-40 top-20 hidden size-[700px] lg:grid" />
//       <h2 className="relative text-5xl font-semibold leading-[1.05] tracking-tight sm:text-8xl"><SplitText text="Let's build something great." /></h2>
//       <Reveal delay={0.2} className="relative">
//         <a href={`mailto:${profile.email}`} className="group mt-8 inline-block text-xl sm:text-3xl">
//           <span className="text-gradient">{profile.email}</span>
//           <span className="block h-px origin-left scale-x-0 bg-gold transition-transform duration-500 group-hover:scale-x-100" />
//         </a>
//       </Reveal>
//       <Reveal delay={0.3} className="relative">
//         <form onSubmit={submit} className="mt-14 grid max-w-2xl gap-6">
//           <div className="grid gap-6 sm:grid-cols-2">
//             <Input required name="name" placeholder="Your name" aria-label="Your name" />
//             <Input required type="email" name="email" placeholder="Your email" aria-label="Your email" />
//           </div>
//           <Textarea required name="message" rows={4} placeholder="Tell me about your project" aria-label="Message" />
//           <div><Magnetic><Button variant="gold" className="px-8 py-4 font-semibold">{sent ? <><Check className="size-4" /> Opening your email app</> : <>Send message <Send className="size-4" /></>}</Button></Magnetic></div>
//         </form>
//       </Reveal>
//     </section>
//   );
// }

// export function Footer() {
//   return (
//     <footer className="border-t border-border px-6 pb-28 pt-10 sm:pb-32">
//       <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
//         <p>© {new Date().getFullYear()} {profile.name}. Built with Next.js, shadcn and Motion.</p>
//         <button onClick={() => scrollToTarget("#top")} className="hover:text-gold">Back to top</button>
//       </div>
//     </footer>
//   );
// }
