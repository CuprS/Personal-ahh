"use server";

import { z } from "zod";
import { site } from "@/lib/site";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please add your name.").max(100, "That name is a bit long."),
  email: z
    .string()
    .trim()
    .max(200, "That email is a bit long.")
    .pipe(z.email("That email doesn't look quite right.")),
  message: z
    .string()
    .trim()
    .min(10, "Say a little more (at least 10 characters).")
    .max(5000, "Please keep it under 5,000 characters."),
});

type Field = keyof z.infer<typeof contactSchema>;

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<Field, string[]>>;
  /** Echoed back on error so the form keeps what the visitor typed. */
  values?: Partial<Record<Field, string>>;
};

export async function sendContact(
  _prevState: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Honeypot: real people never see or fill this field; bots often do.
  if (formData.get("company")) {
    return { status: "success", message: "Thanks! Your message is on its way." };
  }

  const raw = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
      values: raw,
    };
  }

  const { name, email, message } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  // Your inbox: the environment override, else the address in src/lib/site.ts (never shown on the site).
  const to = process.env.CONTACT_TO_EMAIL || site.email;

  // Not configured yet: log locally so development works with zero setup.
  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("\n[contact] New message (email not configured, logging instead):", {
        name,
        email,
        message,
      });
      return { status: "success", message: "Thanks! Your message is on its way." };
    }
    console.error("[contact] RESEND_API_KEY is not set.");
    return {
      status: "error",
      message: "Messages can't be sent right now. Please try again later.",
      values: raw,
    };
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
        reply_to: email,
        subject: `New message from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    });

    if (!res.ok) {
      console.error("[contact] Resend error:", res.status, await res.text());
      throw new Error(`Resend responded with ${res.status}`);
    }
  } catch (error) {
    console.error("[contact] Failed to send:", error);
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again in a moment.",
      values: raw,
    };
  }

  return { status: "success", message: "Thanks! Your message is on its way." };
}
