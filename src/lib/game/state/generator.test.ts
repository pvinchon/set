import { expect, test } from 'vitest';
import { generateInitialState } from '$lib/game/state/generator';
import { createDeck } from '$lib/game/deck';
import { hasAnySet } from '$lib/game/set';
import { cardEquals } from '$lib/game/card';
import { EMPTY_SELECTION } from '$lib/game/selection';
import { DifficultyLevel } from '$lib/game/difficulty';
import { Num } from '$lib/game/attributes';

test('generateInitialState returns 12 cards on board', () => {
	const deck = createDeck();
	const state = generateInitialState(deck);

	expect(state.board.cards.length).toEqual(12);
});

test('generateInitialState returns 9 cards when boardSize is 9', () => {
	const deck = createDeck({ nums: [Num.A] });
	const state = generateInitialState(deck, 9, DifficultyLevel.Easy);

	expect(state.board.cards.length).toEqual(9);
});

test('generateInitialState returns 12 cards when boardSize is 12 with restricted deck', () => {
	const deck = createDeck({ nums: [Num.A] });
	const state = generateInitialState(deck, 12, DifficultyLevel.Normal);

	expect(state.board.cards.length).toEqual(12);
});

test('generateInitialState stores difficulty in state', () => {
	const deck = createDeck();
	const state = generateInitialState(deck, 12, DifficultyLevel.Hard);

	expect(state.difficulty).toEqual(DifficultyLevel.Hard);
});

test('generateInitialState defaults to Hard difficulty', () => {
	const deck = createDeck();
	const state = generateInitialState(deck);

	expect(state.difficulty).toEqual(DifficultyLevel.Hard);
});

test('generateInitialState returns distinct cards', () => {
	const deck = createDeck();
	const state = generateInitialState(deck);

	for (let i = 0; i < state.board.cards.length; i++) {
		for (let j = i + 1; j < state.board.cards.length; j++) {
			expect(cardEquals(state.board.cards[i], state.board.cards[j])).toEqual(false);
		}
	}
});

test('generateInitialState always contains a valid set', () => {
	const deck = createDeck();

	// Run multiple times to verify invariant
	for (let i = 0; i < 20; i++) {
		const state = generateInitialState(deck);
		expect(hasAnySet(state.board.cards)).toBeTruthy();
	}
});

test('generateInitialState returns empty selection', () => {
	const deck = createDeck();
	const state = generateInitialState(deck);

	expect(state.selection).toEqual(EMPTY_SELECTION);
});

test('generateInitialState preserves deck reference', () => {
	const deck = createDeck();
	const state = generateInitialState(deck);

	expect(state.deck).toEqual(deck);
});

test('generateInitialState produces different boards', () => {
	const deck = createDeck();

	// Generate multiple states and check for variety
	const boards: string[] = [];
	for (let i = 0; i < 5; i++) {
		const state = generateInitialState(deck);
		const sig = state.board.cards
			.map((c) => `${c.num}${c.shape}${c.shading}${c.color}`)
			.sort()
			.join(',');
		boards.push(sig);
	}

	const unique = new Set(boards);
	expect(unique.size > 1).toBeTruthy();
});
