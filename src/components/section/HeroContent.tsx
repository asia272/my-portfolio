"use client";

import React from "react";
import {
    motion,

    type MotionValue,
} from "motion/react";
import Container from "../common/Container";
import { Typewriter } from "react-simple-typewriter";
import Link from "next/link";
import {
    ArrowDown,
    ArrowUpRight,
    CheckCircle2,
    Code2,
    Sparkles,
} from "lucide-react";
import Image from "next/image";




const HeroContent = () => {


    return (

        <Container>
            <div
                className="
                        grid
                        items-center
                        gap-16
                        py-16
                        sm:py-20
                        lg:grid-cols-[1.03fr_0.97fr]
                        lg:gap-14
                        lg:py-24
                        xl:gap-20
                    "
            >
                {/* =====================================================
                            LEFT — CONTENT
                        ===================================================== */}

                <div
                    className="relative z-10 max-w-3xl"
                    data-aos="fade-right"
                    data-aos-duration="900"
                    data-aos-offset="80"
                >
                    {/* Status */}
                    <div
                        className="
                                mb-7
                                inline-flex
                                items-center
                                gap-2.5
                                rounded-full
                                border
                                border-primary/20
                                bg-primary/[0.045]
                                px-3.5
                                py-2
                                text-xs
                                font-medium
                                text-primary
                                shadow-sm
                                shadow-primary/5
                                backdrop-blur-xl
                            "
                    >
                        <span className="relative flex size-2">
                            <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-50" />
                            <span className="relative size-2 rounded-full bg-primary" />
                        </span>

                        Available for freelance work
                    </div>

                    {/* Intro */}
                    <p
                        className="
                                mb-4
                                text-sm
                                font-medium
                                tracking-wide
                                text-muted-foreground
                            "
                    >
                        <i className="text-gold">
                            Full-Stack NextJs Developer,
                        </i>
                    </p>

                    <h1
                        className="
                                text-4xl
                                font-medium
                                leading-tight
                                tracking-tight
                                sm:text-5xl
                                lg:text-6xl
                            "
                    >
                        Asia Ashraf
                    </h1>

                    {/* Heading */}
                    <h2
                        id="hero-title"
                        className="
                                mt-3
                                text-2xl
                                font-medium
                                leading-tight
                                tracking-tight
                                sm:text-3xl
                                lg:text-[2.15rem]
                            "
                    >
                        I&apos;m a{" "}
                        <span className="text-primary">
                            <Typewriter
                                words={[
                                    "Full-Stack Developer",
                                    "Next.js Developer",
                                    "Web Developer",
                                ]}
                                loop={true}
                                cursor
                                cursorStyle="|"
                                typeSpeed={100}
                                deleteSpeed={50}
                                delaySpeed={1500}
                            />
                        </span>
                    </h2>

                    {/* Description */}
                    <p
                        className="
                                mt-7
                                max-w-2xl
                                text-base
                                leading-8
                                text-muted-foreground
                                sm:text-lg
                            "
                    >
                        I&apos;m a full-stack web developer focused on
                        creating polished, responsive and scalable
                        experiences with Next.js, React and TypeScript.
                    </p>

                    {/* CTA */}
                    <div
                        className="
                                mt-8
                                flex
                                flex-col
                                gap-3
                                sm:flex-row
                            "
                    >
                        <Link
                            href="/projects"
                            className="custom-btn"
                        >
                            View my work
                            <ArrowUpRight className="size-4" />
                        </Link>

                        <Link
                            href="/contact"
                            className="
                                    group
                                    custom-btn-outline
                                "
                        >
                            Let&apos;s work together

                            <ArrowUpRight
                                className="
                                        size-4
                                        opacity-50
                                        transition-all
                                        duration-300
                                        group-hover:translate-x-0.5
                                        group-hover:-translate-y-0.5
                                        group-hover:opacity-100
                                    "
                            />
                        </Link>
                    </div>

                    {/* =================================================
                                TRUST / SPECIALIZATION
                            ================================================= */}

                    <div
                        className="
                                mt-10
                                flex
                                flex-wrap
                                items-center
                                gap-x-5
                                gap-y-3
                                text-xs
                                text-muted-foreground
                            "
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-gold" />
                            <span>Responsive interfaces</span>
                        </div>

                        <span
                            aria-hidden="true"
                            className="hidden h-3.5 w-px bg-border sm:block"
                        />

                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-gold" />
                            <span>Full-stack applications</span>
                        </div>

                        <span
                            aria-hidden="true"
                            className="hidden h-3.5 w-px bg-border sm:block"
                        />

                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="size-3.5 text-gold" />
                            <span>Modern web technologies</span>
                        </div>
                    </div>

                    {/* Scroll */}
                    <a
                        href="#about"
                        className="
                                group
                                mt-11
                                hidden
                                items-center
                                gap-3
                                text-sm
                                text-muted-foreground
                                transition-colors
                                duration-300
                                hover:text-gold
                                sm:inline-flex
                            "
                        data-aos="fade-up"
                        data-aos-delay="380"
                        data-aos-duration="800"
                    >
                        <span
                            className="
                                    flex
                                    size-9
                                    items-center
                                    justify-center
                                    rounded-full
                                    border
                                    border-border
                                    transition-all
                                    duration-300
                                    group-hover:border-gold/30
                                    group-hover:bg-gold/5
                                "
                        >
                            <ArrowDown className="size-4 animate-bounce" />
                        </span>

                        Explore my work
                    </a>
                </div>

                {/* =====================================================
                            RIGHT — VISUAL SYSTEM
                        ===================================================== */}

                <motion.div
                    className="
                            relative
                            mx-auto
                            w-full
                            max-w-[540px]
                            lg:ml-auto  "  >
                    <div className="relative px-4 pb-12 pt-7 sm:px-7">
                        {/* =================================================
                                    AMBIENT IMAGE GLOW
                                ================================================= */}

                        {/* Purple glow */}
                        <div
                            aria-hidden="true"
                            className="
                                    absolute
                                    left-[43%]
                                    top-1/2
                                    size-[70%]
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    rounded-full
                                    bg-primary/[0.10]
                                    blur-[85px]
                                "
                        />

                        {/* Gold glow */}
                        <div
                            aria-hidden="true"
                            className="
                                    absolute
                                    left-[62%]
                                    top-[48%]
                                    size-[42%]
                                    -translate-x-1/2
                                    -translate-y-1/2
                                    rounded-full
                                    bg-gold/[0.055]
                                    blur-[70px]
                                "
                        />

                        {/* Outer frame */}
                        <div
                            aria-hidden="true"
                            className="
                                    absolute
                                    inset-[1%]
                                    rounded-[3rem]
                                    border
                                    border-primary/[0.065]
                                "
                        />

                        {/* Gold accent outer frame */}
                        <div
                            aria-hidden="true"
                            className="
                                    pointer-events-none
                                    absolute
                                    inset-[3%]
                                    rounded-[2.8rem]
                                    border
                                    border-gold/[0.045]
                                "
                        />

                        {/* Corner markers */}
                        <div
                            aria-hidden="true"
                            className="
                                    absolute
                                    left-[1%]
                                    top-[22%]
                                    h-7
                                    w-px
                                    bg-gradient-to-b
                                    from-transparent
                                    via-primary/50
                                    to-transparent
                                "
                        />

                        <div
                            aria-hidden="true"
                            className="
                                    absolute
                                    right-[1%]
                                    top-[42%]
                                    h-9
                                    w-px
                                    bg-gradient-to-b
                                    from-transparent
                                    via-gold/50
                                    to-transparent
                                "
                        />

                        {/* =================================================
                                    IMAGE CONTAINER
                                ================================================= */}

                        <div
                            className="
                                    group
                                    relative
                                    z-10
                                    aspect-[0.84]
                                    overflow-hidden
                                    rounded-[2.35rem]
                                    border
                                    border-border/80
                                    bg-card
                                    shadow-[0_30px_80px_rgba(0,0,0,0.22)]
                                "
                        >
                            <Image
                                src="/images/general/hero.jpg"
                                alt="Asia Ashraf, Full-Stack Web Developer"
                                fill
                                priority
                                sizes="(max-width: 1024px) 80vw, 500px"
                                className="
                                        object-cover
                                        object-center
                                        transition-transform
                                        duration-1000
                                        ease-out
                                        group-hover:scale-[1.025]
                                    "
                            />

                            <div
                                aria-hidden="true"
                                className="
                                        pointer-events-none
                                        absolute
                                        inset-0
                                        bg-gradient-to-b
                                        from-black/[0.04]
                                        via-transparent
                                        to-black/[0.12]
                                    "
                            />

                            <div
                                aria-hidden="true"
                                className="
                                        pointer-events-none
                                        absolute
                                        inset-0
                                        bg-gradient-to-br
                                        from-primary/[0.06]
                                        via-transparent
                                        to-gold/[0.055]
                                    "
                            />

                            <div
                                aria-hidden="true"
                                className="
                                        pointer-events-none
                                        absolute
                                        inset-0
                                        rounded-[2.35rem]
                                        ring-1
                                        ring-inset
                                        ring-white/[0.08]
                                    "
                            />

                            {/* TOP STATUS */}
                            <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between">
                                <div className="rounded-full border border-white/[0.12] bg-black/[0.22] px-3 py-1.5 backdrop-blur-md">
                                    <span className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/70">
                                        Asia Ashraf
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/[0.22] px-3 py-1.5 backdrop-blur-md">
                                    <span className="relative flex size-1.5">
                                        <span className="absolute inset-0 animate-ping rounded-full bg-gold opacity-60" />
                                        <span className="relative size-1.5 rounded-full bg-gold" />
                                    </span>

                                    <span className="text-[9px] font-medium text-white/75">
                                        Available
                                    </span>
                                </div>
                            </div>

                            {/* BOTTOM IMAGE LABEL */}
                            <div className="absolute bottom-14 left-5 right-5 z-20">
                                <div
                                    className="
                                            absolute
                                            bottom-0
                                            left-1/2
                                            z-50
                                            w-[calc(100%-50px)]
                                            -translate-x-1/2
                                            translate-y-1/2
                                            overflow-hidden
                                            rounded-2xl
                                            border
                                            border-border/80
                                            bg-background/95
                                            shadow-2xl
                                            shadow-black/15
                                            backdrop-blur-2xl
                                        "
                                >
                                    <div className="relative flex items-center justify-between gap-4 px-5 py-4">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Asia Ashraf
                                            </p>

                                            <p className="mt-1 text-[11px] text-muted-foreground">
                                                Full-Stack Web Developer
                                            </p>
                                        </div>

                                        <div className="hidden items-center gap-2 sm:flex">
                                            <span className="size-1.5 rounded-full bg-gold" />

                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                Open to work
                                            </span>
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FLOATING CARD — LEFT */}
                        <div
                            className="
                                    absolute
                                    -left-1
                                    top-[26%]
                                    z-40
                                    hidden
                                    rounded-2xl
                                    border
                                    border-border/80
                                    bg-background/90
                                    px-4
                                    py-3.5
                                    shadow-2xl
                                    shadow-black/10
                                    backdrop-blur-2xl
                                    sm:block
                                    sm:-left-4
                                "
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                            flex
                                            size-9
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-purple/10
                                            text-purple-light
                                        "
                                >
                                    <Sparkles className="size-4" />
                                </div>

                                <div>
                                    <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                        Core stack
                                    </p>

                                    <p className="mt-1 text-xs font-semibold">
                                        Next.js · React
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* FLOATING CARD — RIGHT */}
                        <div
                            className="
                                    absolute
                                    -right-1
                                    bottom-[33%]
                                    z-40
                                    hidden
                                    rounded-2xl
                                    border
                                    border-border/80
                                    bg-background/90
                                    px-4
                                    py-3.5
                                    shadow-2xl
                                    shadow-black/10
                                    backdrop-blur-2xl
                                    sm:block
                                    sm:-right-4
                                "
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="
                                            flex
                                            size-9
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-gold/10
                                            text-gold
                                        "
                                >
                                    <Code2 className="size-4" />
                                </div>

                                <div>
                                    <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                        Focus
                                    </p>

                                    <p className="mt-1 text-xs font-semibold">
                                        Product Experience
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Container>

    );
};

export default HeroContent;