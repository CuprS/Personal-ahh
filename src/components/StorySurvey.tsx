"use client";

import { useActionState, useId } from "react";
import { sendSurvey, type SurveyState } from "@/app/actions/survey";

const initialState: SurveyState = { status: "idle" };
const RATINGS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/**
 * A one-question survey under the Try Now story: a 1–10 rating and an optional comment,
 * emailed to the site owner. Compact: one row on wide screens, three short rows on phones.
 *
 * `data-egg-clear` keeps the story's egg gradient off this box (see src/lib/dot-grid.ts),
 * and it sits outside the story, so blackout bars never cover it.
 */
export function StorySurvey() {
  const [state, formAction, pending] = useActionState(sendSurvey, initialState);
  const id = useId();
  const questionId = `${id}-question`;
  const commentId = `${id}-comment`;
  const statusId = `${id}-status`;
  const error = state.status === "error";

  return (
    <section
      data-story-survey
      data-egg-clear
      aria-labelledby={questionId}
      className="relative mx-auto mt-8 w-[round(down,100%,16px)] max-w-3xl bg-surface px-3 py-3 ring-1 ring-accent/60 sm:px-5 sm:py-4 xl:max-w-none"
    >
      {state.status === "success" ? null : (
        <form action={formAction} noValidate className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <p id={questionId} className="font-semibold">
            How did the eye tracking work?
          </p>

          <div
            role="radiogroup"
            aria-labelledby={questionId}
            aria-describedby={error ? statusId : undefined}
            className="grid w-full grid-cols-10 gap-0.5 sm:flex sm:w-auto sm:gap-1"
          >
            {RATINGS.map((n) => (
              <label key={n} className="cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  defaultChecked={state.values?.rating === String(n)}
                  className="peer sr-only"
                />
                <span className="flex h-9 items-center justify-center rounded-lg border border-border text-sm tabular-nums transition-colors hover:border-accent peer-checked:border-accent peer-checked:bg-accent peer-checked:font-semibold peer-checked:text-accent-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent sm:w-9">
                  {n}
                </span>
              </label>
            ))}
          </div>

          <div className="flex min-w-64 flex-1 gap-2">
            <label htmlFor={commentId} className="sr-only">
              Comment (optional)
            </label>
            <input
              id={commentId}
              name="comment"
              type="text"
              maxLength={1000}
              autoComplete="off"
              placeholder="Add a comment (optional)"
              defaultValue={state.values?.comment}
              className="h-9 min-w-0 flex-1 rounded-full border border-border bg-background px-4 text-base text-foreground placeholder:text-muted/70 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 sm:text-sm"
            />
            <button
              type="submit"
              disabled={pending}
              className="h-9 shrink-0 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
            >
              {pending ? "Sending…" : "Send"}
            </button>
          </div>

          {/* Honeypot: hidden from people and screen readers, tempting for bots. */}
          <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Website
              <input name="website" type="text" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </form>
      )}

      {/* Empty (no height) until there is something to say. */}
      <p
        id={statusId}
        role="status"
        aria-live="polite"
        className={error ? "mt-2 text-sm text-red-400" : "font-semibold"}
      >
        {state.message ?? ""}
      </p>
    </section>
  );
}
