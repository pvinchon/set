import { expect, test } from 'vitest';
import { Shading } from '$lib/game/attributes/shading';

test('Shading enum has values 0, 1, 2', () => {
	expect(Shading.A).toEqual(0);
	expect(Shading.B).toEqual(1);
	expect(Shading.C).toEqual(2);
});
