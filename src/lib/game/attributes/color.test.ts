import { expect, test } from 'vitest';
import { Color, COLOR_HEX } from '$lib/game/attributes/color';

test('Color enum has values 0, 1, 2', () => {
	expect(Color.A).toEqual(0);
	expect(Color.B).toEqual(1);
	expect(Color.C).toEqual(2);
});

test('COLOR_HEX has entry for Color.A', () => {
	expect(COLOR_HEX[Color.A]).toEqual('#dc267f');
});

test('COLOR_HEX has entry for Color.B', () => {
	expect(COLOR_HEX[Color.B]).toEqual('#648fff');
});

test('COLOR_HEX has entry for Color.C', () => {
	expect(COLOR_HEX[Color.C]).toEqual('#ffb000');
});

test('COLOR_HEX values are valid hex colors', () => {
	const hexPattern = /^#[0-9a-fA-F]{6}$/;

	for (const color of [Color.A, Color.B, Color.C]) {
		expect(hexPattern.test(COLOR_HEX[color])).toEqual(true);
	}
});
