"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Button } from "../ui/button";

type Message = { role: "user" | "assistant"; content: string };

const ASSISTANT_NAME = "Asia Assistant";
const ASSISTANT_PHOTO = "/images/general/asia-assistant.jpg";
const STORAGE_KEY = "asia-assistant-chat-v1";
const MAX_STORED = 50;

const GREETING =
    "Hi! I'm Asia's AI assistant. Ask me anything about her work, or pick a question below.";

const SUGGESTIONS = [
    "Tell me about Asia's projects",
    "What are her main skills?",
    "What services does she offer?",
    "Is she available for work?",
];

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

function loadStoredMessages(): Message[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
            .filter(
                (m): m is Message =>
                    !!m &&
                    (m.role === "user" || m.role === "assistant") &&
                    typeof m.content === "string" &&
                    m.content.length > 0
            )
            .slice(-MAX_STORED);
    } catch {
        return [];
    }
}

export function AssistantChat() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        setMessages(loadStoredMessages());
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            if (messages.length === 0) {
                localStorage.removeItem(STORAGE_KEY);
            } else {
                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(messages.slice(-MAX_STORED))
                );
            }
        } catch {
            // storage full / blocked: chat phir bhi kaam karega
        }
    }, [messages, hydrated]);


    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, isLoading, hydrated]);

    async function sendMessage(raw: string) {
        const text = raw.trim();
        if (!text || isLoading) return;

        const next: Message[] = [...messages, { role: "user", content: text }];
        setMessages(next);
        setInput("");
        setIsLoading(true);

        // Sirf aakhri 12 messages, aur pehla message user ka ho
        let history = next.slice(-12);
        while (history.length > 1 && history[0].role !== "user") {
            history = history.slice(1);
        }

        try {
            const res = await fetch("/api/assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // API 1000 chars se lamba content reject karti hai
                    messages: history.map((m) => ({
                        role: m.role,
                        content: m.content.slice(0, 1000),
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setMessages([...next, { role: "assistant", content: data.reply }]);
        } catch {
            toast.error("Something went wrong. Try again.");
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        void sendMessage(input);
    }

    function clearChat() {
        if (isLoading) return;
        setMessages([]);
        setInput("");
    }

    const showSuggestions = hydrated && messages.length === 0 && !isLoading;

    return (
        <div className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
                <Avatar size={42} />

                <div className="min-w-0 flex-1 leading-tight">
                    <p className="truncate text-sm font-semibold text-foreground">
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

                {messages.length > 0 && (
                    <button
                        type="button"
                        onClick={clearChat}
                        disabled={isLoading}
                        className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                        clear chat
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-card  p-4">

                <div className="flex items-end gap-2">
                    <Avatar size={28} />
                    <div className="w-fit max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm">
                        {GREETING}
                    </div>
                </div>

                {showSuggestions && (
                    <div className="flex flex-wrap gap-2 pl-9">
                        {SUGGESTIONS.map((q) => (
                            <button
                                key={q}
                                type="button"
                                onClick={() => void sendMessage(q)}
                                className="rounded-full border border-border bg-card px-3 py-1.5 text-left !text-[12px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                )}

                {messages.map((m, i) =>
                    m.role === "user" ? (
                        <div
                            key={i}
                            className="ml-auto w-fit max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground shadow-sm"
                        >
                            {m.content}
                        </div>
                    ) : (
                        <div key={i} className="flex items-end gap-2">
                            <Avatar size={28} />
                            <div className="w-fit max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2 text-sm text-foreground shadow-sm">
                                {m.content}
                            </div>
                        </div>
                    )
                )}

                {isLoading && (
                    <div className="flex items-end gap-2">
                        <Avatar size={28} />
                        <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                            <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="flex gap-2 border-t border-border bg-card p-3"
            >
                <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about Asia's projects, skills, expertise..."
                    maxLength={1000}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background/10 px-3 !text-xs text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
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