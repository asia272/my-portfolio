"use client";

import Image from "next/image";
import { useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

type Message = { role: "user" | "assistant"; content: string };

const ASSISTANT_NAME = "Asia Assistant";
const ASSISTANT_PHOTO = "/images/general/asia-assistant.jpg";

/* Chat background: soft purple glow (top-left), gold glow (bottom-right), tiny dot pattern */
const CHAT_BG: React.CSSProperties = {
    backgroundImage: [
        "radial-gradient(circle at 12% 0%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 55%)",
        "radial-gradient(circle at 100% 100%, color-mix(in srgb, var(--gold) 10%, transparent), transparent 50%)",
        "radial-gradient(color-mix(in srgb, var(--foreground) 8%, transparent) 1px, transparent 1px)",
    ].join(", "),
    backgroundSize: "auto, auto, 18px 18px",
};

function Avatar({ size }: { size: number }) {
    return (
        <Image
            src={ASSISTANT_PHOTO}
            alt={ASSISTANT_NAME}
            width={size}
            height={size}
            className="shrink-0 rounded-full object-cover"
            style={{ width: size, height: size }}
        />
    );
}

export function AssistantChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hi! Ask me anything about Asia's work." },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const text = input.trim();
        if (!text || isLoading) return;

        const next: Message[] = [...messages, { role: "user", content: text }];
        setMessages(next);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // pehla welcome message server ko bhejne ki zaroorat nahi
                body: JSON.stringify({ messages: next.slice(1).slice(-12) }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessages([...next, { role: "assistant", content: data.reply }]);
        } catch {
            toast.error("Something went wrong. Try again.");
        } finally {
            setIsLoading(false);
            requestAnimationFrame(() =>
                bottomRef.current?.scrollIntoView({ behavior: "smooth" })
            );
        }
    }

    return (
        <div className="flex h-[480px] flex-col overflow-hidden rounded-2xl border border-border bg-secondary">
            {/* Header: photo + name + status */}
            <div className="flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
                <div className="rounded-full p-0.5 ring-2 ring-gold/60">
                    <Avatar size={42} />
                </div>

                <div className="leading-tight">
                    <p className="text-sm font-semibold text-foreground">
                        {ASSISTANT_NAME}
                    </p>

                    <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-500 opacity-60" />
                            <span className="relative inline-flex size-2 rounded-full bg-green-500" />
                        </span>
                        Online
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 space-y-3 overflow-y-auto p-4"
                style={CHAT_BG}
            >
                {messages.map((m, i) =>
                    m.role === "user" ? (
                        <div
                            key={i}
                            style={{ background: "var(--gradient)" }}
                            className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm px-4 py-2 text-sm text-primary-foreground shadow-sm"
                        >
                            {m.content}
                        </div>
                    ) : (
                        <div key={i} className="flex items-end gap-2">
                            <Avatar size={28} />
                            <div className="w-fit max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm">
                                {m.content}
                            </div>
                        </div>
                    )
                )}

                {isLoading && (
                    <div className="flex items-end gap-2">
                        <Avatar size={28} />
                        <div className="w-fit rounded-2xl rounded-bl-sm glass px-4 py-2 text-sm text-muted-foreground">
                            Typing...
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="flex gap-2 border-t border-border bg-card/80 p-3 backdrop-blur"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    maxLength={1000}
                    className="admin-input"
                />
                <Button
                    type="submit"
                    className="custom-btn"
                    disabled={isLoading || !input.trim()}
                >
                    Send
                </Button>
            </form>
        </div>
    );
}