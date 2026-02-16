import type { Deck } from "@/game/deck/model.ts";
import type { Card } from "@/game/card/mod.ts";
import { cardEquals } from "@/game/card/mod.ts";

export function drawCards(
  deck: Deck,
  count: number,
  exclude: readonly Card[],
): Card[] {
  const available = deck.cards.filter(
    (c) => !exclude.some((e) => cardEquals(c, e)),
  );
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
