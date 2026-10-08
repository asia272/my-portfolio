
"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

import { PROCESS, SERVICES } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import { Reveal, SpotlightCard } from "../animations/animations";
import SectionHeading from "../common/SectionHeading";
import Container from "../common/Container";

const EASE = [0.22, 1, 0.36, 1] as const;

function ProcessTimelineLine() {
    const lineRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(lineRef, {
        once: false,
        margin: "-100px",
    });

    return (
        <div
            ref={lineRef}
            aria-hidden
            className="pointer-events-none absolute top-7 right-[12.5%] left-[12.5%] hidden h-px lg:block"
        >
            {/* Base line */}


            {/* Animated line */}
            <motion.div
                className="absolute inset-y-0 left-0 w-full origin-left bg-primary"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={
                    isInView
                        ? {
                            scaleX: 1,
                            opacity: 1,
                        }
                        : {
                            scaleX: 0,
                            opacity: 0,
                        }
                }
                transition={{
                    scaleX: {
                        duration: 1.6,
                        ease: EASE,
                    },
                    opacity: {
                        duration: 0.35,
                        ease: "easeOut",
                    },
                }}
            />

            {/* Moving highlight */}
            {/* <motion.div
                className="absolute top-1/2 left-0 h-[3px] w-20 -translate-y-1/2 rounded-full bg-gold"
                initial={{
                    x: "-100%",
                    opacity: 0,
                }}
                animate={
                    isInView
                        ? {
                            x: ["-100%", "calc(100% - 5rem)"],
                            opacity: [0, 1, 0],
                        }
                        : {
                            x: "-100%",
                            opacity: 0,
                        }
                }
                transition={{
                    duration: 1.8,
                    delay: 1.05,
                    ease: "easeInOut",
                }}
            /> */}
        </div>
    );
}

export function Services() {
    return (
        <section id="services" className="section bg-secondary/40">
            <Container>
                <SectionHeading
                    label="Services"
                    title="How I can"
                    highlightedText="help you"
                    description="From a single polished interface to a complete product, built with care."
                />

                {/* Services */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {SERVICES.map((service, index) => (
                        <Reveal
                            key={service.title}
                            delay={0.08 * index}
                            className="h-full"
                        >
                            <SpotlightCard className="h-full p-6">
                                <motion.span
                                    className="grid size-12 place-items-center rounded-2xl bg-[image:var(--gold-gradient)] text-[#1b1305] shadow-lg shadow-gold/30"
                                    whileHover={{
                                        scale: 1.06,
                                        rotate: -3,
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 320,
                                        damping: 18,
                                    }}
                                >
                                    <Icon
                                        name={service.icon}
                                        className="size-6"
                                    />
                                </motion.span>

                                <h3 className="mt-5 text-lg font-semibold">
                                    {service.title}
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                    {service.description}
                                </p>
                            </SpotlightCard>
                        </Reveal>
                    ))}
                </div>

                {/* Process */}
                <div className="mt-20">
                    <Reveal>
                        <h3 className="mb-10 text-center text-2xl font-bold sm:text-3xl">
                            My{" "}
                            <span className="text-gradient">
                                process
                            </span>
                        </h3>
                    </Reveal>

                    <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Animated connecting timeline */}
                        <ProcessTimelineLine />

                        {PROCESS.map((step, index) => (
                            <li
                                key={step.title}
                                className="relative text-center"
                            >
                                <Reveal delay={0.15 + 0.12 * index}>
                                    {/* Number */}
                                    <motion.span
                                        className="relative z-10 mx-auto grid size-14 place-items-center rounded-full border border-primary/40 bg-background text-lg font-bold text-gold ring-8 ring-secondary/40"
                                        initial={{
                                            opacity: 0,
                                            scale: 0.7,
                                            y: 10,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            scale: 1,
                                            y: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                            margin: "-80px",
                                        }}
                                        transition={{
                                            duration: 0.65,
                                            delay:
                                                0.25 +
                                                0.14 * index,
                                            ease: EASE,
                                        }}
                                        whileHover={{
                                            scale: 1.08,
                                        }}
                                    >
                                        {index + 1}
                                    </motion.span>

                                    <motion.h4
                                        className="mt-4 font-semibold"
                                        initial={{
                                            opacity: 0,
                                            y: 12,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                            margin: "-80px",
                                        }}
                                        transition={{
                                            duration: 0.65,
                                            delay:
                                                0.35 +
                                                0.14 * index,
                                            ease: EASE,
                                        }}
                                    >
                                        {step.title}
                                    </motion.h4>

                                    <motion.p
                                        className="mx-auto mt-1.5 max-w-[16rem] text-sm leading-relaxed text-muted-foreground"
                                        initial={{
                                            opacity: 0,
                                            y: 10,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                            margin: "-80px",
                                        }}
                                        transition={{
                                            duration: 0.65,
                                            delay:
                                                0.45 +
                                                0.14 * index,
                                            ease: EASE,
                                        }}
                                    >
                                        {step.description}
                                    </motion.p>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </Container>
        </section>
    );
}