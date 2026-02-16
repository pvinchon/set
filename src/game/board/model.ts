import type { Card } from "@/game/card/mod.ts";

export interface Board {
  readonly cards: readonly Card[];
}
