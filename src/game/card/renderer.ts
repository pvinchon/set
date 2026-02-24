import type { Card } from "@/game/card/model.ts";
import { cx } from "@/utils/cx.ts";
import {
  renderColor,
  renderNum,
  renderShading,
  renderShape,
} from "@/game/attributes/mod.ts";

import { getPositionFactor } from "@/utils/grid.ts";

/** Selection transform intensities. */
const SEL = {
  rotateDeg: 4,
  translateXPx: 6,
  translateYPx: -8,
  scale: 1.08,
  hoverRatio: 1 / 3,
  pressDownTranslateYPx: 3,
  pressDownScale: 0.92,
} as const;

/** Build a CSS transform string for a given position factor and intensity (1 = selected, 1/3 = hover). */
function computeTransform(factor: number, intensity: number): string {
  const rotate = factor * SEL.rotateDeg * intensity;
  const tx = factor * SEL.translateXPx * intensity;
  const ty = SEL.translateYPx * intensity;
  const scale = 1 + (SEL.scale - 1) * intensity;
  return `translateX(${tx.toFixed(1)}px) translateY(${
    ty.toFixed(1)
  }px) rotate(${rotate.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
}

/** Apply (or clear) the position-based selection transform on a card element. */
export function applySelectionTransform(
  el: HTMLElement,
  index: number,
  selected: boolean,
): void {
  if (selected) {
    el.dataset.selected = "1";
    el.style.transform = computeTransform(getPositionFactor(index, el), 1);
  } else {
    delete el.dataset.selected;
    el.style.removeProperty("transform");
  }
}

const CARD_BASE_CLASSES = [
  "aspect-[2/3]",
  "bg-white",
  "border-2",
  "border-gray-300",
  "rounded-xl",
  "shadow-md",
  "cursor-pointer",
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "gap-1",
  "p-2",
  "touch-manipulation",
  "transition-all",
  "duration-200",
  "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  "active:shadow-sm",
].join(" ");

const SELECTED_CLASSES = "shadow-lg";

const SVG_CLASSES = [
  "w-10",
  "h-10",
].join(" ");

/** Compute card className without creating a DOM element. */
export function cardClassName(selected = false): string {
  return cx(CARD_BASE_CLASSES, selected && SELECTED_CLASSES);
}

function createBaseSVG(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", SVG_CLASSES);

  return svg;
}

function restoreTransform(el: HTMLElement): void {
  if (el.dataset.selected) {
    const idx = Number(el.dataset.index ?? 0);
    applySelectionTransform(el, idx, true);
  } else {
    el.style.removeProperty("transform");
  }
}

export function renderCard(
  card: Card,
  selected = false,
  index = 0,
): HTMLElement {
  const el = document.createElement("div");
  el.className = cardClassName(selected);

  // Apply position-based selection transform
  applySelectionTransform(el, index, selected);

  // Hover: reduced-intensity position-based transform (mouse/pen only)
  el.addEventListener("pointerenter", (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (el.dataset.selected) return;
    const idx = Number(el.dataset.index ?? 0);
    el.style.transform = computeTransform(
      getPositionFactor(idx, el),
      SEL.hoverRatio,
    );
  });

  el.addEventListener("pointerleave", (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    if (el.dataset.selected) return;
    el.style.removeProperty("transform");
  });

  // Active press-down
  el.addEventListener("pointerdown", (e: PointerEvent) => {
    el.style.transform =
      `translateY(${SEL.pressDownTranslateYPx}px) scale(${SEL.pressDownScale})`;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      // Ignore errors from setPointerCapture (e.g., unsupported environments).
    }
  });
  el.addEventListener("pointerup", () => restoreTransform(el));
  el.addEventListener("pointercancel", () => restoreTransform(el));

  let svgs: SVGSVGElement[] = [createBaseSVG()];
  svgs = renderShape(card.shape, svgs);
  svgs = renderColor(card.color, svgs);
  svgs = renderShading(card.shading, svgs);
  svgs = renderNum(card.num, svgs);

  for (const svg of svgs) {
    el.appendChild(svg);
  }

  return el;
}
