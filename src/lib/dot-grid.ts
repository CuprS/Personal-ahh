/**
 * Dot overlay for a block of text:
 *  - every word gets a dense patch of dots drawn right on it (following the text as it wraps)
 *  - everywhere else, a regular dot grid snapped to the box edges, with whole dots and equal margins
 *  - every word lower on the screen than the cursor line is blacked out with its own bar.
 *    The cursor line is the mouse on devices that can hover, and the middle of the screen
 *    on touch devices. It refreshes on mouse movement, scrolling and resizing.
 *  - a sideways egg-shaped gradient with visible contour lines sits above the whole page
 *    (between the cursor and everything else), wide enough to reach past the end of the text.
 *    It is centred on the first word of the line just above the one halfway between the top of
 *    the screen and the cursor line, or on the story's first word while there is no cursor.
 *    Only paragraph lines count: it never anchors on a heading such as the story's title.
 *    It is cut away over any element marked `data-egg-clear` (such as the survey under the
 *    story), so those stay untouched by it.
 *
 * Dots are painted on a canvas only when the layout changes. Blackout bars are plain elements
 * toggled on and off, and the egg is a small full-screen canvas, so mouse movement and
 * scrolling stay cheap even for long texts.
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

/** Number of contour lines in the egg gradient. */
const EGG_RINGS = 8;

type Box = {
  x: number;
  y: number;
  w: number;
  h: number;
  word: string;
  /** Part of a heading (h1–h6). The egg never anchors on headings. */
  heading: boolean;
};
/** A visual line of text: its top, height and leftmost word box. */
type Line = { y: number; h: number; first: Box };

export type DotGridLayout = {
  width: number;
  height: number;
  /** Word boxes relative to the root's padding box (unaffected by scrolling). */
  boxes: Box[];
  /** Paragraph lines of the first text column, top to bottom (the egg anchors on these). */
  lines: Line[];
  /** Right edge of the rightmost word, in root coordinates. */
  textRight: number;
  cols: number;
  rows: number;
  offsetX: number;
  offsetY: number;
};

/** Group word boxes into visual lines (same top, within 2px) and keep each line's leftmost box. */
function groupLines(boxes: Box[]): Line[] {
  const sorted = [...boxes].sort((p, q) => p.y - q.y);
  const lines: Line[] = [];
  for (const b of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(b.y - last.y) <= 2) {
      if (b.x < last.first.x) last.first = b;
    } else {
      lines.push({ y: b.y, h: b.h, first: b });
    }
  }
  return lines;
}

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
      boxes.push({
        x: r.left - left,
        y: r.top - top,
        w: r.width,
        h: r.height,
        word: word.textContent ?? "",
        heading: word.closest("h1, h2, h3, h4, h5, h6") !== null,
      });
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

  // Text columns: when the text flows into several columns (an element marked `data-columns`
  // with a CSS column count), the egg anchors on lines of the first column only, so two
  // columns' lines at the same height don't get mixed up.
  const flow = root.querySelector<HTMLElement>("[data-columns]");
  const flowStyle = flow ? getComputedStyle(flow) : null;
  const columns = flowStyle ? parseInt(flowStyle.columnCount, 10) || 1 : 1;
  let firstColumn = boxes;
  if (flow && flowStyle && columns > 1) {
    const f = flow.getBoundingClientRect();
    const gap = parseFloat(flowStyle.columnGap) || 0;
    const columnRight = f.left - left + (f.width - gap * (columns - 1)) / columns;
    firstColumn = boxes.filter((b) => b.x < columnRight + gap / 2);
  }

  root.dataset.wordsCovered = String(wordsCovered);
  root.dataset.columns = String(columns);
  root.dataset.gridCols = String(cols);
  root.dataset.gridRows = String(rows);
  root.dataset.gridOffset = `${offsetX} ${offsetY}`;
  // The egg anchors on paragraph lines only, never on a heading such as the story's title.
  const anchorLines = groupLines(firstColumn.filter((b) => !b.heading));
  const textRight = boxes.reduce((right, b) => Math.max(right, b.x + b.w), 0);
  return { width, height, boxes, lines: anchorLines, textRight, cols, rows, offsetX, offsetY };
}

/** Trace a sideways egg: broad on the left, narrowing to the right, centred on (cx, cy). */
function eggPath(ctx: CanvasRenderingContext2D, cx: number, cy: number, a: number, b: number): void {
  const taper = 0.3;
  const steps = 96;
  ctx.moveTo(cx + a, cy);
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    ctx.lineTo(cx + a * Math.cos(t), cy + b * Math.sin(t) * (1 - taper * Math.cos(t)));
  }
  ctx.closePath();
}

/**
 * Paint the egg gradient on a full-screen canvas: banded fills that build up toward the centre,
 * plus a visible contour line around each band. (cx, cy) are viewport coordinates.
 */
