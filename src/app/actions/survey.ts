"use server";

import { z } from "zod";
import { emailOwner } from "@/lib/email";

/** The Try Now survey question. */
const QUESTION = "How did the eye tracking work?";

const surveySchema = z.object({
  rating: z
    .string()
    .regex(/^(10|[1-9])$/, "Pick a number from 1 to 10.")
    .transform(Number),
  comment: z.string().trim().max(1000, "Please keep your comment under 1,000 characters."),
});

export type SurveyState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Echoed back on error so the form keeps what the visitor picked and typed. */
  values?: { rating?: string; comment?: string };
};

const THANKS = "Thanks for the feedback!";

export async function sendSurvey(_prevState: SurveyState, formData: FormData): Promise<SurveyState> {
  // Honeypot: real people never see or fill this field; bots often do.
  if (formData.get("website")) return { status: "success", message: THANKS };

  const raw = {
    rating: String(formData.get("rating") ?? ""),
    comment: String(formData.get("comment") ?? ""),
  };
  const parsed = surveySchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message, values: raw };
  }

  const { rating, comment } = parsed.data;
  const result = await emailOwner("survey", {
    subject: `Try Now survey: ${rating}/10`,
    text: `${QUESTION}\n${rating}/10\n\nComment: ${comment || "(none)"}`,
  });
  if (result === "unavailable" || result === "failed") {
    return {
      status: "error",
      message: "Your answer couldn't be sent right now. Please try again in a moment.",
      values: raw,
    };
  }
  return { status: "success", message: THANKS };
}
