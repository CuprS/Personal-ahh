import { site } from "@/lib/site";

export type EmailResult = "sent" | "logged" | "unavailable" | "failed";

/**
 * Email the site owner through Resend: the address in src/lib/site.ts (never shown on the
 * site), or CONTACT_TO_EMAIL from the environment. Server-only (it reads RESEND_API_KEY).
 *
 * Without RESEND_API_KEY, development logs the email instead so forms work with zero setup,
 * and production reports "unavailable".
 */
export async function emailOwner(
  /** Short label for log lines, e.g. "contact". */
  tag: string,
  email: { subject: string; text: string; replyTo?: string },
): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || site.email;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info(`\n[${tag}] New message (email not configured, logging instead):\n${email.subject}\n\n${email.text}`);
      return "logged";
    }
    console.error(`[${tag}] RESEND_API_KEY is not set.`);
    return "unavailable";
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [to],
        reply_to: email.replyTo,
        subject: email.subject,
        text: email.text,
      }),
    });
    if (!res.ok) {
      console.error(`[${tag}] Resend error:`, res.status, await res.text());
      return "failed";
    }
    return "sent";
  } catch (error) {
    console.error(`[${tag}] Failed to send:`, error);
    return "failed";
  }
}
