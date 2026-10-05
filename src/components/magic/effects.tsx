"use client";
import { animate, motion } from "motion/react";
import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";






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
