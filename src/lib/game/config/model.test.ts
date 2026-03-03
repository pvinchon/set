import { expect, test } from 'vitest';
import {
	buildActiveConfig,
	COLOR_PALETTE,
	DEFAULT_PREFERENCES,
	isValidPreferences,
	PATTERN_PALETTE,
	SHAPE_PALETTE
} from '$lib/game/config/model';
import type { PlayerPreferences } from '$lib/game/config/model';
import { Color } from '$lib/game/attributes/color';
import { Shape } from '$lib/game/attributes/shape';
import { Shading } from '$lib/game/attributes/shading';

// ─── Palette sizes ───────────────────────────────────────────────────

test('COLOR_PALETTE has 153 colors', () => {
	expect(COLOR_PALETTE.length).toEqual(153);
});

test('SHAPE_PALETTE has 8 shapes', () => {
	expect(SHAPE_PALETTE.length).toEqual(8);
});

test('PATTERN_PALETTE has 16 patterns', () => {
	expect(PATTERN_PALETTE.length).toEqual(16);
});

// ─── Palette IDs are unique ──────────────────────────────────────────

test('COLOR_PALETTE IDs are unique', () => {
	const ids = COLOR_PALETTE.map((c) => c.id);
	expect(new Set(ids).size).toEqual(ids.length);
});

test('SHAPE_PALETTE IDs are unique', () => {
	const ids = SHAPE_PALETTE.map((s) => s.id);
	expect(new Set(ids).size).toEqual(ids.length);
});

test('PATTERN_PALETTE IDs are unique', () => {
	const ids = PATTERN_PALETTE.map((p) => p.id);
	expect(new Set(ids).size).toEqual(ids.length);
});

// ─── Default preferences ────────────────────────────────────────────

test('DEFAULT_PREFERENCES matches original game colors', () => {
	expect(DEFAULT_PREFERENCES.colors).toEqual(['pink-500', 'blue-500', 'amber-500']);
});

test('DEFAULT_PREFERENCES matches original game shapes', () => {
	expect(DEFAULT_PREFERENCES.shapes).toEqual(['circle', 'square', 'triangle']);
});

test('DEFAULT_PREFERENCES matches original game patterns', () => {
	expect(DEFAULT_PREFERENCES.patterns).toEqual(['solid', 'striped', 'open']);
});

test('DEFAULT_PREFERENCES is valid', () => {
	expect(isValidPreferences(DEFAULT_PREFERENCES)).toEqual(true);
});

// ─── buildActiveConfig ──────────────────────────────────────────────

test('buildActiveConfig with defaults maps Color.A to pink hex', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	expect(config.colorHexMap[Color.A]).toEqual('#ec4899');
});

test('buildActiveConfig with defaults maps Color.B to blue hex', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	expect(config.colorHexMap[Color.B]).toEqual('#3b82f6');
});

test('buildActiveConfig with defaults maps Color.C to amber hex', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	expect(config.colorHexMap[Color.C]).toEqual('#f59e0b');
});

test('buildActiveConfig maps custom colors correctly', () => {
	const prefs: PlayerPreferences = {
		colors: ['teal-600', 'purple-700', 'red-500'],
		shapes: ['circle', 'square', 'triangle'],
		patterns: ['solid', 'striped', 'open']
	};
	const config = buildActiveConfig(prefs);
	expect(config.colorHexMap[Color.A]).toEqual('#0d9488');
	expect(config.colorHexMap[Color.B]).toEqual('#7e22ce');
	expect(config.colorHexMap[Color.C]).toEqual('#ef4444');
});

test('buildActiveConfig shapePathMap produces string paths', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const path = config.shapePathMap[Shape.A](80, 80);
	expect(typeof path).toEqual('string');
	expect(path.length > 0).toEqual(true);
});

test('buildActiveConfig with custom shapes maps correctly', () => {
	const prefs: PlayerPreferences = {
		colors: ['pink-500', 'blue-500', 'amber-500'],
		shapes: ['hexagram', 'pentagram', 'hexagon'],
		patterns: ['solid', 'striped', 'open']
	};
	const config = buildActiveConfig(prefs);
	const path = config.shapePathMap[Shape.A](80, 80);
	expect(path.startsWith('M')).toEqual(true);
});

// ─── shadingMap ──────────────────────────────────────────────────────

test('buildActiveConfig shadingMap solid fill equals color', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const color = '#ec4899';
	const fill = config.shadingMap[Shading.A].fill('pid', color);
	expect(fill).toEqual(color);
});

test('buildActiveConfig shadingMap solid svgDefs is empty', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const defs = config.shadingMap[Shading.A].svgDefs('pid', '#ec4899');
	expect(defs).toEqual('');
});

