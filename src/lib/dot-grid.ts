/**
 * Dot overlay for a block of text:
 *  - every word gets a dense patch of dots drawn right on it (following the text as it wraps)
 *  - everywhere else, a regular dot grid snapped to the box edges, with whole dots and equal margins
 *  - every word lower on the screen than the cursor line is blacked out with its own bar.
 *    The cursor line is the mouse on devices that can hover, and the middle of the screen
 *    on touch devices. It refreshes on mouse movement, scrolling and resizing.
 *
 * Dots are painted on a canvas only when the layout changes. Blackout bars are plain elements
 * toggled on and off, so mouse movement and scrolling stay cheap even for long texts.
 *
 * Plain DOM code with no React, so the static preview can reuse it as-is.
 * Words are elements marked with `data-word` inside the root element.
 */

/** Margin grid step in px. Keep the box's padding and line heights multiples of this. */
export const GRID_STEP = 16;
/** Dot spacing inside words in px. */
export const WORD_STEP = 4;
/** Canvas pixel budget. iOS Safari refuses to draw canvases above about 16.7M pixels. */
const MAX_CANVAS_PIXELS = 12000000;

type Box = { x: number; y: number; w: number; h: number };

export type DotGridLayout = {
  width: number;
  height: number;
  /** Word boxes relative to the root's padding box (unaffected by scrolling). */
  boxes: Box[];
  cols: number;
  rows: number;
  offsetX: number;
  offsetY: number;
};

function cssColor(el: Element, name: string, fallback: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim() || fallback;
}

/** Measure word boxes and the snapped grid. Returns null while the root is hidden. */
export function measureDotGrid(root: HTMLElement): DotGridLayout | null {
  const width = root.clientWidth;
  const height = root.clientHeight;
  if (width === 0 || height === 0) return null;

  // A word broken across lines has several boxes.
  const origin = root.getBoundingClientRect();
  const left = origin.left + root.clientLeft;
  const top = origin.top + root.clientTop;
  const boxes: Box[] = [];
  let wordsCovered = 0;
  root.querySelectorAll<HTMLElement>("[data-word]").forEach((word) => {
    let found = false;
    for (const r of Array.from(word.getClientRects())) {
      if (r.width < 1 || r.height < 1) continue;
      boxes.push({ x: r.left - left, y: r.top - top, w: r.width, h: r.height });
      found = true;
    }
    if (found) wordsCovered++;
  });

  // Whole cells only, centred, so both margins match. When the box size is a multiple of
  // GRID_STEP (the component rounds its width; padding and line heights are multiples),
  // the offsets are 0 and the grid lines up exactly with the box edges.
  const cols = Math.floor(width / GRID_STEP);
  const rows = Math.floor(height / GRID_STEP);
  const offsetX = (width - cols * GRID_STEP) / 2;
  const offsetY = (height - rows * GRID_STEP) / 2;

  root.dataset.wordsCovered = String(wordsCovered);
  root.dataset.gridCols = String(cols);
  root.dataset.gridRows = String(rows);
  root.dataset.gridOffset = `${offsetX} ${offsetY}`;
  return { width, height, boxes, cols, rows, offsetX, offsetY };
}

/** Paint the margin grid and the dots on every word. */
export function paintDotGrid(root: HTMLElement, canvas: HTMLCanvasElement, layout: DotGridLayout): void {
  const { width, height, boxes, cols, rows, offsetX, offsetY } = layout;
  const budget = Math.sqrt(MAX_CANVAS_PIXELS / (width * height));
  const dpr = Math.min(window.devicePixelRatio || 1, budget);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Margin grid, skipping anything near a word.
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
}

/**
 * Keep the overlay current: re-measure and repaint dots on resize, font loading and theme
 * changes; move the blackout line on mouse movement, scrolling and viewport resizes.
 * Returns a cleanup function.
 */
