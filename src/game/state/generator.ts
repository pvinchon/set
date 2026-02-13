import type { GameState } from "./model.ts";
import type { Deck } from "../deck/mod.ts";
import type { Card } from "../card/mod.ts";
import { EMPTY_SELECTION } from "../selection/mod.ts";
import { drawCards } from "../deck/mod.ts";
import { hasAnySet } from "../set/mod.ts";

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
