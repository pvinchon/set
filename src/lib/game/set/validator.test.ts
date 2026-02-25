import { expect, test } from 'vitest';
import { hasAnySet, isValidSet } from '$lib/game/set/validator';
import { createCard } from '$lib/game/card';
import { Color, Num, Shading, Shape } from '$lib/game/attributes';

// ---- isValidSet tests ----

test('isValidSet: all same attributes is valid', () => {
	const a = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const b = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const c = createCard(Num.A, Shape.A, Shading.A, Color.A);

	expect(isValidSet(a, b, c)).toEqual(true);
});

test('isValidSet: all different attributes is valid', () => {
	const a = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const b = createCard(Num.B, Shape.B, Shading.B, Color.B);
	const c = createCard(Num.C, Shape.C, Shading.C, Color.C);

	expect(isValidSet(a, b, c)).toEqual(true);
});

test('isValidSet: mixed same/different per feature is valid', () => {
	// All same num, all different shape, all same shading, all different color
	const a = createCard(Num.A, Shape.A, Shading.B, Color.A);
	const b = createCard(Num.A, Shape.B, Shading.B, Color.B);
	const c = createCard(Num.A, Shape.C, Shading.B, Color.C);

	expect(isValidSet(a, b, c)).toEqual(true);
});

test('isValidSet: two same num + one different is invalid', () => {
	const a = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const b = createCard(Num.A, Shape.B, Shading.B, Color.B);
	const c = createCard(Num.B, Shape.C, Shading.C, Color.C);

	expect(isValidSet(a, b, c)).toEqual(false);
});

test('isValidSet: two same shape + one different is invalid', () => {
	const a = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const b = createCard(Num.B, Shape.A, Shading.B, Color.B);
	const c = createCard(Num.C, Shape.B, Shading.C, Color.C);

	expect(isValidSet(a, b, c)).toEqual(false);
});

test('isValidSet: two same shading + one different is invalid', () => {
	const a = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const b = createCard(Num.B, Shape.B, Shading.A, Color.B);
	const c = createCard(Num.C, Shape.C, Shading.B, Color.C);

	expect(isValidSet(a, b, c)).toEqual(false);
});

test('isValidSet: two same color + one different is invalid', () => {
	const a = createCard(Num.A, Shape.A, Shading.A, Color.A);
	const b = createCard(Num.B, Shape.B, Shading.B, Color.A);
	const c = createCard(Num.C, Shape.C, Shading.C, Color.B);

	expect(isValidSet(a, b, c)).toEqual(false);
});

// ---- hasAnySet tests ----

test('hasAnySet returns true when a valid set exists', () => {
	const cards = [
		createCard(Num.A, Shape.A, Shading.A, Color.A),
		createCard(Num.B, Shape.B, Shading.B, Color.B),
		createCard(Num.C, Shape.C, Shading.C, Color.C)
	];

	expect(hasAnySet(cards)).toEqual(true);
});

test('hasAnySet returns false with only 2 cards', () => {
	const cards = [
		createCard(Num.A, Shape.A, Shading.A, Color.A),
		createCard(Num.B, Shape.B, Shading.B, Color.B)
	];

	expect(hasAnySet(cards)).toEqual(false);
});

test('hasAnySet finds set among larger collection', () => {
	const cards = [
		createCard(Num.A, Shape.A, Shading.A, Color.A), // Part of set
		createCard(Num.A, Shape.B, Shading.A, Color.B), // Not in set
		createCard(Num.B, Shape.B, Shading.B, Color.B), // Part of set
		createCard(Num.C, Shape.A, Shading.B, Color.A), // Not in set
		createCard(Num.C, Shape.C, Shading.C, Color.C) // Part of set
	];

	expect(hasAnySet(cards)).toEqual(true);
});

test('hasAnySet returns false when no valid set exists', () => {
	// Carefully chosen cards that form no valid set
	// All have Color.A, Shape.A, but violate the set rule on other features
	const cards = [
		createCard(Num.A, Shape.A, Shading.A, Color.A),
		createCard(Num.A, Shape.A, Shading.B, Color.A),
		createCard(Num.B, Shape.A, Shading.A, Color.A)
	];

	// Check: (A,A,B) for num → 0+0+1 = 1, not divisible by 3
	expect(hasAnySet(cards)).toEqual(false);
});

test('hasAnySet handles empty array', () => {
	expect(hasAnySet([])).toEqual(false);
});

test('hasAnySet handles single card', () => {
	const cards = [createCard(Num.A, Shape.A, Shading.A, Color.A)];
	expect(hasAnySet(cards)).toEqual(false);
});