export function watchDotGrid(root: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const canHover = window.matchMedia("(hover: hover)");
  const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Blackout bars live in a layer above the canvas, one bar per word box.
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.dataset.blackoutLayer = "";
  layer.style.cssText = "position:absolute;inset:0;pointer-events:none;overflow:hidden";
  root.appendChild(layer);
  let bars: HTMLDivElement[] = []; // sorted by box top
  let barTops: number[] = [];
  let firstBlacked = 0; // bars[firstBlacked..] are shown

  let layout: DotGridLayout | null = null;
  let needsMeasure = true;
  let mouseY: number | null = null;
  let frame = 0;

  const buildBars = (boxes: Box[]) => {
    const sorted = [...boxes].sort((a, b) => a.y - b.y);
    layer.replaceChildren();
    bars = sorted.map((b) => {
      const bar = document.createElement("div");
      bar.style.cssText = `position:absolute;background:#000;display:none;left:${b.x - 0.5}px;top:${b.y - 0.5}px;width:${b.w + 1}px;height:${b.h + 1}px`;
      layer.appendChild(bar);
      return bar;
    });
    barTops = sorted.map((b) => b.y);
    firstBlacked = bars.length;
  };

  // Show bars from index `start` on (everything at or below the cursor line), hide the rest.
  const showFrom = (start: number) => {
    for (let i = Math.min(start, firstBlacked); i < Math.max(start, firstBlacked); i++) {
      bars[i].style.display = i >= start ? "block" : "none";
    }
    firstBlacked = start;
    root.dataset.blackedOut = String(bars.length - start);
  };

  // Cursor line in viewport coordinates: the mouse where hovering exists, else mid-screen.
  const cursorClientY = (): number | null =>
    canHover.matches ? mouseY : window.innerHeight / 2;

  const update = () => {
    frame = 0;
    if (needsMeasure) {
      needsMeasure = false;
      layout = measureDotGrid(root);
      if (layout) {
        paintDotGrid(root, canvas, layout);
        buildBars(layout.boxes);
      }
    }
    if (!layout) return; // hidden; the resize observer re-measures when it shows again
    const clientY = cursorClientY();
    if (clientY === null) {
      showFrom(bars.length);
      return;
    }
    const cutoff = clientY - (root.getBoundingClientRect().top + root.clientTop);
    // First bar whose top is at or below the cursor line (binary search; barTops is sorted).
    let lo = 0;
    let hi = barTops.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (barTops[mid] >= cutoff) hi = mid;
      else lo = mid + 1;
    }
    showFrom(lo);
  };

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const remeasure = () => {
    needsMeasure = true;
    schedule();
  };
  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    // Browsers also send zero-movement events when the layout shifts under a resting cursor.
    // Wait for a real movement before starting, so the effect begins when the user moves.
    if (mouseY === null && e.movementX === 0 && e.movementY === 0) return;
    mouseY = e.clientY;
    schedule();
  };
  const onMouseOut = (e: MouseEvent) => {
    if (e.relatedTarget) return; // still inside the page
    mouseY = null;
    schedule();
  };

  const resize = new ResizeObserver(remeasure);
  resize.observe(root);
  const theme = new MutationObserver(remeasure);
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  darkScheme.addEventListener("change", remeasure);
  canHover.addEventListener("change", schedule);
  document.fonts.addEventListener("loadingdone", remeasure);
  document.fonts.ready.then(remeasure);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("mouseout", onMouseOut);
  window.addEventListener("scroll", schedule, { passive: true, capture: true });
  window.addEventListener("resize", schedule);
  schedule();

  return () => {
    if (frame) cancelAnimationFrame(frame);
    resize.disconnect();
    theme.disconnect();
    darkScheme.removeEventListener("change", remeasure);
    canHover.removeEventListener("change", schedule);
    document.fonts.removeEventListener("loadingdone", remeasure);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("mouseout", onMouseOut);
    window.removeEventListener("scroll", schedule, { capture: true });
    window.removeEventListener("resize", schedule);
    layer.remove();
  };
}
