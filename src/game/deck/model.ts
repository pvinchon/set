import type { Card } from "../card/mod.ts";

export interface Deck {
  readonly cards: readonly Card[];
}
