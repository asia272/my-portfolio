"use client";
import { animate, motion, useInView, useMotionTemplate, useMotionValue, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;
/** Seconds the preloader takes; hero animations start after it. */
export const INTRO = 2.7;



export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40, filter: "blur(10px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.9, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

/** Per-letter rise. Pass `now` for above-the-fold text, otherwise it triggers on scroll. */
export function SplitText({ text, className, delay = 0, now = false }: { text: string; className?: string; delay?: number; now?: boolean }) {
  let n = 0;
  const trigger = now ? { animate: "show" } : { whileInView: "show", viewport: { once: true, margin: "-60px" } };
  return (
    <motion.span className={className} aria-label={text} initial="hidden" {...trigger} transition={{ staggerChildren: 0.035, delayChildren: delay }}>
      {text.split(" ").map((w, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap pr-[0.28em] [perspective:600px]">
          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            {w.split("").map((c) => (
              <motion.span key={n++} className="inline-block origin-bottom" variants={{ hidden: { y: "115%", rotateX: -70, opacity: 0 }, show: { y: 0, rotateX: 0, opacity: 1, transition: { duration: 1, ease: EASE } } }}>
                {c}
              </motion.span>
            ))}
          </span>
        </span>
      ))}
    </motion.span>
  );
}

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">{children}</motion.span>;
}

/** Words light up as you scroll past them. */
export function ScrollFillText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>)}
    </p>
  );
}

export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 15 });
  return (
    <motion.div ref={ref} style={{ x, y }} className="inline-block" whileTap={{ scale: 0.95 }}
      onMouseMove={(e) => { const r = ref.current!.getBoundingClientRect(); x.set((e.clientX - r.left - r.width / 2) * strength); y.set((e.clientY - r.top - r.height / 2) * strength); }}
      onMouseLeave={() => { x.set(0); y.set(0); }}>
      {children}
    </motion.div>
  );
}

/** Card with a glow that follows the pointer. */
export function SpotlightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const background = useMotionTemplate`radial-gradient(300px circle at ${x}px ${y}px, color-mix(in srgb, var(--primary) 24%, transparent), transparent 70%)`;
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - r.left); y.set(e.clientY - r.top); }}
      className={`group relative overflow-hidden rounded-3xl border border-border bg-card ${className}`}>
      <motion.div aria-hidden style={{ background }} className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}

export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/** Infinite marquee that skews with scroll velocity. */
// export function Marquee({ items, reverse = false, duration = 40 }: { items: string[]; reverse?: boolean; duration?: number }) {
//   const { scrollY } = useScroll();
//   const velocity = useSpring(useVelocity(scrollY), { stiffness: 60, damping: 30 });
//   const skewX = useTransform(velocity, [-2500, 2500], [-8, 8]);
//   const row = [...items, ...items];
//   return (
//     <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
//       <motion.div style={{ skewX }}>
//         <motion.div className="flex w-max gap-4 py-2" animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }} transition={{ duration, ease: "linear", repeat: Infinity }}>
//           {row.map((t, i) => (
//             <span key={i} className="flex items-center gap-3 rounded-full border border-border bg-card px-6 py-3 text-lg font-medium sm:text-xl">
//               <span className="size-2 rounded-full bg-gold" />{t}
//             </span>
//           ))}
//         </motion.div>
//       </motion.div>
//     </div>
//   );
// }
