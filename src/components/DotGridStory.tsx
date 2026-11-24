"use client";

import { Fragment, useEffect, useRef } from "react";
import { watchDotGrid } from "@/lib/dot-grid";

/**
 * A passage of text with a dot overlay: dense dots on every word, and a grid snapped to
 * the box edges in the margins. Drawing lives in src/lib/dot-grid.ts.
 *
 * Grid alignment depends on sizes being multiples of 16px (GRID_STEP):
 * width is rounded down with CSS round(), padding is 32/48px and every text line is 32px.
 */
export function DotGridStory({ text, credit }: { text: string; credit?: string }) {
  const rootRef = useRef<HTMLQuoteElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!rootRef.current || !canvasRef.current) return;
    return watchDotGrid(rootRef.current, canvasRef.current);
  }, []);

  const words = text.trim().split(/\s+/);

  return (
    <figure className="mx-auto w-[round(down,100%,16px)] max-w-3xl">
      <blockquote
        ref={rootRef}
        data-dot-story
        className="relative bg-surface px-8 py-8 ring-1 ring-border sm:px-12 sm:py-12"
      >
        <p className="text-lg leading-8 sm:text-xl sm:leading-8">
          {words.map((word, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              <span data-word>{word}</span>
            </Fragment>
          ))}
        </p>
        <canvas
          ref={canvasRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full"
        />
      </blockquote>
      {credit ? <figcaption className="mt-4 text-sm text-muted">{credit}</figcaption> : null}
    </figure>
  );
}
