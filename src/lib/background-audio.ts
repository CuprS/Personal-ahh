/**
 * Soft background music for a page.
 *
 * Browsers only allow sound after the visitor interacts, so the music fades in on their first
 * tap, click or key press on the page. A toggle button turns it off and on. It also steps aside
 * when the visitor starts using an embedded video (focus moves into an iframe), pauses while the
 * browser tab or the page itself is hidden, and stops on cleanup (leaving the page).
 *
 * Markup: a root marked `data-background-audio` (optional `data-volume`, 0 to 1, default 1; keep
 * the file itself mastered soft, since iPhones ignore volume changes) containing
 * `<audio data-audio loop>` and `<button data-audio-toggle>` with `[data-icon-on]`,
 * `[data-icon-off]` and `[data-audio-label]` inside.
 *
 * Plain DOM code with no React, so the static preview can reuse it as-is.
 */
export function watchBackgroundAudio(root: HTMLElement): () => void {
  const audio = root.querySelector<HTMLAudioElement>("audio[data-audio]");
  const toggle = root.querySelector<HTMLButtonElement>("[data-audio-toggle]");
  if (!audio || !toggle) return () => {};
  const requested = parseFloat(root.dataset.volume ?? "");
  const volume = Number.isFinite(requested) ? Math.min(1, Math.max(0, requested)) : 1;

  // waiting: starts at the first interaction · on: playing (or will, when shown) · off: silenced
  let state: "waiting" | "on" | "off" = "waiting";
  let fade = 0;

  const rendered = () => root.getClientRects().length > 0; // false inside a hidden page
  const canPlay = () => state === "on" && rendered() && !document.hidden;

  const render = () => {
    const on = state !== "off";
    toggle.setAttribute("aria-pressed", String(on));
    toggle.setAttribute("aria-label", on ? "Turn background music off" : "Turn background music on");
    root.querySelector("[data-icon-on]")?.toggleAttribute("hidden", !on);
    root.querySelector("[data-icon-off]")?.toggleAttribute("hidden", on);
    const label = root.querySelector("[data-audio-label]");
    if (label) label.textContent = on ? "Music on" : "Music off";
    root.dataset.state = state;
  };

  const fadeTo = (to: number, ms: number) => {
    cancelAnimationFrame(fade);
    const from = audio.volume;
    const start = performance.now();
    const step = (now: number) => {
      // Frame timestamps can be slightly earlier than `start`, so clamp both ends.
      const t = Math.min(1, Math.max(0, (now - start) / ms));
      audio.volume = Math.min(1, Math.max(0, from + (to - from) * t));
      if (t < 1) fade = requestAnimationFrame(step);
    };
    fade = requestAnimationFrame(step);
  };

  const play = () => {
    if (!canPlay() || !audio.paused) return;
    audio.volume = 0;
    audio
      .play()
      .then(() => fadeTo(volume, 1500))
      .catch(() => {});
  };
  const pause = () => {
    cancelAnimationFrame(fade);
    audio.pause();
  };
  const sync = () => (canPlay() ? play() : pause());

  const stopListening = () => {
    document.removeEventListener("pointerup", onFirstInteraction, true);
    document.removeEventListener("keydown", onFirstInteraction, true);
  };
  // Pointer-up (taps and clicks) and key presses count as user activation for audio.
  function onFirstInteraction(e: Event) {
    if (state !== "waiting" || !rendered()) return;
    const target = e.target as Element | null;
    if (target?.closest?.("[data-audio-toggle]")) return; // the button decides for itself
    state = "on";
    stopListening();
    render();
    play();
  }

  const onToggle = () => {
    state = state === "off" ? "on" : "off";
    stopListening();
    render();
    sync();
  };

  // Starting the embedded video moves focus into its iframe: step aside so they don't overlap.
  const onWindowBlur = () => {
    setTimeout(() => {
      if (document.activeElement instanceof HTMLIFrameElement && state !== "off") {
        state = "off";
        stopListening();
        render();
        pause();
      }
    }, 0);
  };

  const shown = new IntersectionObserver(sync);
  shown.observe(root);
  document.addEventListener("pointerup", onFirstInteraction, true);
  document.addEventListener("keydown", onFirstInteraction, true);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("blur", onWindowBlur);
  toggle.addEventListener("click", onToggle);
  render();

  return () => {
    stopListening();
    shown.disconnect();
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener("blur", onWindowBlur);
    toggle.removeEventListener("click", onToggle);
    pause();
  };
}
