"use server";

import {
    contactSchema,
    type ContactField,
    type ContactFormState,
} from "@/lib/contact-schema";
import { sendContactAutoReply, sendContactEmailToAdmin } from "@/lib/brevo";

const SUCCESS_MESSAGE = "Message sent successfully!";

export async function submitContact(
    _prevState: ContactFormState,
    formData: FormData
): Promise<ContactFormState> {
    // 1. Honeypot: real users never see or fill this hidden field.
    if (formData.get("website")) {
        return { status: "success", message: SUCCESS_MESSAGE, fieldErrors: {}, values: {} };
    }

    // 2. Read raw values (kept so the form doesn't wipe on error).
    const raw = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        subject: String(formData.get("subject") ?? ""),
        message: String(formData.get("message") ?? ""),
    };

    // 3. Validate.
    const parsed = contactSchema.safeParse(raw);

    if (!parsed.success) {
        const fieldErrors: ContactFormState["fieldErrors"] = {};
        for (const issue of parsed.error.issues) {
            const field = issue.path[0] as ContactField;
            if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
        }

        return {
            status: "error",
            message: "Please fix the highlighted fields.",
            fieldErrors,
            values: raw,
        };
    }

    // 4. Send emails. Admin email is required; auto-reply is best effort.
    const [adminResult, replyResult] = await Promise.allSettled([
        sendContactEmailToAdmin(parsed.data),
        sendContactAutoReply(parsed.data),
    ]);

    if (adminResult.status === "rejected") {
        console.error("[contact] admin email failed:", adminResult.reason);
        return {
            status: "error",
            message: "Something went wrong while sending your message. Please try again.",
            fieldErrors: {},
            values: raw,
        };
    }

    if (replyResult.status === "rejected") {
        console.error("[contact] auto-reply failed:", replyResult.reason);
    }

    return { status: "success", message: SUCCESS_MESSAGE, fieldErrors: {}, values: {} };
}