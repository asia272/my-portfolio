"use client";

/**
 * Reusable animated background used by every "Projects" surface:
 *   - the home page showcase   (components/sections/Projects.tsx)
 *   - the /projects page
 *   - the /projects/[slug] detail page
 *
 * It contains: rotating halo, aurora blobs, moving grid, the
 * constellation canvas (edges only) and the cursor-follow glow.
 *
 * Two ways to use it:
 *
 * 1) Simple  -> wrap your content in <BackgroundSection>
 * 2) Manual  -> call useBackgroundPointer(sectionRef, reduced) and
 *               render <AnimatedBackground /> yourself (what the home
 *               showcase does, because it also needs the section ref
 *               for its own logic).
 */

import {
    motion,
    useInView,
    useMotionValue,
    useReducedMotion,
    useScroll,
    useSpring,
    useTransform,
    type MotionValue,
} from "motion/react";

import {
    useEffect,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
    type ReactNode,
    type RefObject,
} from "react";

const GOLD = "#ffd36a";

const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));

const GRID_LINES =
    "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)";

/** The constellation is visible at the edges and fades out behind the cards / heading. */
const EDGE_ONLY_MASK =
    "radial-gradient(ellipse 62% 58% at 50% 52%, transparent 30%, black 100%)";

/* ============================================================
   BACKGROUND PIECES
============================================================ */

function Blob({
    scroll,
    range,
    position,
    color,
    path,
    duration,
    reduced,
}: {
    scroll: MotionValue<number>;
    range: [number, number];
    position: string;
    color: string;
    path: {
        x: number[];
        y: number[];
        scale: number[];
    };
    duration: number;
    reduced: boolean;
}) {
    const y = useTransform(scroll, [0, 1], range);

    return (
        <motion.div
            aria-hidden
            style={{ y }}
            className={`absolute ${position}`}
        >
            <motion.div
                style={{ background: color }}
                className="size-full rounded-full blur-[110px]"
                animate={reduced ? undefined : path}
                transition={{
                    duration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "mirror",
                }}
            />
        </motion.div>
    );
}

