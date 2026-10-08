"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageCircle, X } from "lucide-react";
import { AssistantChat } from "./AssistanChat";

/* Do rings, thori der ke farq se, taake lehar musalsal chalti dikhe */
const RING_DELAYS = [0, 1.2];

export function AssistantWidget() {
    const [open, setOpen] = useState(false);
    const reduced = !!useReducedMotion();

    // Escape dabane par chat band ho jaye
    useEffect(() => {
        if (!open) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };

        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    // Animation sirf tab jab chat band ho aur user ne reduced motion na maanga ho
    const idleAnimation = !open && !reduced;

    return (
        <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
            <AnimatePresence>
                {open && (
                    <motion.div
                        id="assistant-panel"
                        role="dialog"
                        aria-label="AI assistant"
                        initial={{ opacity: 0, y: 16, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.96 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-[calc(100vw-2rem)] origin-bottom-right overflow-hidden rounded-2xl shadow-2xl sm:w-96"
                    >
                        <AssistantChat />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Button wrapper: halka sa upar neeche floating */}
            <motion.div
                className="relative"
                animate={idleAnimation ? { y: [0, -6, 0] } : { y: 0 }}
                transition={
                    idleAnimation
                        ? { duration: 3.2, ease: "easeInOut", repeat: Infinity }
                        : { duration: 0.2 }
                }
            >
                {/* Gold ripple rings (band hone par ruk jati hain) */}
                {idleAnimation &&
                    RING_DELAYS.map((delay) => (
                        <motion.span
                            key={delay}
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-full border-2 border-gold"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.9, opacity: 0 }}
                            transition={{
                                duration: 2.4,
                                delay,
                                ease: "easeOut",
                                repeat: Infinity,
                            }}
                        />
                    ))}

                <motion.button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Close assistant" : "Open assistant"}
                    aria-expanded={open}
                    aria-controls="assistant-panel"
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    // Halki "saans" jaisi dhadkan jab chat band ho
                    animate={
                        idleAnimation
                            ? {
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 8px 22px color-mix(in srgb, var(--gold) 30%, transparent)",
                                    "0 10px 32px color-mix(in srgb, var(--gold) 55%, transparent)",
                                    "0 8px 22px color-mix(in srgb, var(--gold) 30%, transparent)",
                                ],
                            }
                            : {
                                scale: 1,
                                boxShadow:
                                    "0 8px 22px color-mix(in srgb, var(--gold) 30%, transparent)",
                            }
                    }
                    transition={
                        idleAnimation
                            ? { duration: 2.4, ease: "easeInOut", repeat: Infinity }
                            : { duration: 0.2 }
                    }
                    style={{ background: "var(--gold-gradient)" }}
                    className="relative flex size-14 items-center justify-center rounded-full text-[#1a0f22]"
                >
                    {/* Icon badalte waqt ghoomta hua smooth transition */}
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                            key={open ? "close" : "chat"}
                            initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                            animate={{ rotate: 0, opacity: 1, scale: 1 }}
                            exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="flex"
                        >
                            {open ? <X size={24} /> : <MessageCircle size={24} />}
                        </motion.span>
                    </AnimatePresence>
                </motion.button>
            </motion.div>
        </div>
    );
}