import type { Deck } from "@/game/deck/mod.ts";
import type { Board } from "@/game/board/mod.ts";
import type { Selection } from "@/game/selection/mod.ts";
import type { DifficultyLevel } from "@/game/difficulty/mod.ts";

export interface GameState {
  readonly deck: Deck;
  readonly board: Board;
  readonly selection: Selection;
  readonly difficulty: DifficultyLevel;
}