function NetworkCanvas({
    pointerX,
    pointerY,
    glow,
    running,
}: {
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    glow: MotionValue<number>;
    running: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const runningRef = useRef(running);

    useEffect(() => {
        runningRef.current = running;
    }, [running]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (!canvas || !ctx) return;

        type Node = {
            x: number;
            y: number;
            vx: number;
            vy: number;
            r: number;
            gold: boolean;
            phase: number;
        };

        const TAU = Math.PI * 2;
        const LINK = 140;
        const LINK2 = LINK * LINK;
        const MOUSE_R = 190;
        const MOUSE_R2 = MOUSE_R * MOUSE_R;

        let nodes: Node[] = [];
        let w = 0;
        let h = 0;
        let raf = 0;
        let last = performance.now();
        let tick = 0;
        let primary = "#6366f1";

        const readColor = () => {
            const c = getComputedStyle(canvas).color;
            if (c) primary = c;
        };

        const seed = () => {
            const count = clamp(
                Math.round((w * h) / 22000),
                22,
                58
            );

            nodes = Array.from({ length: count }, (_, i) => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: 1 + Math.random() * 1.6,
                gold: i % 6 === 0,
                phase: Math.random() * TAU,
            }));
        };

        const resize = () => {
            const dpr = Math.min(
                window.devicePixelRatio || 1,
                2
            );

            w = canvas.clientWidth;
            h = canvas.clientHeight;

            if (!w || !h) return;

            canvas.width = Math.round(w * dpr);
            canvas.height = Math.round(h * dpr);

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            seed();
        };

        readColor();
        resize();

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame);

            if (!runningRef.current || !w || !h) {
                last = now;
                return;
            }

            const dt = Math.min(now - last, 50) / 16.67;

            last = now;

            const t = now / 1000;

            if (tick++ % 120 === 0) {
                readColor();
            }

            const mx = pointerX.get();
            const my = pointerY.get();

            const mouseOn = glow.get() > 0.05;

            const damp = Math.pow(0.992, dt);

            ctx.clearRect(0, 0, w, h);

            /* ---------- update ---------- */

            for (const n of nodes) {
                if (mouseOn) {
                    const dx = n.x - mx;
                    const dy = n.y - my;
                    const d2 = dx * dx + dy * dy;

                    if (d2 < MOUSE_R2) {
                        const d = Math.sqrt(d2) || 1;
                        const f =
                            (1 - d / MOUSE_R) * 0.06 * dt;

                        n.vx += (dx / d) * f;
                        n.vy += (dy / d) * f;
                    }
                }

                n.vx +=
                    Math.cos(n.y * 0.004 + t * 0.3) *
                    0.0028 *
                    dt;

                n.vy +=
                    Math.sin(n.x * 0.004 + t * 0.3) *
                    0.0028 *
                    dt;

                n.vx *= damp;
                n.vy *= damp;

                const sp = Math.hypot(n.vx, n.vy);

                if (sp > 1.2) {
                    n.vx = (n.vx / sp) * 1.2;
                    n.vy = (n.vy / sp) * 1.2;
                }

                n.x += n.vx * dt;
                n.y += n.vy * dt;

                if (n.x < -20) n.x = w + 20;
                else if (n.x > w + 20) n.x = -20;

                if (n.y < -20) n.y = h + 20;
                else if (n.y > h + 20) n.y = -20;
            }

            /* ---------- links ---------- */

            ctx.lineWidth = 1;

            for (let i = 0; i < nodes.length; i++) {
                const a = nodes[i];

                for (let j = i + 1; j < nodes.length; j++) {
                    const b = nodes[j];

                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const d2 = dx * dx + dy * dy;

                    if (d2 > LINK2) continue;

                    const k = 1 - Math.sqrt(d2) / LINK;

                    ctx.globalAlpha = k * 0.3;

                    ctx.strokeStyle =
                        a.gold && b.gold ? GOLD : primary;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            /* ---------- cursor links ---------- */

            if (mouseOn) {
                ctx.strokeStyle = primary;

                for (const n of nodes) {
                    const dx = n.x - mx;
                    const dy = n.y - my;
                    const d2 = dx * dx + dy * dy;

                    if (d2 > MOUSE_R2) continue;

                    ctx.globalAlpha =
                        (1 - Math.sqrt(d2) / MOUSE_R) * 0.45;

                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(n.x, n.y);
                    ctx.stroke();
                }
            }

            /* ---------- nodes ---------- */

            for (const n of nodes) {
                const pulse =
                    1 + 0.3 * Math.sin(t * 2 + n.phase);

                ctx.fillStyle = n.gold ? GOLD : primary;

                ctx.globalAlpha = 0.8;

                ctx.beginPath();

                ctx.arc(n.x, n.y, n.r * pulse, 0, TAU);

                ctx.fill();

                if (n.gold) {
                    ctx.globalAlpha = 0.1;

                    ctx.beginPath();

                    ctx.arc(
                        n.x,
                        n.y,
                        n.r * pulse * 4,
                        0,
                        TAU
                    );

                    ctx.fill();
                }
            }

            ctx.globalAlpha = 1;
        };

        raf = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [pointerX, pointerY, glow]);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden
            className="absolute inset-0 size-full text-primary opacity-60"
        />
    );
}

export function AnimatedBackground({
    reduced,
    running,
    targetRef,
    pointerX,
    pointerY,
    glow,
}: {
    reduced: boolean;
    running: boolean;
    targetRef: RefObject<HTMLElement | null>;
    pointerX: MotionValue<number>;
    pointerY: MotionValue<number>;
    glow: MotionValue<number>;
}) {
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start end", "end start"],
    });

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
        >
            {/* rotating halo */}
            <div className="absolute left-1/2 top-[58%] size-[900px] -translate-x-1/2 -translate-y-1/2">
                <motion.div
                    className="size-full rounded-full opacity-[0.10] blur-3xl"
                    style={{
                        background: `conic-gradient(from 0deg, transparent, color-mix(in srgb, var(--primary) 70%, transparent), transparent 40%, color-mix(in srgb, ${GOLD} 55%, transparent) 62%, transparent 80%)`,
                    }}
                    animate={
                        reduced
                            ? undefined
                            : {
                                rotate: 360,
                            }
                    }
                    transition={{
                        duration: 70,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                />
            </div>

            {/* aurora blobs */}

            <Blob
                scroll={scrollYProgress}
                range={[-70, 70]}
                position="-left-[8%] top-[6%] size-[460px]"
                color="color-mix(in srgb, var(--primary) 12%, transparent)"
                path={{
                    x: [0, 90, -30, 0],
                    y: [0, 60, 110, 0],
                    scale: [1, 1.2, 0.95, 1],
                }}
                duration={24}
                reduced={reduced}
            />

            <Blob
                scroll={scrollYProgress}
                range={[60, -60]}
                position="-right-[6%] top-[34%] size-[380px]"
                color="rgba(255, 211, 106, 0.07)"
                path={{
                    x: [0, -80, 20, 0],
                    y: [0, -50, 40, 0],
                    scale: [1, 0.9, 1.15, 1],
                }}
                duration={28}
                reduced={reduced}
            />

            <Blob
                scroll={scrollYProgress}
                range={[-40, 90]}
                position="left-[32%] -bottom-[12%] size-[520px]"
                color="rgba(124, 92, 255, 0.08)"
                path={{
                    x: [0, 70, -60, 0],
                    y: [0, -40, 30, 0],
                    scale: [1, 1.1, 0.92, 1],
                }}
                duration={32}
                reduced={reduced}
            />

            {/* moving grid */}

            <div
                className="absolute inset-0"
                style={{
                    WebkitMaskImage:
                        "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                    maskImage:
                        "radial-gradient(ellipse at center, black 20%, transparent 72%)",
                }}
            >
                <motion.div
                    className="absolute -inset-16 opacity-[0.035]"
                    style={{
                        backgroundImage: GRID_LINES,
                        backgroundSize: "64px 64px",
                    }}
                    animate={
                        reduced
                            ? undefined
                            : {
                                x: [0, 64],
                                y: [0, 64],
                            }
                    }
                    transition={{
                        duration: 18,
                        ease: "linear",
                        repeat: Infinity,
                    }}
                />
            </div>

            {!reduced && (
                <>
                    <div
                        className="absolute inset-0"
                        style={{
                            WebkitMaskImage: EDGE_ONLY_MASK,
                            maskImage: EDGE_ONLY_MASK,
                        }}
                    >
                        <NetworkCanvas
                            pointerX={pointerX}
                            pointerY={pointerY}
                            glow={glow}
                            running={running}
                        />
                    </div>

                    <motion.div
                        className="absolute left-0 top-0 -ml-[260px] -mt-[260px] size-[520px] rounded-full"
                        style={{
                            x: pointerX,
                            y: pointerY,
                            opacity: glow,
                            background:
                                "radial-gradient(circle, color-mix(in srgb, var(--primary) 12%, transparent), transparent 65%)",
                        }}
                    />
                </>
            )}
        </div>
    );
}

