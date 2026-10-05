"use client";

import { useRef } from "react";

import { useMotionValue } from "motion/react";

import { Particles } from "../magic/effects";
import HeroContent from "./HeroContent";

export function Hero() {
  const ref = useRef<HTMLElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);



  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={(e) => {
        mx.set(
          e.clientX / window.innerWidth - 0.5
        );

        my.set(
          e.clientY / window.innerHeight - 0.5
        );
      }}
      className="relative flex min-h-svh items-center overflow-hidden px-6"
    >
      <Particles />

      <HeroContent />
    </section>
  );
}