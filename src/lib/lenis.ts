import type Lenis from "lenis";
let instance: Lenis | null = null;
export const setLenis = (l: Lenis | null) => { instance = l; };
export function scrollToTarget(target: string) {
  if (instance) instance.scrollTo(target, { offset: -70, duration: 1.4 });
  else document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
}
