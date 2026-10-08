"use client";



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

        type Particle = {
            bx: number; // home position
            by: number;
            ox: number; // orbit size around home
            oy: number;
            sp: number; // orbit speed
            ph: number; // orbit phase
            x: number;
            y: number;
            vx: number;
            vy: number;
            tx: number; // current target (home + orbit)
            ty: number;
            z: number; // depth: 0.55 (far) .. 1 (near)
            r: number;
            gold: boolean;
            energy: number; // 0..1, how far it is pushed from its target
        };

        const TAU = Math.PI * 2;

        /* ---- tuning knobs ---- */
        const FLEE_R = 175; // how far the cursor scares particles
        const FLEE_R2 = FLEE_R * FLEE_R;
        const FLEE_FORCE = 2.4; // how hard they run
        const SWIRL = 0.3; // sideways push, makes the escape curved
        const SPRING = 0.012; // pull back to home
        const DAMP = 0.88; // lower = stops faster
        const MAX_SPEED = 14;
        const CURSOR_LINK_R = 240; // "string" lines around the cursor

        let nodes: Particle[] = [];
        let link = 140;
        let link2 = link * link;
        let w = 0;
        let h = 0;
        let raf = 0;
        let last = performance.now();
        let sim = 0; // simulation time in seconds (pauses when hidden)
        let tick = 0;
        let primary = "#6366f1";

        // cursor speed tracking (fast mouse = stronger scare)
        let pmx = 0;
        let pmy = 0;
        let hasPrev = false;

        const readColor = () => {
            const c = getComputedStyle(canvas).color;
            if (c) primary = c;
        };

        /** Evenly spread (jittered grid) so the network never clumps. */
        const seed = () => {
            const count = clamp(Math.round((w * h) / 20000), 24, 70);

            const cols = Math.max(2, Math.round(Math.sqrt((count * w) / h)));
            const rows = Math.max(2, Math.ceil(count / cols));

            const cw = w / cols;
            const ch = h / rows;

            link = clamp(Math.max(cw, ch) * 1.55, 110, 180);
            link2 = link * link;

            nodes = [];

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const bx = (col + 0.5) * cw + (Math.random() - 0.5) * cw * 0.8;
                    const by = (row + 0.5) * ch + (Math.random() - 0.5) * ch * 0.8;

                    nodes.push({
                        bx,
                        by,
                        ox: 8 + Math.random() * 20,
                        oy: 8 + Math.random() * 20,
                        sp: 0.15 + Math.random() * 0.25,
                        ph: Math.random() * TAU,
                        x: bx,
                        y: by,
                        vx: 0,
                        vy: 0,
                        tx: bx,
                        ty: by,
                        z: 0.55 + Math.random() * 0.45,
                        r: 1 + Math.random() * 1.4,
                        gold: Math.random() < 0.16,
                        energy: 0,
                    });
                }
            }
        };

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
            sim += dt / 60;

            if (tick++ % 120 === 0) {
                readColor();
            }

            const mx = pointerX.get();
            const my = pointerY.get();
            const g = glow.get(); // smooth 0..1, so the effect fades in and out
            const mouseOn = g > 0.02;

            // fast cursor = stronger scare
            let boost = 1;

            if (mouseOn) {
                if (hasPrev) {
                    boost =
                        1 +
                        clamp(Math.hypot(mx - pmx, my - pmy) / (dt * 5), 0, 1.2);
                }

                pmx = mx;
                pmy = my;
                hasPrev = true;
            } else {
                hasPrev = false;
            }

            const damp = Math.pow(DAMP, dt);

            ctx.clearRect(0, 0, w, h);

            /* ---------- physics ---------- */

            for (const p of nodes) {
                // 1) home position drifts in a slow orbit
                p.tx = p.bx + Math.cos(sim * p.sp + p.ph) * p.ox;
                p.ty = p.by + Math.sin(sim * p.sp * 0.8 + p.ph) * p.oy;

                // 2) spring pulls the particle back to its home
                p.vx += (p.tx - p.x) * SPRING * dt;
                p.vy += (p.ty - p.y) * SPRING * dt;

                // 3) cursor scares it away (smooth falloff + a little swirl)
                if (mouseOn) {
                    const dx = p.x - mx;
                    const dy = p.y - my;
                    const d2 = dx * dx + dy * dy;

                    if (d2 < FLEE_R2) {
                        const d = Math.sqrt(d2) || 1;
                        const k = 1 - d / FLEE_R;
                        const f = k * k * FLEE_FORCE * g * boost * p.z * dt;
                        const nx = dx / d;
                        const ny = dy / d;

                        p.vx += nx * f - ny * f * SWIRL;
                        p.vy += ny * f + nx * f * SWIRL;
                    }
                }

                p.vx *= damp;
                p.vy *= damp;

                const sp = Math.hypot(p.vx, p.vy);

                if (sp > MAX_SPEED) {
                    p.vx = (p.vx / sp) * MAX_SPEED;
                    p.vy = (p.vy / sp) * MAX_SPEED;
                }

                p.x += p.vx * dt;
                p.y += p.vy * dt;

                // how far it is pushed away from home (used for glow)
                const disp = Math.hypot(p.x - p.tx, p.y - p.ty);
                p.energy += (clamp(disp / 70, 0, 1) - p.energy) * 0.15;
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

                    if (d2 > link2) continue;

                    const k = 1 - Math.sqrt(d2) / link;

                    let alpha = k * 0.32 + (a.energy + b.energy) * 0.06;

                    // lines near the cursor light up
                    if (mouseOn) {
                        const dm = Math.hypot(
                            (a.x + b.x) / 2 - mx,
                            (a.y + b.y) / 2 - my
                        );

                        if (dm < CURSOR_LINK_R) {
                            alpha += (1 - dm / CURSOR_LINK_R) * 0.28 * g * k;
                        }
                    }

                    ctx.globalAlpha = Math.min(alpha, 0.8);
                    ctx.strokeStyle = a.gold && b.gold ? GOLD : primary;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            /* ---------- cursor strings ---------- */

            if (mouseOn) {
                ctx.strokeStyle = primary;

                for (const p of nodes) {
                    const d = Math.hypot(p.x - mx, p.y - my);

                    if (d > CURSOR_LINK_R) continue;

                    ctx.globalAlpha = (1 - d / CURSOR_LINK_R) * 0.4 * g;

                    ctx.beginPath();
                    ctx.moveTo(mx, my);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                }
            }

            /* ---------- nodes ---------- */

            for (const p of nodes) {
                const pulse = 1 + 0.3 * Math.sin(sim * 2 + p.ph);
                const radius = p.r * p.z * pulse * (1 + p.energy * 0.7);

                ctx.fillStyle = p.gold ? GOLD : primary;

                ctx.globalAlpha = 0.5 + p.z * 0.3 + p.energy * 0.2;

                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, TAU);
                ctx.fill();

                if (p.gold) {
                    ctx.globalAlpha = 0.1 + p.energy * 0.08;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, radius * 4, 0, TAU);
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