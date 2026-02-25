import { expect, test } from 'vitest';
import { createDeck } from '$lib/game/deck/factory';
import { Color, Num, Shading, Shape } from '$lib/game/attributes';
import { cardEquals } from '$lib/game/card';

test('createDeck with no options produces 81 unique cards', () => {
	const deck = createDeck();

	expect(deck.cards.length).toEqual(81);

	// Check uniqueness by comparing all pairs
	for (let i = 0; i < deck.cards.length; i++) {
		for (let j = i + 1; j < deck.cards.length; j++) {
			expect(cardEquals(deck.cards[i], deck.cards[j])).toEqual(false);
		}
	}
});

test('createDeck with single num produces 27 cards', () => {
	const deck = createDeck({ nums: [Num.A] });

	// 1 num × 3 shapes × 3 shadings × 3 colors = 27
	expect(deck.cards.length).toEqual(27);

	for (const card of deck.cards) {
		expect(card.num).toEqual(Num.A);
	}
});

test('createDeck with single shape produces 27 cards', () => {
	const deck = createDeck({ shapes: [Shape.B] });

	// 3 nums × 1 shape × 3 shadings × 3 colors = 27
	expect(deck.cards.length).toEqual(27);

	for (const card of deck.cards) {
		expect(card.shape).toEqual(Shape.B);
	}
});

test('createDeck with multiple single restrictions produces correct count', () => {
	const deck = createDeck({
		nums: [Num.A],
		shapes: [Shape.A],
		shadings: [Shading.A],
		colors: [Color.A]
	});

	// 1 × 1 × 1 × 1 = 1
	expect(deck.cards.length).toEqual(1);
	expect(deck.cards[0].num).toEqual(Num.A);
	expect(deck.cards[0].shape).toEqual(Shape.A);
	expect(deck.cards[0].shading).toEqual(Shading.A);
	expect(deck.cards[0].color).toEqual(Color.A);
});

test('createDeck throws for 2 attribute values', () => {
	expect(() => createDeck({ nums: [Num.A, Num.B] })).toThrow('1 or 3 values');
});

test('createDeck throws for mixed invalid counts', () => {
	expect(() =>
		createDeck({
			nums: [Num.A, Num.B], // invalid: 2
			shapes: [Shape.A] // valid: 1
		})
	).toThrow('1 or 3 values');
});

test('createDeck with all three values works', () => {
	const deck = createDeck({
		nums: [Num.A, Num.B, Num.C],
		shapes: [Shape.A, Shape.B, Shape.C],
		shadings: [Shading.A, Shading.B, Shading.C],
		colors: [Color.A, Color.B, Color.C]
	});

	expect(deck.cards.length).toEqual(81);
});
