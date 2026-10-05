"use client";

import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();

    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 30,
    });

    return (
        <motion.div
            style={{
                scaleX,
                backgroundImage: "var(--gold-gradient)",
            }}
            className="fixed inset-x-0 top-0 z-[90] h-[3px] origin-left"
        />
    );
}