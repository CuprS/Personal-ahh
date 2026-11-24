/**
 * Landing-page background video.
 *
 * The video layer is centred on an anchor element (the hero's "Scroll" cue) and scrolls with
 * the page, so it passes by and leaves the plain gradient behind it. Portrait screens get the
 * portrait crop and everything else gets the landscape crop. It plays muted on a loop while it
 * is on screen, and stays paused for visitors who prefer reduced motion.
 *
 * Plain DOM code with no React, so the static preview can reuse it as-is.
 *
 * Markup: a layer element with `data-anchor="<css selector>"` containing
 * `<video data-bg-video data-src-landscape data-src-portrait data-poster-landscape data-poster-portrait>`.
 */
export function watchBackgroundVideo(layer: HTMLElement): () => void {
  const video = layer.querySelector<HTMLVideoElement>("video[data-bg-video]");
  if (!video) return () => {};
  const portraitScreen = window.matchMedia("(max-aspect-ratio: 1/1)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let onScreen = true; // updated by the intersection observer below

  // Pick the crop for the current screen shape, then play (or pause for reduced motion).
  const choose = () => {
    const usePortrait = portraitScreen.matches && Boolean(video.dataset.srcPortrait);
    const src = (usePortrait ? video.dataset.srcPortrait : video.dataset.srcLandscape) ?? "";
    const poster = (usePortrait ? video.dataset.posterPortrait : video.dataset.posterLandscape) ?? "";
    if (video.dataset.current !== src) {
      video.dataset.current = src;
      if (poster) video.poster = poster;
      video.src = src;
    }
    // Phones only autoplay muted video, and React doesn't put `muted` in the server HTML.
    video.muted = true;
    // Pause once it has scrolled out of view (or the page is hidden) to save battery.
    if (reduceMotion.matches || !onScreen) video.pause();
    else video.play().catch(() => {});
  };

  // Move the layer so its centre lines up with the anchor's centre.
  const place = () => {
    const selector = layer.dataset.anchor;
    const anchor = selector ? document.querySelector(selector) : null;
    if (!anchor || layer.offsetParent === null) return; // hidden right now
    const a = anchor.getBoundingClientRect();
    const current = layer.getBoundingClientRect().top;
    const wanted = a.top + a.height / 2 - layer.offsetHeight / 2;
    const delta = wanted - current;
    if (Math.abs(delta) > 0.5) {
      layer.style.top = `${parseFloat(getComputedStyle(layer).top) + delta}px`;
    }
  };

  const onScreenShape = () => {
    choose();
    place();
  };

  choose();
  place();
  const resize = new ResizeObserver(place);
  resize.observe(document.body);
  resize.observe(layer);
  const visibility = new IntersectionObserver((entries) => {
    onScreen = entries[entries.length - 1].isIntersecting;
    choose();
  });
  visibility.observe(layer);
  window.addEventListener("resize", place);
  portraitScreen.addEventListener("change", onScreenShape);
  reduceMotion.addEventListener("change", choose);
  document.fonts.ready.then(place);

  return () => {
    resize.disconnect();
    visibility.disconnect();
    window.removeEventListener("resize", place);
    portraitScreen.removeEventListener("change", onScreenShape);
    reduceMotion.removeEventListener("change", choose);
  };
}
