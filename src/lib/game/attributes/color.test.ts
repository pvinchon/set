import { expect, test } from 'vitest';
import { Color } from '$lib/game/attributes/color';

test('Color enum has values 0, 1, 2', () => {
	expect(Color.A).toEqual(0);
	expect(Color.B).toEqual(1);
	expect(Color.C).toEqual(2);
});
