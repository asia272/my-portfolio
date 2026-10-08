import "server-only";
import type { ContactInput } from "@/lib/contact-schema";
import {
    adminContactTemplate,
    senderAutoReplyTemplate,
} from "@/lib/email-templates/contact";

import { BrevoClient } from "@getbrevo/brevo";

const apiKey = process.env.BREVO_API_KEY;

if (!apiKey) {
    throw new Error("BREVO_API_KEY is missing.");
}

const brevo = new BrevoClient({
    apiKey,
    timeoutInSeconds: 15,
    maxRetries: 2,
});

export async function sendAdminOtpEmail({
    otp,
}: {
    otp: string;
}) {
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!senderEmail || !senderName || !adminEmail) {
        throw new Error(
            "Brevo sender or admin email configuration is missing."
        );
    }

    await brevo.transactionalEmails.sendTransacEmail({
        sender: {
            email: senderEmail,
            name: senderName,
        },

        to: [
            {
                email: adminEmail,
            },
        ],

        subject: "Your Portfolio Admin Verification Code",

        textContent: `
Your Portfolio Admin verification code is:

${otp}

This code expires in 10 minutes.

If you did not request this code, you can safely ignore this email.
        `.trim(),

        htmlContent: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:white;border-radius:16px;padding:32px;">
        <h1 style="margin:0 0 12px;">
            Admin Verification
        </h1>

        <p style="color:#666;">
            Use the verification code below to access your portfolio admin panel.
        </p>

        <div style="
            margin:28px 0;
            padding:20px;
            border-radius:12px;
            background:#f3e9f4;
            text-align:center;
            font-size:32px;
            font-weight:700;
            letter-spacing:8px;
        ">
            ${otp}
        </div>

        <p style="color:#777;font-size:14px;">
            This code expires in 10 minutes.
        </p>

        <p style="color:#777;font-size:14px;">
            If you did not request this code, you can safely ignore this email.
        </p>
    </div>
</body>
</html>
        `.trim(),
    });
}





// ── add at the bottom of the file ──

function getMailConfig() {
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (!senderEmail || !senderName || !adminEmail) {
        throw new Error("Brevo sender or admin email configuration is missing.");
    }

    return { senderEmail, senderName, adminEmail };
}

/** Sends the visitor's message to the admin inbox. */
export async function sendContactEmailToAdmin(input: ContactInput) {
    const { senderEmail, senderName, adminEmail } = getMailConfig();
    const mail = adminContactTemplate(input);

    await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: adminEmail }],
        replyTo: { email: input.email, name: input.name },
        subject: mail.subject,
        textContent: mail.text,
        htmlContent: mail.html,
    });
}

/** Sends the "thanks, we'll get back to you" email to the visitor. */
export async function sendContactAutoReply(input: ContactInput) {
    const { senderEmail, senderName } = getMailConfig();
    const mail = senderAutoReplyTemplate(input);

    await brevo.transactionalEmails.sendTransacEmail({
        sender: { email: senderEmail, name: senderName },
        to: [{ email: input.email, name: input.name }],
        subject: mail.subject,
        textContent: mail.text,
        htmlContent: mail.html,
    });
}