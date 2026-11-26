"use client";

import { useEffect, useRef } from "react";
import { watchBackgroundAudio } from "@/lib/background-audio";

/**
 * Soft looping background music with an on/off button. It starts on the visitor's first tap,
 * click or key press (browsers block sound before that). The button sticks to the bottom of the
 * screen while the page scrolls and rests above the footer at the end. Behaviour lives in
 * src/lib/background-audio.ts.
 */
export function BackgroundAudio({ src, volume = 1 }: { src: string; volume?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return watchBackgroundAudio(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      data-background-audio
      data-volume={volume}
      className="pointer-events-none sticky bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-10 mt-12 flex justify-end"
    >
      <audio data-audio src={src} loop preload="auto" />
      <button
        type="button"
        data-audio-toggle
        aria-pressed="true"
        aria-label="Turn background music off"
        className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/90 px-4 py-2 text-sm text-foreground shadow-lg backdrop-blur transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span data-icon-on aria-hidden className="text-accent">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
            <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
          </svg>
        </span>
        <span data-icon-off hidden aria-hidden className="text-muted">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor" />
            <path d="m16 9 5 6M21 9l-5 6" />
          </svg>
        </span>
        <span data-audio-label>Music on</span>
      </button>
    </div>
  );
}
