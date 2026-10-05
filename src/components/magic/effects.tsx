"use client";
import { animate, motion } from "motion/react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Light beam travelling around the parent's border. Parent needs `relative` and a radius. */
export function BorderBeam({ duration = 8, delay = 0, from = "var(--gold)", to = "var(--primary)" }: { duration?: number; delay?: number; from?: string; to?: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit] border-[1.5px] border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div className="absolute aspect-square w-40 [offset-path:rect(0_auto_auto_0_round_160px)]" style={{ background: `linear-gradient(to left, ${from}, ${to}, transparent)` }}
        initial={{ offsetDistance: "0%" }} animate={{ offsetDistance: "100%" }} transition={{ repeat: Infinity, ease: "linear", duration, delay: -delay }} />
    </div>
  );
}

/** Meteor shower; deterministic values keep SSR and client markup identical. */
export function Meteors({ count = 14 }: { count?: number }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <motion.span key={i} className="absolute h-px w-16 bg-gradient-to-r from-white/80 to-transparent" style={{ left: `${(i * 37) % 100}%`, top: `${-10 - (i % 4) * 8}%`, rotate: 215 }}
          initial={{ x: 0, y: 0, opacity: 0 }} animate={{ x: -420, y: 420, opacity: [0, 1, 0] }}
          transition={{ duration: 2 + (i % 5) * 0.7, delay: (i * 0.73) % 5, repeat: Infinity, ease: "easeIn" }} />
      ))}
    </div>
  );
}

export function Ripple({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute grid place-items-center", className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div key={i} className="absolute rounded-full border border-primary/40 bg-primary/[0.04]" style={{ width: 180 + i * 110, height: 180 + i * 110 }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.2, 0.7] }} transition={{ duration: 5, delay: i * 0.35, repeat: Infinity, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

type ShimmerProps = { as?: ElementType; className?: string; children: ReactNode } & Record<string, unknown>;
/** Button with a rotating gold light running around its edge. */
export function ShimmerButton({ as: Tag = "button", className, children, ...props }: ShimmerProps) {
  return (
    <Tag className={cn("group relative inline-flex overflow-hidden rounded-full p-[1.5px] font-medium", className)} {...props}>
      <motion.span aria-hidden className="absolute -inset-[200%] [background:conic-gradient(from_0deg,transparent_0_290deg,var(--gold)_360deg)]" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      <span className="relative inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-card-foreground transition-colors group-hover:bg-secondary">{children}</span>
    </Tag>
  );
}

/** Interactive particle network that flees the cursor. */
export function Particles({ count = 60 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, frame = 0, color = "#c53fad", gold = "#f5b942";
    const m = { x: -999, y: -999 };
    const resize = () => { const r = cv.parentElement!.getBoundingClientRect(); const d = window.devicePixelRatio || 1; w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); };
    resize();
    const ps = Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, r: Math.random() * 1.6 + 0.6 }));
    const draw = () => {
      if (frame++ % 90 === 0) { const s = getComputedStyle(document.documentElement); color = s.getPropertyValue("--primary").trim() || color; gold = s.getPropertyValue("--gold").trim() || gold; }
      ctx.clearRect(0, 0, w, h);
      ps.forEach((p, i) => {
        const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy);
        if (d > 0 && d < 140) { p.x += (dx / d) * 1.3; p.y += (dy / d) * 1.3; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.fillStyle = i % 7 === 0 ? gold : color; ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
        for (let j = i + 1; j < ps.length; j++) {
          const q = ps[j], dd = Math.hypot(p.x - q.x, p.y - q.y);
          if (dd < 110) { ctx.globalAlpha = (1 - dd / 110) * 0.28; ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
        }
      });
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    const move = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); m.x = e.clientX - r.left; m.y = e.clientY - r.top; };
    window.addEventListener("pointermove", move); window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("resize", resize); };
  }, [count]);
  return <canvas ref={ref} aria-hidden className="absolute inset-0 size-full" />;
}

/** Items orbiting a centre. `radius` is any CSS length, e.g. "var(--r1)". */
export function OrbitingCircles({ items, radius, duration = 30, reverse = false }: { items: string[]; radius: string; duration?: number; reverse?: boolean }) {
  const dir = reverse ? -360 : 360;
  return (
    <>
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border" style={{ width: `calc(${radius} * 2)`, height: `calc(${radius} * 2)` }} />
      <motion.div className="absolute inset-0" animate={{ rotate: dir }} transition={{ duration, repeat: Infinity, ease: "linear" }}>
        {items.map((t, i) => {
          const a = (360 / items.length) * i;
          return (
            <div key={t} className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%,-50%) rotate(${a}deg) translateX(${radius}) rotate(${-a}deg)` }}>
              <motion.span animate={{ rotate: -dir }} transition={{ duration, repeat: Infinity, ease: "linear" }} className="glass block whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium shadow-lg">{t}</motion.span>
            </div>
          );
        })}
      </motion.div>
    </>
  );
}

const code: [string, string][][] = [
  [["const ", "text-primary"], ["asia", "text-gold"], [" = {", ""]],
  [["  role: ", ""], ['"Full-Stack Developer"', "text-gold-light"], [",", ""]],
  [["  stack: ", ""], ['["Next.js", "TypeScript", "Prisma"]', "text-gold-light"], [",", ""]],
  [["  location: ", ""], ['"Pakistan"', "text-gold-light"], [",", ""]],
  [["  openToWork: ", ""], ["true", "text-primary"], [",", ""]],
  [["};", ""]],
];
const total = code.flat().reduce((a, [t]) => a + t.length, 0);

/** Editor-style window that types itself when scrolled into view. */
export function CodeWindow() {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current!;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      animate(0, total, { duration: 3.2, ease: "linear", onUpdate: (v) => setN(Math.floor(v)) });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  let left = n;
  return (
    <div ref={ref} className="p-6">
      <div className="mb-4 flex gap-1.5"><span className="size-3 rounded-full bg-primary" /><span className="size-3 rounded-full bg-gold" /><span className="size-3 rounded-full bg-muted-foreground/40" /></div>
      <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
        {code.map((line, li) => (
          <div key={li}>{line.map(([t, c], ti) => { const take = Math.max(0, Math.min(left, t.length)); left -= take; return <span key={ti} className={c}>{t.slice(0, take)}</span>; })}
            {li === code.length - 1 && <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-gold" />}</div>
        ))}
      </pre>
    </div>
  );
}
