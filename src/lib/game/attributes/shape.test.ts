import { expect, test } from 'vitest';
import { Shape, shapePath } from '$lib/game/attributes/shape';

test('Shape enum has values 0, 1, 2', () => {
	expect(Shape.A).toEqual(0);
	expect(Shape.B).toEqual(1);
	expect(Shape.C).toEqual(2);
});

test('shapePath returns circle path for Shape.A', () => {
	const path = shapePath(Shape.A, 80, 80);
	expect(path).toContain('A'); // arc command for circle
});

test('shapePath returns square path for Shape.B', () => {
	const path = shapePath(Shape.B, 80, 80);
	expect(path).toContain('M');
	expect(path).toContain('L');
	expect(path).toContain('Z');
});

test('shapePath returns triangle path for Shape.C', () => {
	const path = shapePath(Shape.C, 80, 80);
	expect(path).toContain('M');
	expect(path).toContain('L');
	expect(path).toContain('Z');
});

test('shapePath values are valid SVG paths', () => {
	const pathCommandPattern = /^[MLCZA0-9.\s-]+$/i;

	for (const shape of [Shape.A, Shape.B, Shape.C]) {
		expect(pathCommandPattern.test(shapePath(shape, 100, 100))).toEqual(true);
	}
});
