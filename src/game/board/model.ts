import type { Card } from "../card/mod.ts";

export interface Board {
  readonly cards: readonly Card[];
}
