import type { GameState } from "@/game/state/model.ts";
import type { Deck } from "@/game/deck/mod.ts";
import type { Card } from "@/game/card/mod.ts";
import { EMPTY_SELECTION } from "@/game/selection/mod.ts";
import { drawCards } from "@/game/deck/mod.ts";
import { hasAnySet } from "@/game/set/mod.ts";

export function generateInitialState(deck: Deck): GameState {
  const cards = generateBoardCards(deck, 12);
  return {
    deck,
    board: { cards },
    selection: EMPTY_SELECTION,
  };
}

function generateBoardCards(deck: Deck, count: number): Card[] {
  const cards = drawCards(deck, count, []);

  if (hasAnySet(cards)) {
    return cards;
  }
  // ~96.8% success rate, rarely recurses
  return generateBoardCards(deck, count);
}
