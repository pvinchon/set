import { expect, test } from 'vitest';
import { selectCard } from '$lib/game/state/actions';
import { generateInitialState } from '$lib/game/state/generator';
import { createDeck } from '$lib/game/deck';
import { hasAnySet, isValidSet } from '$lib/game/set';
import { createCard } from '$lib/game/card';
import { Color, Num, Shading, Shape } from '$lib/game/attributes';
import type { GameState } from '$lib/game/state/model';
import type { Board } from '$lib/game/board';
import { DifficultyLevel } from '$lib/game/difficulty';

function createTestState(): GameState {
	const deck = createDeck();
	return generateInitialState(deck);
}

// Helper to create a board with known valid set at indices 0, 1, 2
function createBoardWithKnownSet(): Board {
	return {
		cards: [
			// Valid set at 0, 1, 2 (all different everything)
			createCard(Num.A, Shape.A, Shading.A, Color.A),
			createCard(Num.B, Shape.B, Shading.B, Color.B),
			createCard(Num.C, Shape.C, Shading.C, Color.C),
			// Fill rest with cards that don't form sets with above
			createCard(Num.A, Shape.A, Shading.A, Color.B),
			createCard(Num.A, Shape.A, Shading.B, Color.A),
			createCard(Num.A, Shape.B, Shading.A, Color.A),
			createCard(Num.B, Shape.A, Shading.A, Color.A),
			createCard(Num.A, Shape.A, Shading.B, Color.B),
			createCard(Num.A, Shape.B, Shading.A, Color.B),
			createCard(Num.B, Shape.A, Shading.A, Color.B),
			createCard(Num.A, Shape.B, Shading.B, Color.A),
			createCard(Num.B, Shape.A, Shading.B, Color.A)
		]
	};
}

test('selectCard: first selection returns selected state', () => {
	const state = createTestState();
	const result = selectCard(state, 5);

	expect(result.type).toEqual('selected');
	expect(result.state.selection.indices).toEqual([5]);
});

test('selectCard: second selection returns selected state', () => {
	const state = createTestState();
	const after1 = selectCard(state, 3).state;
	const result = selectCard(after1, 7);

	expect(result.type).toEqual('selected');
	expect(result.state.selection.indices).toEqual([3, 7]);
});

test('selectCard: deselection returns selected state', () => {
	const state = createTestState();
	const after1 = selectCard(state, 3).state;
	const after2 = selectCard(after1, 7).state;
	const result = selectCard(after2, 3); // deselect 3

	expect(result.type).toEqual('selected');
	expect(result.state.selection.indices).toEqual([7]);
});

test('selectCard: valid set clears selection and replaces cards', () => {
	const deck = createDeck();
	const board = createBoardWithKnownSet();
	const state: GameState = {
		deck,
		board,
		selection: { indices: [] },
		difficulty: DifficultyLevel.Hard
	};

	// Select indices 0, 1, 2 which form a valid set
	const after1 = selectCard(state, 0).state;
	const after2 = selectCard(after1, 1).state;
	const result = selectCard(after2, 2);

	expect(result.type).toEqual('valid_set');
	expect(result.state.selection.indices).toEqual([]);

	// Board should still have 12 cards
	expect(result.state.board.cards.length).toEqual(12);

	// Board should still have a valid set (invariant)
	expect(hasAnySet(result.state.board.cards)).toBeTruthy();
});

test('selectCard: invalid set clears selection', () => {
	const deck = createDeck();
	// Create board with invalid set at 0, 1, 2
	const board: Board = {
		cards: [
			// Invalid set: two same num (A, A, B)
			createCard(Num.A, Shape.A, Shading.A, Color.A),
			createCard(Num.A, Shape.B, Shading.B, Color.B),
			createCard(Num.B, Shape.C, Shading.C, Color.C),
			// Fill rest
			createCard(Num.A, Shape.A, Shading.A, Color.B),
			createCard(Num.A, Shape.A, Shading.B, Color.A),
			createCard(Num.A, Shape.B, Shading.A, Color.A),
			createCard(Num.B, Shape.A, Shading.A, Color.A),
			createCard(Num.A, Shape.A, Shading.B, Color.B),
			createCard(Num.A, Shape.B, Shading.A, Color.B),
			createCard(Num.B, Shape.A, Shading.A, Color.B),
			createCard(Num.B, Shape.B, Shading.B, Color.B), // Same as [1] - adds valid set
			createCard(Num.C, Shape.C, Shading.C, Color.C) // Adds valid set with [10] and another
		]
	};
	const state: GameState = {
		deck,
		board,
		selection: { indices: [] },
		difficulty: DifficultyLevel.Hard
	};

	// Verify 0, 1, 2 is invalid
	expect(isValidSet(board.cards[0], board.cards[1], board.cards[2])).toEqual(false);

	const after1 = selectCard(state, 0).state;
	const after2 = selectCard(after1, 1).state;
	const result = selectCard(after2, 2);

	expect(result.type).toEqual('invalid_set');
	expect(result.state.selection.indices).toEqual([]);

	// Board should be unchanged
	expect(result.state.board).toEqual(board);
});

test('selectCard: maintains board invariant after replacement', () => {
	const state = createTestState();

	// Run multiple valid sets and verify invariant holds
	let current = state;
	for (let round = 0; round < 5; round++) {
		// Find a valid set in current board
		const cards = current.board.cards;
		let foundSet = false;

		for (let i = 0; i < 10 && !foundSet; i++) {
			for (let j = i + 1; j < 11 && !foundSet; j++) {
				for (let k = j + 1; k < 12 && !foundSet; k++) {
					if (isValidSet(cards[i], cards[j], cards[k])) {
						// Select this set
						const after1 = selectCard(current, i).state;
						const after2 = selectCard(after1, j).state;
						const result = selectCard(after2, k);

						expect(result.type).toEqual('valid_set');
						expect(hasAnySet(result.state.board.cards)).toBeTruthy();

						current = result.state;
						foundSet = true;
					}
				}
			}
		}

		expect(foundSet).toBeTruthy();
	}
});