export function paintEgg(
  canvas: HTMLCanvasElement,
  colorSource: Element,
  cx: number,
  cy: number,
  /** The outer ring reaches at least this far to the right (e.g. past the end of the text). */
  minReach = 0,
  /** Viewport boxes to leave untouched: the egg is cut away over each one. */
  clear: ClearBox[] = [],
): void {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (width === 0 || height === 0) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.round(width * dpr);
  const pixelHeight = Math.round(height * dpr);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // Wide and low: about three times as wide as it is tall. When the text reaches further than
  // that, the egg widens to take it all in and grows taller in proportion, keeping its shape.
  const baseA = Math.min(900, Math.max(300, width * 0.55));
  const baseB = Math.min(560, Math.max(220, width * 0.35)) * 0.5;
  const a = Math.max(baseA, minReach); // outer horizontal radius
  const b = baseB * (a / baseA); // outer vertical radius
  canvas.dataset.radius = `${a.toFixed(1)} ${b.toFixed(1)}`;
  ctx.fillStyle = ctx.strokeStyle = cssColor(colorSource, "--accent", "#ff8a5c");

  // Gradient: each band adds a little colour, so it deepens toward the word.
  ctx.globalAlpha = 0.06;
  for (let i = EGG_RINGS; i >= 1; i--) {
    ctx.beginPath();
    eggPath(ctx, cx, cy, (a * i) / EGG_RINGS, (b * i) / EGG_RINGS);
    ctx.fill();
  }
  // Contour lines: brightest near the word, fading outward.
  ctx.lineWidth = 1.25;
  for (let i = 1; i <= EGG_RINGS; i++) {
    ctx.globalAlpha = 0.8 - (0.5 * (i - 1)) / (EGG_RINGS - 1);
    ctx.beginPath();
    eggPath(ctx, cx, cy, (a * i) / EGG_RINGS, (b * i) / EGG_RINGS);
    ctx.stroke();
  }
  // Cut the egg away over the boxes it must leave alone (1px wider for their outline).
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "destination-out";
  for (const box of clear) ctx.fillRect(box.x - 1, box.y - 1, box.w + 2, box.h + 2);
  ctx.globalCompositeOperation = "source-over";
}

/** A box in viewport coordinates. */
export type ClearBox = { x: number; y: number; w: number; h: number };

/** The on-screen boxes of every `data-egg-clear` element (hidden ones are skipped). */
function eggClearBoxes(): ClearBox[] {
  const boxes: ClearBox[] = [];
  for (const el of document.querySelectorAll("[data-egg-clear]")) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight) {
      boxes.push({ x: r.left, y: r.top, w: r.width, h: r.height });
    }
  }
  return boxes;
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

  // Egg gradient: a full-screen canvas above everything on the page (it ignores clicks).
  const egg = document.createElement("canvas");
  egg.setAttribute("aria-hidden", "true");
  egg.dataset.eggGradient = "";
  egg.style.cssText =
    "position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:60;mix-blend-mode:screen;display:none";
  document.body.appendChild(egg);
  let lastEgg = "";

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
    if (!layout) {
      // Hidden; the resize observer re-measures when it shows again.
      egg.style.display = "none";
      lastEgg = "";
      return;
    }
    const rect = root.getBoundingClientRect();
    const originX = rect.left + root.clientLeft;
    const originY = rect.top + root.clientTop;
    const clientY = cursorClientY();

    // Blackout: bars from the first one whose top is at or below the cursor line
    // (binary search; barTops is sorted).
    if (clientY === null) {
      showFrom(bars.length);
    } else {
      const cutoff = clientY - originY;
      let lo = 0;
      let hi = barTops.length;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (barTops[mid] >= cutoff) hi = mid;
        else lo = mid + 1;
      }
      showFrom(lo);
    }

    // Egg: one line above the line nearest the point halfway between the top of the screen
    // and the cursor line, on its first word. It stops at the story's first line, which is
    // also where it sits while there is no cursor.
    const lines = layout.lines;
    if (lines.length === 0) return;
    let middle = 0;
    if (clientY !== null) {
      const target = clientY / 2 - originY;
      let best = Infinity;
      for (let i = 0; i < lines.length; i++) {
        const distance = Math.abs(lines[i].y + lines[i].h / 2 - target);
        if (distance < best) {
          best = distance;
          middle = i;
        }
      }
    }
    const line = Math.max(0, Math.min(middle - 1, lines.length - 1));
    const first = lines[line].first;
    const cx = originX + first.x + first.w / 2;
    const cy = originY + first.y + first.h / 2;
    egg.style.display = "block";
    // Reach past the end of the text (both columns on wide screens) by a few grid steps.
    const reach = originX + layout.textRight - cx + GRID_STEP * 3;
    const clear = eggClearBoxes();
    const clearKey = clear.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)},${c.w.toFixed(1)},${c.h.toFixed(1)}`).join(";");
    const key = `${cx.toFixed(1)} ${cy.toFixed(1)} ${reach.toFixed(1)} ${egg.clientWidth}x${egg.clientHeight} ${clearKey}`;
    if (key !== lastEgg) {
      lastEgg = key;
      paintEgg(egg, root, cx, cy, reach, clear);
      egg.dataset.anchorLine = String(line);
      egg.dataset.anchorWord = first.word;
      egg.dataset.center = `${cx.toFixed(1)} ${cy.toFixed(1)}`;
    }
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
  // Boxes the egg stays off: repaint when one changes size (e.g. a message appears in it).
  const clearResize = new ResizeObserver(schedule);
  document.querySelectorAll("[data-egg-clear]").forEach((el) => clearResize.observe(el));
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
    clearResize.disconnect();
    theme.disconnect();
    darkScheme.removeEventListener("change", remeasure);
    canHover.removeEventListener("change", schedule);
    document.fonts.removeEventListener("loadingdone", remeasure);
    window.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("mouseout", onMouseOut);
    window.removeEventListener("scroll", schedule, { capture: true });
    window.removeEventListener("resize", schedule);
    layer.remove();
    egg.remove();
  };
}
