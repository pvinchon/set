import type { Card } from "@/game/card/model.ts";
import { cx } from "@/utils/cx.ts";
import {
  renderColor,
  renderNum,
  renderShading,
  renderShape,
} from "@/game/attributes/mod.ts";
import { rand } from "@/utils/random.ts";

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
  "transition-all",
  "duration-200",
  "ease-[cubic-bezier(0.34,1.56,0.64,1)]",
  "hover:shadow-2xl",
  "active:shadow-sm",
].join(" ");

const SELECTED_CLASSES = [
  "scale-[1.05]",
  "border-blue-500",
  "border-[3px]",
  "ring-4",
  "ring-blue-500/30",
  "shadow-lg",
  "shadow-blue-500/25",
].join(" ");

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

export function renderCard(card: Card, selected = false): HTMLElement {
  const el = document.createElement("div");
  el.className = cardClassName(selected);

  // Randomized hover: each mouseenter picks slightly different lift/tilt/scale
  el.addEventListener("mouseenter", () => {
    const baseLift = -3, liftVariance = 1; // -2 to -4px
    const lift = baseLift + rand(-liftVariance, liftVariance);
    const tilt = rand(-2, 2); // -2 to 2deg
    const baseScale = 1.05, scaleVariance = 0.02; // 1.03 to 1.07
    const scale = baseScale + rand(-scaleVariance, scaleVariance);
    el.style.transform = `translateY(${lift.toFixed(1)}px) rotate(${
      tilt.toFixed(1)
    }deg) scale(${scale.toFixed(3)})`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.removeProperty("transform");
  });

  // Active press-down (applied on pointerdown, cleared on pointerup/leave)
  el.addEventListener("pointerdown", () => {
    const tilt = rand(-0.8, 0.8); // -0.8 to 0.8deg
    el.style.transform = `translateY(1px) rotate(${
      tilt.toFixed(1)
    }deg) scale(0.92)`;
  });
  el.addEventListener("pointerup", () => {
    el.style.removeProperty("transform");
  });

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
