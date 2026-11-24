"use client";

import { Fragment, useEffect, useRef } from "react";
import { watchDotGrid } from "@/lib/dot-grid";

export type StoryBlock = { kind: "heading" | "paragraph"; text: string };

/**
 * A story with a dot overlay: dense dots on every word, a grid snapped to the box edges in
 * the margins, and black bars over every word below the cursor line. Drawing lives in
 * src/lib/dot-grid.ts.
 *
 * Grid alignment depends on sizes being multiples of 16px (GRID_STEP): width is rounded
 * down with CSS round(), padding is 32/48px, gaps are 32px, paragraph lines are 32px and
 * heading lines are 48px.
 */
export function DotGridStory({ blocks, credit }: { blocks: StoryBlock[]; credit?: string }) {
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!rootRef.current || !canvasRef.current) return;
    return watchDotGrid(rootRef.current, canvasRef.current);
  }, []);

  return (
    <figure className="mx-auto w-[round(down,100%,16px)] max-w-3xl">
      <article
        ref={rootRef}
        data-dot-story
        className="relative flex flex-col gap-8 bg-surface px-8 py-8 ring-1 ring-border sm:px-12 sm:py-12"
      >
        {blocks.map((block, i) =>
          block.kind === "heading" ? (
            <h2 key={i} className="font-display text-3xl leading-12 sm:text-4xl sm:leading-12">
              <Words text={block.text} />
            </h2>
          ) : (
            <p key={i} className="text-lg leading-8 sm:text-xl sm:leading-8">
              <Words text={block.text} />
            </p>
          ),
        )}
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        />
      </article>
      {credit ? <figcaption className="mt-4 text-sm text-muted">{credit}</figcaption> : null}
    </figure>
  );
}

/** Wrap each word in a span so the overlay can find it. Spaces stay as normal text. */
function Words({ text }: { text: string }) {
  return text
    .trim()
    .split(/\s+/)
    .map((word, i) => (
      <Fragment key={i}>
        {i > 0 ? " " : null}
        <span data-word>{word}</span>
      </Fragment>
    ));
}
