"use client";

import {
    motion,
    useMotionValue,
    useSpring,
} from "motion/react";
import { useEffect, useState } from "react";

export default function Cursor() {
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);

    const dx = useSpring(x, {
        stiffness: 900,
        damping: 45,
    });

    const dy = useSpring(y, {
        stiffness: 900,
        damping: 45,
    });

    const rx = useSpring(x, {
        stiffness: 140,
        damping: 16,
    });

    const ry = useSpring(y, {
        stiffness: 140,
        damping: 16,
    });

    const [hover, setHover] = useState(false);

    useEffect(() => {
        document.body.classList.add("has-cursor");

        const move = (e: PointerEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);

            setHover(
                !!(e.target as Element).closest?.(
                    "a,button,input,textarea,[data-cursor]"
                )
            );
        };

        window.addEventListener("pointermove", move);

        return () => {
            window.removeEventListener("pointermove", move);
            document.body.classList.remove("has-cursor");
        };
    }, [x, y]);

    const show =
        "hidden [@media(hover:hover)_and_(pointer:fine)]:block";

    return (
        <>
            {/* Outer cursor */}
            <motion.div
                aria-hidden
                style={{
                    x: rx,
                    y: ry,
                }}
                animate={{
                    scale: hover ? 1.9 : 1,
                }}
                className={`pointer-events-none fixed left-0 top-0 z-[95] -ml-5 -mt-5 size-10 rounded-full border border-gold ${show}`}
            />

            {/* Cursor center dot */}
            <motion.div
                aria-hidden
                style={{
                    x: dx,
                    y: dy,
                }}
                className={`pointer-events-none fixed left-0 top-0 z-[95] -ml-1 -mt-1 size-2 rounded-full bg-gold ${show}`}
            />
        </>
    );
}