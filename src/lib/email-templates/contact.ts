import type { ContactInput } from "@/lib/contact-schema";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const withLineBreaks = (value: string) =>
    escapeHtml(value).replace(/\n/g, "<br />");

const layout = (content: string) =>
    `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:16px;padding:32px;">
    ${content}
  </div>
</body>
</html>`.trim();

/* ---------- Email to ADMIN ---------- */

export function adminContactTemplate({
    name,
    email,
    subject,
    message,
}: ContactInput) {
    return {
        subject: `New portfolio message: ${subject}`,
        text: `New message from ${name} <${email}>\n\nSubject: ${subject}\n\n${message}`,
        html: layout(`
      <h1 style="margin:0 0 16px;">New Contact Message</h1>
      <p style="margin:4px 0;color:#444;"><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p style="margin:4px 0;color:#444;"><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p style="margin:4px 0 20px;color:#444;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <div style="padding:16px;border-radius:12px;background:#f3e9f4;color:#222;line-height:1.6;">
        ${withLineBreaks(message)}
      </div>
      <p style="margin-top:20px;color:#777;font-size:14px;">
        Just hit Reply to answer ${escapeHtml(name)} directly.
      </p>
    `),
    };
}

/* ---------- Auto-reply to SENDER ---------- */

export function senderAutoReplyTemplate({
    name,
    subject,
    message,
}: ContactInput) {
    return {
        subject: "Thanks for your message!",
        text: `Hi ${name},\n\nThanks for reaching out! I received your message and will get back to you soon.\n\nYour message ("${subject}"):\n${message}\n\nBest regards`,
        html: layout(`
      <h1 style="margin:0 0 12px;">Thanks, ${escapeHtml(name)}! 👋</h1>
      <p style="color:#666;line-height:1.6;">
        I received your message and will get back to you as soon as possible.
      </p>
      <p style="margin:24px 0 8px;color:#444;"><strong>Your message:</strong></p>
      <div style="padding:16px;border-radius:12px;background:#f3e9f4;color:#222;line-height:1.6;">
        <strong>${escapeHtml(subject)}</strong><br /><br />
        ${withLineBreaks(message)}
      </div>
      <p style="margin-top:24px;color:#777;font-size:14px;">
        This is an automatic confirmation, so there is no need to reply to it.
      </p>
    `),
    };
}