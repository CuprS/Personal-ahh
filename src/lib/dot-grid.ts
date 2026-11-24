/**
 * Dot overlay for a block of text:
 *  - every word gets a dense patch of dots drawn right on it (following the text as it wraps)
 *  - everywhere else, a regular dot grid snapped to the box edges, with whole dots and equal margins
 *
 * Plain DOM code with no React, so the static preview can reuse it as-is.
 * Words are elements marked with `data-word` inside the root element.
 */

/** Margin grid step in px. Keep the box's padding and line height multiples of this. */
export const GRID_STEP = 16;
/** Dot spacing inside words in px. */
export const WORD_STEP = 4;

type Box = { x: number; y: number; w: number; h: number };

function cssColor(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

/** Measure the words and draw both dot layers for the current size. */
export function drawDotGrid(root: HTMLElement, canvas: HTMLCanvasElement): void {
  const width = root.clientWidth;
  const height = root.clientHeight;
  if (width === 0 || height === 0) return; // hidden right now; the resize observer redraws when shown

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Word boxes relative to the root's padding box. A word broken across lines has several boxes.
  const origin = root.getBoundingClientRect();
  const left = origin.left + root.clientLeft;
  const top = origin.top + root.clientTop;
  const boxes: Box[] = [];
  let wordsCovered = 0;
  root.querySelectorAll<HTMLElement>("[data-word]").forEach((word) => {
    let drawn = false;
    for (const r of Array.from(word.getClientRects())) {
      if (r.width < 1 || r.height < 1) continue;
      boxes.push({ x: r.left - left, y: r.top - top, w: r.width, h: r.height });
      drawn = true;
    }
    if (drawn) wordsCovered++;
  });

  // Margin grid: whole cells only, centred, so both margins match. When the box size is a
  // multiple of GRID_STEP (the component rounds its width; padding and line height are multiples),
  // the offsets are 0 and the grid lines up exactly with the box edges.
  const cols = Math.floor(width / GRID_STEP);
  const rows = Math.floor(height / GRID_STEP);
  const offsetX = (width - cols * GRID_STEP) / 2;
  const offsetY = (height - rows * GRID_STEP) / 2;
  const clearance = GRID_STEP / 4;
  const nearWord = (x: number, y: number) =>
    boxes.some(
      (b) =>
        x > b.x - clearance &&
        x < b.x + b.w + clearance &&
        y > b.y - clearance &&
        y < b.y + b.h + clearance,
    );

  ctx.globalAlpha = 0.55;
  ctx.fillStyle = cssColor(root, "--muted", "#6b665c");
  ctx.beginPath();
  for (let row = 0; row < rows; row++) {
    const y = offsetY + GRID_STEP / 2 + row * GRID_STEP;
    for (let col = 0; col < cols; col++) {
      const x = offsetX + GRID_STEP / 2 + col * GRID_STEP;
      if (nearWord(x, y)) continue;
      ctx.moveTo(x + 1.25, y);
      ctx.arc(x, y, 1.25, 0, Math.PI * 2);
    }
  }
  ctx.fill();

  // Word dots: a fine lattice centred inside each word box.
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = cssColor(root, "--accent", "#e4572e");
  ctx.beginPath();
  for (const b of boxes) {
    const nx = Math.max(1, Math.floor(b.w / WORD_STEP));
    const ny = Math.max(1, Math.floor(b.h / WORD_STEP));
    const startX = b.x + (b.w - (nx - 1) * WORD_STEP) / 2;
    const startY = b.y + (b.h - (ny - 1) * WORD_STEP) / 2;
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const x = startX + i * WORD_STEP;
        const y = startY + j * WORD_STEP;
        ctx.moveTo(x + 1, y);
        ctx.arc(x, y, 1, 0, Math.PI * 2);
      }
    }
  }
  ctx.fill();
  ctx.globalAlpha = 1;

  root.dataset.wordsCovered = String(wordsCovered);
  root.dataset.gridCols = String(cols);
  root.dataset.gridRows = String(rows);
  root.dataset.gridOffset = `${offsetX} ${offsetY}`;
}

/** Draw now, then redraw on resize, font loading and theme changes. Returns a cleanup function. */
export function watchDotGrid(root: HTMLElement, canvas: HTMLCanvasElement): () => void {
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => drawDotGrid(root, canvas));
  };

  const resize = new ResizeObserver(schedule);
  resize.observe(root);
  const scheme = window.matchMedia("(prefers-color-scheme: dark)");
  scheme.addEventListener("change", schedule);
  const theme = new MutationObserver(schedule);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  document.fonts.addEventListener("loadingdone", schedule);
  document.fonts.ready.then(schedule);
  schedule();

  return () => {
    cancelAnimationFrame(frame);
    resize.disconnect();
    scheme.removeEventListener("change", schedule);
    theme.disconnect();
    document.fonts.removeEventListener("loadingdone", schedule);
  };
}
