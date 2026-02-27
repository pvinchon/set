import type { GameState } from '$lib/game/state/model';
import { EMPTY_SELECTION, isComplete, toggleSelection } from '$lib/game/selection';
import { hasAnySet, isValidSet } from '$lib/game/set';
import { drawCards } from '$lib/game/deck';
import { replaceCards } from '$lib/game/board';

export type SelectionResult =
	| { type: 'selected'; state: GameState }
	| { type: 'valid_set'; state: GameState }
	| { type: 'invalid_set'; state: GameState };

export function selectCard(state: GameState, index: number): SelectionResult {
	const newSelection = toggleSelection(state.selection, index);

	if (!isComplete(newSelection)) {
		return {
			type: 'selected',
			state: { ...state, selection: newSelection }
		};
	}

	// 3 cards selected, validate the set
	const [i, j, k] = newSelection.indices as [number, number, number];
	const cards = state.board.cards;

	if (!isValidSet(cards[i], cards[j], cards[k])) {
		// Invalid set - clear selection
		return {
			type: 'invalid_set',
			state: { ...state, selection: EMPTY_SELECTION }
		};
	}

	// Valid set - replace cards with retry loop for set invariant
	const selectedIndices = [i, j, k] as [number, number, number];
	const remaining = cards.filter((_, idx) => !selectedIndices.includes(idx));

	function tryReplacement(): GameState {
		const newCards = drawCards(state.deck, 3, remaining) as [
			(typeof cards)[0],
			(typeof cards)[0],
			(typeof cards)[0]
		];
		const newBoard = replaceCards(state.board, selectedIndices, newCards);

		if (hasAnySet(newBoard.cards)) {
			return { ...state, board: newBoard, selection: EMPTY_SELECTION };
		}
		// ~96.8% success rate, rarely recurses
		return tryReplacement();
	}

	return {
		type: 'valid_set',
		state: tryReplacement()
	};
}
