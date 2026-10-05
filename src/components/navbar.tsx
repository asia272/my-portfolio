"use client";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { scrollToTarget } from "@/lib/lenis";
import { EASE, INTRO } from "./animations";

const links = [["About", "about"], ["Skills", "skills"], ["Projects", "projects"], ["Services", "services"], ["Contact", "contact"]];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState("");
  const { resolvedTheme, setTheme } = useTheme();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 200 && !open);
  });
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(([, id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  const go = (e: React.MouseEvent, id: string) => { e.preventDefault(); setOpen(false); scrollToTarget(`#${id}`); };
  return (
    <motion.header initial={{ y: -100, opacity: 0 }} animate={{ y: hidden ? -100 : 0, opacity: 1 }} transition={{ duration: 0.7, ease: EASE }}
      className="fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-3xl">
      <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: INTRO }} className="glass flex items-center justify-between rounded-full px-4 py-2 shadow-2xl shadow-primary/10">
        <a href="#top" onClick={(e) => go(e, "top")} className="px-2 font-semibold tracking-tight">Asia<span className="text-gold">.</span></a>
        <ul className="hidden gap-1 md:flex">
          {links.map(([l, id]) => (
            <li key={id}>
              <a href={`#${id}`} onClick={(e) => go(e, id)} className="relative block rounded-full px-4 py-2 text-sm">
                {active === id && <motion.span layoutId="nav-pill" transition={{ type: "spring", stiffness: 380, damping: 30 }} className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-primary/40" />}
                <span className={`relative transition-colors ${active === id ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{l}</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <motion.button whileTap={{ rotate: 180, scale: 0.85 }} aria-label="Toggle theme" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="grid size-9 place-items-center rounded-full hover:bg-muted">
            <Sun className="size-4 dark:hidden" /><Moon className="hidden size-4 dark:block" />
          </motion.button>
          <button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} className="grid size-9 place-items-center rounded-full hover:bg-muted md:hidden">{open ? <X className="size-4" /> : <Menu className="size-4" />}</button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {open && (
          <motion.ul initial={{ opacity: 0, y: -12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.96 }} className="glass mt-2 rounded-3xl p-3 md:hidden">
            {links.map(([l, id], i) => (
              <motion.li key={id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <a href={`#${id}`} onClick={(e) => go(e, id)} className="block rounded-2xl px-4 py-3 text-lg hover:bg-muted">{l}</a>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
