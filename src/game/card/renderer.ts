import type { Card } from "@/game/card/model.ts";
import { cx } from "@/utils/cx.ts";
import {
  renderColor,
  renderNum,
  renderShading,
  renderShape,
} from "@/game/attributes/mod.ts";

const CARD_BASE_CLASSES = [
  "aspect-[2/3]",
  "bg-white",
  "border-2",
  "border-gray-300",
  "rounded-lg",
  "cursor-pointer",
  "flex",
  "flex-col",
  "items-center",
  "justify-center",
  "gap-1",
  "p-2",
  "transition-all",
  "duration-150",
  "ease-in-out",
  "hover:-translate-y-0.5",
  "hover:shadow-lg",
].join(" ");

const SELECTED_CLASSES = [
  "border-blue-500",
  "ring-3",
  "ring-blue-500/30",
  "group-data-[feedback=valid]:border-green-600",
  "group-data-[feedback=valid]:ring-green-600/40",
  "group-data-[feedback=invalid]:border-red-600",
  "group-data-[feedback=invalid]:ring-red-600/40",
  "group-data-[feedback=invalid]:animate-shake",
].join(" ");

const SVG_CLASSES = [
  "w-10",
  "h-10",
].join(" ");

function createBaseSVG(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", SVG_CLASSES);

  return svg;
}

export function renderCard(card: Card, selected = false): HTMLElement {
  const el = document.createElement("div");
  el.className = cx(CARD_BASE_CLASSES, selected && SELECTED_CLASSES);

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
