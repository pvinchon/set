import type { Deck } from '$lib/game/deck';
import type { Board } from '$lib/game/board';
import type { Selection } from '$lib/game/selection';
import type { DifficultyLevel } from '$lib/game/difficulty';

export interface GameState {
	readonly deck: Deck;
	readonly board: Board;
	readonly selection: Selection;
	readonly difficulty: DifficultyLevel;
}