test('buildActiveConfig shadingMap striped fill is url reference', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const fill = config.shadingMap[Shading.B].fill('pid', '#3b82f6');
	expect(fill).toEqual('url(#pid)');
});

test('buildActiveConfig shadingMap striped svgDefs contains pattern element', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const defs = config.shadingMap[Shading.B].svgDefs('pid', '#3b82f6');
	expect(defs).toContain('<pattern');
	expect(defs).toContain('pid');
});

test('buildActiveConfig shadingMap open fill is none', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const fill = config.shadingMap[Shading.C].fill('pid', '#f59e0b');
	expect(fill).toEqual('none');
});

// ─── Shape path generators ──────────────────────────────────────────

test('circle path contains arc commands', () => {
	const config = buildActiveConfig({
		colors: ['pink-500', 'blue-500', 'amber-500'],
		shapes: ['circle', 'square', 'triangle'],
		patterns: ['solid', 'striped', 'open']
	});
	const path = config.shapePathMap[Shape.A](80, 80);
	expect(path.includes('A')).toEqual(true);
});

test('square path closes with Z', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const path = config.shapePathMap[Shape.B](80, 80);
	expect(path.endsWith('Z')).toEqual(true);
});

test('triangle path closes with Z', () => {
	const config = buildActiveConfig(DEFAULT_PREFERENCES);
	const path = config.shapePathMap[Shape.C](80, 80);
	expect(path.endsWith('Z')).toEqual(true);
});

test('hexagram path closes with Z', () => {
	const prefs: PlayerPreferences = {
		colors: ['pink-500', 'blue-500', 'amber-500'],
		shapes: ['hexagram', 'square', 'triangle'],
		patterns: ['solid', 'striped', 'open']
	};
	const config = buildActiveConfig(prefs);
	const path = config.shapePathMap[Shape.A](80, 80);
	expect(path.endsWith('Z')).toEqual(true);
});

test('star path closes with Z', () => {
	const prefs: PlayerPreferences = {
		colors: ['pink-500', 'blue-500', 'amber-500'],
		shapes: ['pentagram', 'square', 'triangle'],
		patterns: ['solid', 'striped', 'open']
	};
	const config = buildActiveConfig(prefs);
	const path = config.shapePathMap[Shape.A](80, 80);
	expect(path.endsWith('Z')).toEqual(true);
});

test('hexagon path closes with Z', () => {
	const prefs: PlayerPreferences = {
		colors: ['pink-500', 'blue-500', 'amber-500'],
		shapes: ['hexagon', 'square', 'triangle'],
		patterns: ['solid', 'striped', 'open']
	};
	const config = buildActiveConfig(prefs);
	const path = config.shapePathMap[Shape.A](80, 80);
	expect(path.endsWith('Z')).toEqual(true);
});

// ─── isValidPreferences ─────────────────────────────────────────────

test('isValidPreferences returns true for valid preferences', () => {
	expect(isValidPreferences(DEFAULT_PREFERENCES)).toEqual(true);
});

test('isValidPreferences returns false for null', () => {
	expect(isValidPreferences(null)).toEqual(false);
});

test('isValidPreferences returns false for string', () => {
	expect(isValidPreferences('not an object')).toEqual(false);
});

test('isValidPreferences returns false for missing colors', () => {
	expect(
		isValidPreferences({
			shapes: ['circle', 'square', 'triangle'],
			patterns: ['solid', 'striped', 'open']
		})
	).toEqual(false);
});

test('isValidPreferences returns false for wrong array length', () => {
	expect(
		isValidPreferences({
			colors: ['pink-500', 'blue-500'],
			shapes: ['circle', 'square', 'triangle'],
			patterns: ['solid', 'striped', 'open']
		})
	).toEqual(false);
});

test('isValidPreferences returns false for duplicate IDs', () => {
	expect(
		isValidPreferences({
			colors: ['pink-500', 'pink-500', 'blue-500'],
			shapes: ['circle', 'square', 'triangle'],
			patterns: ['solid', 'striped', 'open']
		})
	).toEqual(false);
});

test('isValidPreferences returns false for invalid IDs', () => {
	expect(
		isValidPreferences({
			colors: ['pink-500', 'blue-500', 'banana'],
			shapes: ['circle', 'square', 'triangle'],
			patterns: ['solid', 'striped', 'open']
		})
	).toEqual(false);
});

test('isValidPreferences returns true for non-default valid prefs', () => {
	expect(
		isValidPreferences({
			colors: ['teal-600', 'purple-700', 'red-500'],
			shapes: ['hexagram', 'pentagram', 'hexagon'],
			patterns: ['dotted', 'inverse-dots', 'horizontal']
		})
	).toEqual(true);
});
