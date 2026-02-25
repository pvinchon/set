import { expect, test } from 'vitest';
import { cardEquals } from '$lib/game/card/equality';
import { createCard } from '$lib/game/card/model';
import { Color, Num, Shading, Shape } from '$lib/game/attributes';

test('cardEquals returns true for identical cards', () => {
	const card1 = createCard(Num.A, Shape.B, Shading.C, Color.A);
	const card2 = createCard(Num.A, Shape.B, Shading.C, Color.A);

	expect(cardEquals(card1, card2)).toEqual(true);
});

test('cardEquals returns false when num differs', () => {
	const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const card2 = createCard(Num.B, Shape.A, Shading.A, Color.A);

	expect(cardEquals(card1, card2)).toEqual(false);
});

test('cardEquals returns false when shape differs', () => {
	const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const card2 = createCard(Num.A, Shape.B, Shading.A, Color.A);

	expect(cardEquals(card1, card2)).toEqual(false);
});

test('cardEquals returns false when shading differs', () => {
	const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const card2 = createCard(Num.A, Shape.A, Shading.B, Color.A);

	expect(cardEquals(card1, card2)).toEqual(false);
});

test('cardEquals returns false when color differs', () => {
	const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const card2 = createCard(Num.A, Shape.A, Shading.A, Color.B);

	expect(cardEquals(card1, card2)).toEqual(false);
});
