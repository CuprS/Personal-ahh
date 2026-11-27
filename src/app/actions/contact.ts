"use server";

import { z } from "zod";
import { emailOwner } from "@/lib/email";

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
  // To your inbox, with the visitor's address as the reply-to.
  const result = await emailOwner("contact", {
    subject: `New message from ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    replyTo: email,
  });

  if (result === "unavailable") {
    return {
      status: "error",
      message: "Messages can't be sent right now. Please try again later.",
      values: raw,
    };
  }
  if (result === "failed") {
    return {
      status: "error",
      message: "Something went wrong sending your message. Please try again in a moment.",
      values: raw,
    };
  }
  return { status: "success", message: "Thanks! Your message is on its way." };
}
