"use client";

import { useEffect, useRef } from "react";
import { watchBackgroundVideo } from "@/lib/background-video";
import type { BackgroundVideoConfig } from "@/lib/site";

/**
 * A muted, looping video behind the landing page, centred on the hero's "Scroll" cue.
 * It scrolls with the page and fades into the gradient at its top and bottom edges.
 * Placement, crop choice and playback live in src/lib/background-video.ts.
 */
export function BackgroundVideo({
  landscape,
  portrait,
  landscapePoster,
  portraitPoster,
  opacity = 0.35,
}: BackgroundVideoConfig) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return watchBackgroundVideo(ref.current);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      data-bg-video-layer
      data-anchor="[data-scroll-cue]"
      className="bg-video-layer pointer-events-none absolute inset-x-0 z-[-1] h-svh overflow-hidden"
    >
      <video
        data-bg-video
        data-src-landscape={landscape}
        data-src-portrait={portrait}
        data-poster-landscape={landscapePoster}
        data-poster-portrait={portraitPoster}
        className="size-full object-cover"
        style={{ opacity }}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  );
}
