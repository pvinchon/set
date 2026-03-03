import { expect, test } from 'vitest';
import { Shape } from '$lib/game/attributes/shape';

test('Shape enum has values 0, 1, 2', () => {
	expect(Shape.A).toEqual(0);
	expect(Shape.B).toEqual(1);
	expect(Shape.C).toEqual(2);
});
