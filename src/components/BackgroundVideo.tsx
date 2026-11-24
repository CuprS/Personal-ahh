"use client";

import { useEffect, useRef } from "react";
import type { BackgroundVideoConfig } from "@/lib/site";

/**
 * A muted, looping video fixed behind the page. Content scrolls over it; a dusk-coloured
 * scrim keeps text readable. Paused for visitors who prefer reduced motion.
 */
export function BackgroundVideo({ src, type, poster }: BackgroundVideoConfig) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      // React doesn't put `muted` in the server HTML, and phones only autoplay muted video,
      // so set it here and start playback ourselves.
      video.muted = true;
      if (reduceMotion.matches) video.pause();
      else video.play().catch(() => {});
    };
    sync();
    reduceMotion.addEventListener("change", sync);
    return () => reduceMotion.removeEventListener("change", sync);
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      <video
        ref={ref}
        data-bg-video
        className="size-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={poster}
      >
        <source src={src} type={type} />
      </video>
      <div className="video-scrim absolute inset-0" />
    </div>
  );
}
