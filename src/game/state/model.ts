import type { Deck } from "../deck/mod.ts";
import type { Board } from "../board/mod.ts";
import type { Selection } from "../selection/mod.ts";

export interface GameState {
  readonly deck: Deck;
  readonly board: Board;
  readonly selection: Selection;
}
