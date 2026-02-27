import type { GameState } from '$lib/game/state/model';
import type { Deck } from '$lib/game/deck';
import type { Card } from '$lib/game/card';
import { EMPTY_SELECTION } from '$lib/game/selection';
import { drawCards } from '$lib/game/deck';
import { hasAnySet } from '$lib/game/set';
import { DifficultyLevel } from '$lib/game/difficulty';

export function generateInitialState(
	deck: Deck,
	boardSize: number = 12,
	difficulty: DifficultyLevel = DifficultyLevel.Hard
): GameState {
	const cards = generateBoardCards(deck, boardSize);
	return {
		deck,
		board: { cards },
		selection: EMPTY_SELECTION,
		difficulty
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
