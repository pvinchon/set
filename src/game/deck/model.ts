import type { Card } from "@/game/card/mod.ts";

export interface Deck {
  readonly cards: readonly Card[];
}
