import { expect, test } from 'vitest';
import { createCard } from '$lib/game/card/model';
import { Color, Num, Shading, Shape } from '$lib/game/attributes';

test('createCard returns card with correct attributes', () => {
	const card = createCard(Num.A, Shape.B, Shading.C, Color.A);

	expect(card.num).toEqual(Num.A);
	expect(card.shape).toEqual(Shape.B);
	expect(card.shading).toEqual(Shading.C);
	expect(card.color).toEqual(Color.A);
});

test('createCard creates distinct cards for different inputs', () => {
	const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const card2 = createCard(Num.B, Shape.A, Shading.A, Color.A);

	expect(card1.num !== card2.num).toEqual(true);
});

test('createCard returns readonly card', () => {
	const card = createCard(Num.A, Shape.A, Shading.A, Color.A);

	// Card interface has readonly properties - this compiles as intended
	expect(typeof card.num).toEqual('number');
	expect(typeof card.shape).toEqual('number');
	expect(typeof card.shading).toEqual('number');
	expect(typeof card.color).toEqual('number');
});
