import type { Board } from "@/game/board/model.ts";
import type { Card } from "@/game/card/mod.ts";

export function replaceCards(
  board: Board,
  selectedIndices: [number, number, number],
  newCards: [Card, Card, Card],
): Board {
  const cards = board.cards.map((card, i) => {
    const idx = selectedIndices.indexOf(i);
    return idx !== -1 ? newCards[idx] : card;
  });
  return { cards };
}
