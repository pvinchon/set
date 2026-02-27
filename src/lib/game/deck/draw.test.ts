import { expect, test } from 'vitest';
import { createDeck } from '$lib/game/deck/factory';
import { drawCards } from '$lib/game/deck/draw';
import { cardEquals, createCard } from '$lib/game/card';
import { Color, Num, Shading, Shape } from '$lib/game/attributes';

test('drawCards returns requested number of cards', () => {
	const deck = createDeck();
	const drawn = drawCards(deck, 12, []);

	expect(drawn.length).toEqual(12);
});

test('drawCards returns distinct cards', () => {
	const deck = createDeck();
	const drawn = drawCards(deck, 12, []);

	// Check no duplicates
	for (let i = 0; i < drawn.length; i++) {
		for (let j = i + 1; j < drawn.length; j++) {
			expect(cardEquals(drawn[i], drawn[j])).toEqual(false);
		}
	}
});

test('drawCards excludes specified cards', () => {
	const deck = createDeck();
	const excluded = [
		createCard(Num.A, Shape.A, Shading.A, Color.A),
		createCard(Num.B, Shape.B, Shading.B, Color.B)
	];

	const drawn = drawCards(deck, 10, excluded);

	for (const card of drawn) {
		for (const exc of excluded) {
			expect(cardEquals(card, exc)).toEqual(false);
		}
	}
});

test('drawCards respects deck constraints', () => {
	const deck = createDeck({ nums: [Num.A] });
	const drawn = drawCards(deck, 5, []);

	for (const card of drawn) {
		expect(card.num).toEqual(Num.A);
	}
});

test('drawCards returns fewer cards when deck is limited', () => {
	const deck = createDeck({
		nums: [Num.A],
		shapes: [Shape.A],
		shadings: [Shading.A],
		colors: [Color.A]
	});

	// Only 1 card in deck
	const drawn = drawCards(deck, 12, []);

	expect(drawn.length).toEqual(1);
});

test('drawCards with all excluded returns empty', () => {
	const deck = createDeck({
		nums: [Num.A],
		shapes: [Shape.A],
		shadings: [Shading.A],
		colors: [Color.A]
	});

	const excluded = [createCard(Num.A, Shape.A, Shading.A, Color.A)];

	const drawn = drawCards(deck, 5, excluded);
	expect(drawn.length).toEqual(0);
});

test('drawCards produces shuffled results', () => {
	const deck = createDeck();

	// Draw multiple times and check that results vary
	const draws: string[] = [];
	for (let i = 0; i < 5; i++) {
		const drawn = drawCards(deck, 5, []);
		draws.push(drawn.map((c) => `${c.num}${c.shape}${c.shading}${c.color}`).join(','));
	}

	// At least some draws should differ (statistically very likely with shuffle)
	const uniqueDraws = new Set(draws);
	expect(uniqueDraws.size > 1).toBeTruthy();
});
