import type { Deck } from "@/game/deck/model.ts";
import { createCard } from "@/game/card/mod.ts";
import { Color, Num, Shading, Shape } from "@/game/attributes/mod.ts";

export interface DeckOptions {
  readonly nums?: readonly Num[];
  readonly shapes?: readonly Shape[];
  readonly shadings?: readonly Shading[];
  readonly colors?: readonly Color[];
}

const ALL_NUMS = [Num.A, Num.B, Num.C] as const;
const ALL_SHAPES = [Shape.A, Shape.B, Shape.C] as const;
const ALL_SHADINGS = [Shading.A, Shading.B, Shading.C] as const;
const ALL_COLORS = [Color.A, Color.B, Color.C] as const;

function isValidAttributeCount(count: number): boolean {
  return count === 1 || count === 3;
}

export function createDeck(options?: DeckOptions): Deck {
  const nums = options?.nums ?? ALL_NUMS;
  const shapes = options?.shapes ?? ALL_SHAPES;
  const shadings = options?.shadings ?? ALL_SHADINGS;
  const colors = options?.colors ?? ALL_COLORS;

  if (
    !isValidAttributeCount(nums.length) ||
    !isValidAttributeCount(shapes.length) ||
    !isValidAttributeCount(shadings.length) ||
    !isValidAttributeCount(colors.length)
  ) {
    throw new Error(
      "Each attribute must have exactly 1 or 3 values to guarantee valid sets can be formed",
    );
  }

  const cards = [];
  for (const num of nums) {
    for (const shape of shapes) {
      for (const shading of shadings) {
        for (const color of colors) {
          cards.push(createCard(num, shape, shading, color));
        }
      }
    }
  }

  return { cards };
}
