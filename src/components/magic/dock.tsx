"use client";
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowUp, Mail } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { scrollToTarget } from "@/lib/lenis";
import { profile } from "@/lib/data";
import { GithubIcon, LinkedinIcon } from "../icons";

type Item = { label: string; icon: ReactNode; href?: string; onClick?: () => void };

function DockIcon({ mouseX, item }: { mouseX: MotionValue<number>; item: Item }) {
  const ref = useRef<HTMLDivElement>(null);
  const distance = useTransform(mouseX, (v) => { const b = ref.current?.getBoundingClientRect(); return b ? v - b.x - b.width / 2 : 999; });
  const size = useSpring(useTransform(distance, [-140, 0, 140], [42, 76, 42]), { mass: 0.1, stiffness: 160, damping: 13 });
  const inner = <span className="grid size-full place-items-center">{item.icon}</span>;
  return (
    <motion.div ref={ref} style={{ width: size, height: size }} className="group relative rounded-full bg-muted transition-colors hover:bg-primary/20">
      <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100">{item.label}</span>
      {item.href ? <a href={item.href} aria-label={item.label} className="block size-full" target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{inner}</a> : <button aria-label={item.label} onClick={item.onClick} className="block size-full">{inner}</button>}
    </motion.div>
  );
}

/** Magnifying dock that appears once you scroll past the hero. */
export function FloatingDock() {
  const mouseX = useMotionValue(Infinity);
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setShow(y > 600));
  const items: Item[] = [
    { label: "Back to top", icon: <ArrowUp className="size-1/2" />, onClick: () => scrollToTarget("#top") },
    { label: "GitHub", icon: <GithubIcon className="size-1/2" />, href: profile.github },
    { label: "LinkedIn", icon: <LinkedinIcon className="size-1/2" />, href: profile.linkedin },
    { label: "Email", icon: <Mail className="size-1/2" />, href: `mailto:${profile.email}` },
  ];
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }} className="fixed inset-x-0 bottom-5 z-50 hidden justify-center sm:flex">
          <motion.div onMouseMove={(e) => mouseX.set(e.clientX)} onMouseLeave={() => mouseX.set(Infinity)} className="glass flex h-[68px] items-end gap-3 rounded-2xl px-3 pb-3 shadow-2xl shadow-primary/20">
            {items.map((it) => <DockIcon key={it.label} mouseX={mouseX} item={it} />)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
