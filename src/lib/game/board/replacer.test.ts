import { expect, test } from 'vitest';
import { replaceCards } from '$lib/game/board/replacer';
import { createCard } from '$lib/game/card';
import { Color, Num, Shading, Shape } from '$lib/game/attributes';
import type { Board } from '$lib/game/board/model';

test('replaceCards swaps cards at specified indices', () => {
	const original: Board = {
		cards: [
			createCard(Num.A, Shape.A, Shading.A, Color.A), // 0
			createCard(Num.A, Shape.A, Shading.A, Color.B), // 1
			createCard(Num.A, Shape.A, Shading.A, Color.C), // 2
			createCard(Num.A, Shape.A, Shading.B, Color.A) // 3
		]
	};

	const newCards: [
		(typeof original.cards)[0],
		(typeof original.cards)[0],
		(typeof original.cards)[0]
	] = [
		createCard(Num.C, Shape.C, Shading.C, Color.A),
		createCard(Num.C, Shape.C, Shading.C, Color.B),
		createCard(Num.C, Shape.C, Shading.C, Color.C)
	];

	const result = replaceCards(original, [0, 1, 2], newCards);

	// Indices 0, 1, 2 should be replaced
	expect(result.cards[0]).toEqual(newCards[0]);
	expect(result.cards[1]).toEqual(newCards[1]);
	expect(result.cards[2]).toEqual(newCards[2]);

	// Index 3 should be unchanged
	expect(result.cards[3]).toEqual(original.cards[3]);
});

test('replaceCards handles non-contiguous indices', () => {
	const original: Board = {
		cards: [
			createCard(Num.A, Shape.A, Shading.A, Color.A), // 0 - replace
			createCard(Num.A, Shape.A, Shading.A, Color.B), // 1 - keep
			createCard(Num.A, Shape.A, Shading.A, Color.C), // 2 - replace
			createCard(Num.A, Shape.A, Shading.B, Color.A), // 3 - keep
			createCard(Num.A, Shape.A, Shading.B, Color.B) // 4 - replace
		]
	};

	const newCards: [
		(typeof original.cards)[0],
		(typeof original.cards)[0],
		(typeof original.cards)[0]
	] = [
		createCard(Num.B, Shape.B, Shading.B, Color.B),
		createCard(Num.C, Shape.C, Shading.C, Color.C),
		createCard(Num.A, Shape.B, Shading.C, Color.A)
	];

	const result = replaceCards(original, [0, 2, 4], newCards);

	expect(result.cards[0]).toEqual(newCards[0]);
	expect(result.cards[1]).toEqual(original.cards[1]); // unchanged
	expect(result.cards[2]).toEqual(newCards[1]);
	expect(result.cards[3]).toEqual(original.cards[3]); // unchanged
	expect(result.cards[4]).toEqual(newCards[2]);
});

test('replaceCards preserves board length', () => {
	const original: Board = {
		cards: Array.from({ length: 12 }, (_, i) =>
			createCard(
				(i % 3) as Num,
				(Math.floor(i / 3) % 3) as Shape,
				(Math.floor(i / 9) % 3) as Shading,
				Color.A
			)
		)
	};

	const newCards: [
		(typeof original.cards)[0],
		(typeof original.cards)[0],
		(typeof original.cards)[0]
	] = [
		createCard(Num.C, Shape.C, Shading.C, Color.C),
		createCard(Num.B, Shape.B, Shading.B, Color.B),
		createCard(Num.A, Shape.A, Shading.A, Color.A)
	];

	const result = replaceCards(original, [3, 7, 11], newCards);

	expect(result.cards.length).toEqual(12);
});

test('replaceCards does not mutate original board', () => {
	const originalCards = [
		createCard(Num.A, Shape.A, Shading.A, Color.A),
		createCard(Num.A, Shape.A, Shading.A, Color.B),
		createCard(Num.A, Shape.A, Shading.A, Color.C),
		createCard(Num.A, Shape.A, Shading.B, Color.A)
	];
	const original: Board = { cards: [...originalCards] };

	const newCards: [
		(typeof original.cards)[0],
		(typeof original.cards)[0],
		(typeof original.cards)[0]
	] = [
		createCard(Num.C, Shape.C, Shading.C, Color.A),
		createCard(Num.C, Shape.C, Shading.C, Color.B),
		createCard(Num.C, Shape.C, Shading.C, Color.C)
	];

	replaceCards(original, [0, 1, 2], newCards);

	// Original should be unchanged
	expect(original.cards[0]).toEqual(originalCards[0]);
	expect(original.cards[1]).toEqual(originalCards[1]);
	expect(original.cards[2]).toEqual(originalCards[2]);
});