/* ============================================================
   POINTER HOOK  (cursor-follow glow state)
============================================================ */

export function useBackgroundPointer(
    sectionRef: RefObject<HTMLElement | null>,
    reduced: boolean
) {
    const rawX = useMotionValue(0);
    const rawY = useMotionValue(0);

    const pointerX = useSpring(rawX, {
        stiffness: 90,
        damping: 20,
        mass: 0.6,
    });

    const pointerY = useSpring(rawY, {
        stiffness: 90,
        damping: 20,
        mass: 0.6,
    });

    const glow = useSpring(0, {
        stiffness: 60,
        damping: 20,
    });

    const onPointerMove = (e: ReactPointerEvent<HTMLElement>) => {
        if (reduced || e.pointerType !== "mouse") return;

        const rect = sectionRef.current?.getBoundingClientRect();

        if (!rect) return;

        rawX.set(e.clientX - rect.left);
        rawY.set(e.clientY - rect.top);
        glow.set(1);
    };

    const onPointerLeave = () => {
        glow.set(0);
    };

    return { pointerX, pointerY, glow, onPointerMove, onPointerLeave };
}

/* ============================================================
   DOCUMENT VISIBILITY HELPER
============================================================ */

export function useDocumentHidden() {
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        const onVis = () => setHidden(document.hidden);

        document.addEventListener("visibilitychange", onVis);

        return () =>
            document.removeEventListener("visibilitychange", onVis);
    }, []);

    return hidden;
}

/* ============================================================
   READY-MADE SECTION
   <section> + background + pointer glow, in one component.
============================================================ */

export function BackgroundSection({
    id,
    className = "",
    children,
    sectionRef,
}: {
    id?: string;
    className?: string;
    children: ReactNode;
    /** Optional: pass your own ref if the parent needs the <section>. */
    sectionRef?: RefObject<HTMLElement | null>;
}) {
    const reduced = !!useReducedMotion();

    const innerRef = useRef<HTMLElement>(null);
    const ref = sectionRef ?? innerRef;

    const inView = useInView(ref, { amount: 0.05 });
    const docHidden = useDocumentHidden();

    const { pointerX, pointerY, glow, onPointerMove, onPointerLeave } =
        useBackgroundPointer(ref, reduced);

    return (
        <section
            id={id}
            ref={ref}
            onPointerMove={onPointerMove}
            onPointerLeave={onPointerLeave}
            className={`relative overflow-hidden ${className}`}
        >
            <AnimatedBackground
                reduced={reduced}
                running={inView && !docHidden}
                targetRef={ref}
                pointerX={pointerX}
                pointerY={pointerY}
                glow={glow}
            />

            <div className="relative">{children}</div>
        </section>
    );
}

export default AnimatedBackground;