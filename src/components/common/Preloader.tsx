"use client";

import {
    AnimatePresence,
    animate,
    motion,
} from "motion/react";
import { useEffect, useState } from "react";

import { INTRO } from "../animations/animations";

export default function Preloader() {
    const [done, setDone] = useState(false);
    const [n, setN] = useState(0);

    useEffect(() => {
        const c = animate(0, 100, {
            duration: INTRO - 1,
            ease: [0.65, 0, 0.35, 1],
            onUpdate: (v) => setN(Math.round(v)),
            onComplete: () =>
                setTimeout(() => setDone(true), 200),
        });

        return () => c.stop();
    }, []);

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    exit={{ y: "-100%" }}
                    transition={{
                        duration: 0.9,
                        ease: [0.76, 0, 0.24, 1],
                    }}
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background"
                >
                    <div className="flex overflow-hidden text-4xl font-semibold tracking-tight sm:text-6xl">
                        {"Asia Ashraf".split("").map((c, i) => (
                            <motion.span
                                key={i}
                                initial={{ y: "110%" }}
                                animate={{ y: 0 }}
                                transition={{
                                    delay: 0.1 + i * 0.05,
                                    duration: 0.8,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="inline-block"
                            >
                                {c === " " ? "\u00A0" : c}
                            </motion.span>
                        ))}
                    </div>

                    <div className="h-px w-56 overflow-hidden bg-border">
                        <motion.div
                            style={{
                                width: `${n}%`,
                                backgroundImage: "var(--gold-gradient)",
                            }}
                            className="h-full"
                        />
                    </div>

                    <span className="text-sm tabular-nums text-muted-foreground">
                        {n}%
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}