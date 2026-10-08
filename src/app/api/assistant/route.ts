import { NextResponse } from "next/server";
import { z } from "zod";
import { ASSISTANT_MODEL, SYSTEM_PROMPT, groq } from "@/lib/groq";

const bodySchema = z.object({
    messages: z
        .array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().trim().min(1).max(1000),
            })
        )
        .min(1)
        .max(12),
});

export async function POST(req: Request) {
    try {
        const parsed = bodySchema.safeParse(await req.json());

        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request." }, { status: 400 });
        }

        const completion = await groq.chat.completions.create({
            model: ASSISTANT_MODEL,
            temperature: 0.6,
            max_completion_tokens: 1024,
            reasoning_effort: "low",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...parsed.data.messages,
            ],
        });

        const reply = completion.choices[0]?.message?.content?.trim();

        if (!reply) {
            return NextResponse.json({ error: "No response." }, { status: 502 });
        }

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("[assistant] failed:", error);
        return NextResponse.json({ error: "Assistant is unavailable." }, { status: 500 });
    }
}