import type { Card } from "./model.ts";
import { COLOR_HEX, getShadingStyle, shapePath } from "../attributes/mod.ts";

const CARD_BASE_CLASSES = [
  "card",
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

function createShapeSVG(card: Card, index: number): string {
  const color = COLOR_HEX[card.color];
  const path = shapePath(card.shape, 80, 80);
  const patternId = `stripe-${index}`;
  const style = getShadingStyle(card.shading, color, patternId);

  return `
    <svg viewBox="0 0 80 80" class="w-10 h-10">
      ${style.defs ?? ""}
      <path d="${path}" fill="${style.fill}" stroke="${style.stroke}" stroke-width="2"/>
    </svg>
  `;
}

export function renderCard(
  card: Card,
  index: number,
  isSelected: boolean,
): HTMLElement {
  const el = document.createElement("div");
  el.className = isSelected
    ? `${CARD_BASE_CLASSES} selected`
    : CARD_BASE_CLASSES;
  el.dataset.index = String(index);

  // Number of shapes (1, 2, or 3)
  const count = card.num + 1;
  const shapes = Array.from(
    { length: count },
    (_, i) => createShapeSVG(card, index * 3 + i),
  ).join("");

  el.innerHTML = shapes;
  return el;
}
