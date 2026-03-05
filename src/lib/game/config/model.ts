// Config model — types, palettes, defaults, validation, and ActiveConfig builder

import { Color } from '$lib/game/attributes/color';
import { Shape } from '$lib/game/attributes/shape';
import { Shading } from '$lib/game/attributes/shading';

// ─── Types ───────────────────────────────────────────────────────────

/** A player's saved visual preferences. */
export interface PlayerPreferences {
	readonly colors: readonly [string, string, string];
	readonly shapes: readonly [string, string, string];
	readonly patterns: readonly [string, string, string];
}

/** A selectable color from the curated palette. */
export interface ColorOption {
	readonly id: string;
	readonly label: string;
	readonly hex: string;
	readonly group: string;
}

/** A selectable shape from the curated palette. */
export interface ShapeOption {
	readonly id: string;
	readonly label: string;
	readonly pathFn: (width: number, height: number) => string;
}

/**
 * Declarative SVG pattern definition used by Svelte card rendering.
 * Returns SVG defs inner-HTML and a CSS fill value without DOM mutation.
 */
export interface PatternDef {
	/** Returns inner HTML to inject inside an SVG `<defs>` element, or '' if not needed. */
	readonly svgDefs: (patternId: string, color: string) => string;
	/** Returns the CSS fill value (e.g. color string or `url(#id)`). */
	readonly fill: (patternId: string, color: string) => string;
}

/** A selectable shading pattern from the curated palette. */
export interface PatternOption {
	readonly id: string;
	readonly label: string;
	readonly patternDef: PatternDef;
}

/** Runtime config derived from PlayerPreferences, read by Svelte components. */
export interface ActiveConfig {
	readonly colorHexMap: Record<Color, string>;
	readonly shapePathMap: Record<Shape, (w: number, h: number) => string>;
	readonly shadingMap: Record<Shading, PatternDef>;
}

// ─── Shared Palette Utilities ────────────────────────────────────────

/** Union of all palette option types. */
export type PaletteItem = ColorOption | ShapeOption | PatternOption;

export function isColor(item: PaletteItem): item is ColorOption {
	return 'hex' in item;
}

export function isShape(item: PaletteItem): item is ShapeOption {
	return 'pathFn' in item;
}

export function isPattern(item: PaletteItem): item is PatternOption {
	return 'patternDef' in item;
}

/** Default swatch color used for shape/pattern previews. */
export const SWATCH_COLOR = '#6b7280';

// ─── Shape Path Generators ───────────────────────────────────────────

function circlePath(width: number, height: number): string {
	const cx = width / 2;
	const cy = height / 2;
	const r = Math.min(width, height) / 2;
	return [
		`M ${cx} ${cy - r}`,
		`A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,
		`A ${r} ${r} 0 1 1 ${cx} ${cy - r}`
	].join(' ');
}

function squarePath(width: number, height: number): string {
	return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
}

function trianglePath(width: number, height: number): string {
	const cx = width / 2;
	const cy = height / 2;
	const size = Math.min(width, height);
	const h = (size * Math.sqrt(3)) / 2;
	const top = cy - h / 2;
	const bottom = cy + h / 2;
	const left = cx - size / 2;
	const right = cx + size / 2;
	return `M ${cx} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`;
}

function regularPolygonPath(width: number, height: number, sides: number): string {
	const cx = width / 2;
	const cy = height / 2;
	const r = Math.min(width, height) / 2;
	const points: string[] = [];
	for (let i = 0; i < sides; i++) {
		const angle = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
		points.push(`${cx + r * Math.cos(angle)} ${cy + r * Math.sin(angle)}`);
	}
	return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
}

function pentagonPath(width: number, height: number): string {
	return regularPolygonPath(width, height, 5);
}

function hexagonPath(width: number, height: number): string {
	return regularPolygonPath(width, height, 6);
}

function starNPath(width: number, height: number, points: number, innerRatio: number): string {
	const cx = width / 2;
	const cy = height / 2;
	const outerR = Math.min(width, height) / 2;
	const innerR = outerR * innerRatio;
	const pts: string[] = [];
	for (let i = 0; i < points; i++) {
		const outerAngle = -Math.PI / 2 + (i * 2 * Math.PI) / points;
		pts.push(`${cx + outerR * Math.cos(outerAngle)} ${cy + outerR * Math.sin(outerAngle)}`);
		const innerAngle = outerAngle + Math.PI / points;
		pts.push(`${cx + innerR * Math.cos(innerAngle)} ${cy + innerR * Math.sin(innerAngle)}`);
	}
	return `M ${pts[0]} L ${pts.slice(1).join(' L ')} Z`;
}

function pentagramPath(width: number, height: number): string {
	return starNPath(width, height, 5, 0.38);
}

function hexagramPath(width: number, height: number): string {
	return starNPath(width, height, 6, 0.5);
}

function octagramPath(width: number, height: number): string {
	return starNPath(width, height, 8, 0.4);
}

// ─── Pattern Definitions ─────────────────────────────────────────────

const solidPattern: PatternDef = {
	svgDefs: () => '',
	fill: (_id, color) => color
};

const dottedPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<circle cx="4" cy="4" r="2" fill="${color}"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const inverseDotsPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<rect width="8" height="8" fill="${color}"/>` +
		`<circle cx="4" cy="4" r="2" fill="white"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const openPattern: PatternDef = {
	svgDefs: () => '',
	fill: () => 'none'
};

const horizontalPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="0" y1="0" x2="8" y2="0" stroke="${color}" stroke-width="4"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const stripedPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="0" y1="0" x2="0" y2="8" stroke="${color}" stroke-width="4"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const diagonalRightPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="-1" y1="-1" x2="9" y2="9" stroke="${color}" stroke-width="2.5"/>` +
		`<line x1="-1" y1="7" x2="1" y2="9" stroke="${color}" stroke-width="2.5"/>` +
		`<line x1="7" y1="-1" x2="9" y2="1" stroke="${color}" stroke-width="2.5"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const diagonalLeftPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="9" y1="-1" x2="-1" y2="9" stroke="${color}" stroke-width="2.5"/>` +
		`<line x1="9" y1="7" x2="7" y2="9" stroke="${color}" stroke-width="2.5"/>` +
		`<line x1="1" y1="-1" x2="-1" y2="1" stroke="${color}" stroke-width="2.5"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const dottedHorizontalPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="0" y1="0" x2="8" y2="0" stroke="${color}" stroke-width="4" stroke-dasharray="6 3"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const dottedVerticalPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="0" y1="0" x2="0" y2="8" stroke="${color}" stroke-width="4" stroke-dasharray="6 3"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const dottedDiagonalRightPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="-1" y1="-1" x2="9" y2="9" stroke="${color}" stroke-width="2.5" stroke-dasharray="5 3"/>` +
		`<line x1="-1" y1="7" x2="1" y2="9" stroke="${color}" stroke-width="2.5" stroke-dasharray="5 3"/>` +
		`<line x1="7" y1="-1" x2="9" y2="1" stroke="${color}" stroke-width="2.5" stroke-dasharray="5 3"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const dottedDiagonalLeftPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<pattern id="${id}" patternUnits="userSpaceOnUse" width="8" height="8">` +
		`<line x1="9" y1="-1" x2="-1" y2="9" stroke="${color}" stroke-width="2.5" stroke-dasharray="5 3"/>` +
		`<line x1="9" y1="7" x2="7" y2="9" stroke="${color}" stroke-width="2.5" stroke-dasharray="5 3"/>` +
		`<line x1="1" y1="-1" x2="-1" y2="1" stroke="${color}" stroke-width="2.5" stroke-dasharray="5 3"/>` +
		`</pattern>`,
	fill: (id) => `url(#${id})`
};

const gradientTopBottomPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<linearGradient id="${id}" x1="0%" y1="0%" x2="0%" y2="100%">` +
		`<stop offset="0%" stop-color="${color}" stop-opacity="1"/>` +
		`<stop offset="100%" stop-color="${color}" stop-opacity="0"/>` +
		`</linearGradient>`,
	fill: (id) => `url(#${id})`
};

const gradientBottomTopPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<linearGradient id="${id}" x1="0%" y1="100%" x2="0%" y2="0%">` +
		`<stop offset="0%" stop-color="${color}" stop-opacity="1"/>` +
		`<stop offset="100%" stop-color="${color}" stop-opacity="0"/>` +
		`</linearGradient>`,
	fill: (id) => `url(#${id})`
};

const gradientLeftRightPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="0%">` +
		`<stop offset="0%" stop-color="${color}" stop-opacity="1"/>` +
		`<stop offset="100%" stop-color="${color}" stop-opacity="0"/>` +
		`</linearGradient>`,
	fill: (id) => `url(#${id})`
};

const gradientRightLeftPattern: PatternDef = {
	svgDefs: (id, color) =>
		`<linearGradient id="${id}" x1="100%" y1="0%" x2="0%" y2="0%">` +
		`<stop offset="0%" stop-color="${color}" stop-opacity="1"/>` +
		`<stop offset="100%" stop-color="${color}" stop-opacity="0"/>` +
		`</linearGradient>`,
	fill: (id) => `url(#${id})`
};

// ─── Palettes ────────────────────────────────────────────────────────

export const COLOR_PALETTE: readonly ColorOption[] = [
	// Red
	{ id: 'red-100', label: 'Red 100', hex: '#fee2e2', group: 'Red' },
	{ id: 'red-200', label: 'Red 200', hex: '#fecaca', group: 'Red' },
	{ id: 'red-300', label: 'Red 300', hex: '#fca5a5', group: 'Red' },
	{ id: 'red-400', label: 'Red 400', hex: '#f87171', group: 'Red' },
	{ id: 'red-500', label: 'Red 500', hex: '#ef4444', group: 'Red' },
	{ id: 'red-600', label: 'Red 600', hex: '#dc2626', group: 'Red' },
	{ id: 'red-700', label: 'Red 700', hex: '#b91c1c', group: 'Red' },
	{ id: 'red-800', label: 'Red 800', hex: '#991b1b', group: 'Red' },
	{ id: 'red-900', label: 'Red 900', hex: '#7f1d1d', group: 'Red' },
	// Orange
	{ id: 'orange-100', label: 'Orange 100', hex: '#ffedd5', group: 'Orange' },
	{ id: 'orange-200', label: 'Orange 200', hex: '#fed7aa', group: 'Orange' },
	{ id: 'orange-300', label: 'Orange 300', hex: '#fdba74', group: 'Orange' },
	{ id: 'orange-400', label: 'Orange 400', hex: '#fb923c', group: 'Orange' },
	{ id: 'orange-500', label: 'Orange 500', hex: '#f97316', group: 'Orange' },
	{ id: 'orange-600', label: 'Orange 600', hex: '#ea580c', group: 'Orange' },
	{ id: 'orange-700', label: 'Orange 700', hex: '#c2410c', group: 'Orange' },
	{ id: 'orange-800', label: 'Orange 800', hex: '#9a3412', group: 'Orange' },
	{ id: 'orange-900', label: 'Orange 900', hex: '#7c2d12', group: 'Orange' },
	// Amber
	{ id: 'amber-100', label: 'Amber 100', hex: '#fef3c7', group: 'Amber' },
	{ id: 'amber-200', label: 'Amber 200', hex: '#fde68a', group: 'Amber' },
	{ id: 'amber-300', label: 'Amber 300', hex: '#fcd34d', group: 'Amber' },
	{ id: 'amber-400', label: 'Amber 400', hex: '#fbbf24', group: 'Amber' },
	{ id: 'amber-500', label: 'Amber 500', hex: '#f59e0b', group: 'Amber' },
	{ id: 'amber-600', label: 'Amber 600', hex: '#d97706', group: 'Amber' },
	{ id: 'amber-700', label: 'Amber 700', hex: '#b45309', group: 'Amber' },
	{ id: 'amber-800', label: 'Amber 800', hex: '#92400e', group: 'Amber' },
	{ id: 'amber-900', label: 'Amber 900', hex: '#78350f', group: 'Amber' },
	// Yellow
	{ id: 'yellow-100', label: 'Yellow 100', hex: '#fefce8', group: 'Yellow' },
	{ id: 'yellow-200', label: 'Yellow 200', hex: '#fef08a', group: 'Yellow' },
	{ id: 'yellow-300', label: 'Yellow 300', hex: '#fde047', group: 'Yellow' },
	{ id: 'yellow-400', label: 'Yellow 400', hex: '#facc15', group: 'Yellow' },
	{ id: 'yellow-500', label: 'Yellow 500', hex: '#eab308', group: 'Yellow' },
	{ id: 'yellow-600', label: 'Yellow 600', hex: '#ca8a04', group: 'Yellow' },
	{ id: 'yellow-700', label: 'Yellow 700', hex: '#a16207', group: 'Yellow' },
	{ id: 'yellow-800', label: 'Yellow 800', hex: '#854d0e', group: 'Yellow' },
	{ id: 'yellow-900', label: 'Yellow 900', hex: '#713f12', group: 'Yellow' },
	// Lime
	{ id: 'lime-100', label: 'Lime 100', hex: '#ecfccb', group: 'Lime' },
	{ id: 'lime-200', label: 'Lime 200', hex: '#d9f99d', group: 'Lime' },
	{ id: 'lime-300', label: 'Lime 300', hex: '#bef264', group: 'Lime' },
	{ id: 'lime-400', label: 'Lime 400', hex: '#a3e635', group: 'Lime' },
	{ id: 'lime-500', label: 'Lime 500', hex: '#84cc16', group: 'Lime' },
	{ id: 'lime-600', label: 'Lime 600', hex: '#65a30d', group: 'Lime' },
	{ id: 'lime-700', label: 'Lime 700', hex: '#4d7c0f', group: 'Lime' },
	{ id: 'lime-800', label: 'Lime 800', hex: '#3f6212', group: 'Lime' },
	{ id: 'lime-900', label: 'Lime 900', hex: '#365314', group: 'Lime' },
	// Green
	{ id: 'green-100', label: 'Green 100', hex: '#dcfce7', group: 'Green' },
	{ id: 'green-200', label: 'Green 200', hex: '#bbf7d0', group: 'Green' },
	{ id: 'green-300', label: 'Green 300', hex: '#86efac', group: 'Green' },
	{ id: 'green-400', label: 'Green 400', hex: '#4ade80', group: 'Green' },
	{ id: 'green-500', label: 'Green 500', hex: '#22c55e', group: 'Green' },
	{ id: 'green-600', label: 'Green 600', hex: '#16a34a', group: 'Green' },
	{ id: 'green-700', label: 'Green 700', hex: '#15803d', group: 'Green' },
	{ id: 'green-800', label: 'Green 800', hex: '#166534', group: 'Green' },
	{ id: 'green-900', label: 'Green 900', hex: '#14532d', group: 'Green' },
	// Emerald
	{ id: 'emerald-100', label: 'Emerald 100', hex: '#d1fae5', group: 'Emerald' },
	{ id: 'emerald-200', label: 'Emerald 200', hex: '#a7f3d0', group: 'Emerald' },
	{ id: 'emerald-300', label: 'Emerald 300', hex: '#6ee7b7', group: 'Emerald' },
	{ id: 'emerald-400', label: 'Emerald 400', hex: '#34d399', group: 'Emerald' },
	{ id: 'emerald-500', label: 'Emerald 500', hex: '#10b981', group: 'Emerald' },
	{ id: 'emerald-600', label: 'Emerald 600', hex: '#059669', group: 'Emerald' },
	{ id: 'emerald-700', label: 'Emerald 700', hex: '#047857', group: 'Emerald' },
	{ id: 'emerald-800', label: 'Emerald 800', hex: '#065f46', group: 'Emerald' },
	{ id: 'emerald-900', label: 'Emerald 900', hex: '#064e3b', group: 'Emerald' },
	// Teal
	{ id: 'teal-100', label: 'Teal 100', hex: '#ccfbf1', group: 'Teal' },
	{ id: 'teal-200', label: 'Teal 200', hex: '#99f6e4', group: 'Teal' },
	{ id: 'teal-300', label: 'Teal 300', hex: '#5eead4', group: 'Teal' },
	{ id: 'teal-400', label: 'Teal 400', hex: '#2dd4bf', group: 'Teal' },
	{ id: 'teal-500', label: 'Teal 500', hex: '#14b8a6', group: 'Teal' },
	{ id: 'teal-600', label: 'Teal 600', hex: '#0d9488', group: 'Teal' },
	{ id: 'teal-700', label: 'Teal 700', hex: '#0f766e', group: 'Teal' },
	{ id: 'teal-800', label: 'Teal 800', hex: '#115e59', group: 'Teal' },
	{ id: 'teal-900', label: 'Teal 900', hex: '#134e4a', group: 'Teal' },
	// Cyan
	{ id: 'cyan-100', label: 'Cyan 100', hex: '#cffafe', group: 'Cyan' },
	{ id: 'cyan-200', label: 'Cyan 200', hex: '#a5f3fc', group: 'Cyan' },
	{ id: 'cyan-300', label: 'Cyan 300', hex: '#67e8f9', group: 'Cyan' },
	{ id: 'cyan-400', label: 'Cyan 400', hex: '#22d3ee', group: 'Cyan' },
	{ id: 'cyan-500', label: 'Cyan 500', hex: '#06b6d4', group: 'Cyan' },
	{ id: 'cyan-600', label: 'Cyan 600', hex: '#0891b2', group: 'Cyan' },
	{ id: 'cyan-700', label: 'Cyan 700', hex: '#0e7490', group: 'Cyan' },
	{ id: 'cyan-800', label: 'Cyan 800', hex: '#155e75', group: 'Cyan' },
	{ id: 'cyan-900', label: 'Cyan 900', hex: '#164e63', group: 'Cyan' },
	// Sky
	{ id: 'sky-100', label: 'Sky 100', hex: '#e0f2fe', group: 'Sky' },
	{ id: 'sky-200', label: 'Sky 200', hex: '#bae6fd', group: 'Sky' },
	{ id: 'sky-300', label: 'Sky 300', hex: '#7dd3fc', group: 'Sky' },
	{ id: 'sky-400', label: 'Sky 400', hex: '#38bdf8', group: 'Sky' },
	{ id: 'sky-500', label: 'Sky 500', hex: '#0ea5e9', group: 'Sky' },
	{ id: 'sky-600', label: 'Sky 600', hex: '#0284c7', group: 'Sky' },
	{ id: 'sky-700', label: 'Sky 700', hex: '#0369a1', group: 'Sky' },
	{ id: 'sky-800', label: 'Sky 800', hex: '#075985', group: 'Sky' },
	{ id: 'sky-900', label: 'Sky 900', hex: '#0c4a6e', group: 'Sky' },
	// Blue
	{ id: 'blue-100', label: 'Blue 100', hex: '#dbeafe', group: 'Blue' },
	{ id: 'blue-200', label: 'Blue 200', hex: '#bfdbfe', group: 'Blue' },
	{ id: 'blue-300', label: 'Blue 300', hex: '#93c5fd', group: 'Blue' },
	{ id: 'blue-400', label: 'Blue 400', hex: '#60a5fa', group: 'Blue' },
	{ id: 'blue-500', label: 'Blue 500', hex: '#3b82f6', group: 'Blue' },
	{ id: 'blue-600', label: 'Blue 600', hex: '#2563eb', group: 'Blue' },
	{ id: 'blue-700', label: 'Blue 700', hex: '#1d4ed8', group: 'Blue' },
	{ id: 'blue-800', label: 'Blue 800', hex: '#1e40af', group: 'Blue' },
	{ id: 'blue-900', label: 'Blue 900', hex: '#1e3a8a', group: 'Blue' },
	// Indigo
	{ id: 'indigo-100', label: 'Indigo 100', hex: '#e0e7ff', group: 'Indigo' },
	{ id: 'indigo-200', label: 'Indigo 200', hex: '#c7d2fe', group: 'Indigo' },
	{ id: 'indigo-300', label: 'Indigo 300', hex: '#a5b4fc', group: 'Indigo' },
	{ id: 'indigo-400', label: 'Indigo 400', hex: '#818cf8', group: 'Indigo' },
	{ id: 'indigo-500', label: 'Indigo 500', hex: '#6366f1', group: 'Indigo' },
	{ id: 'indigo-600', label: 'Indigo 600', hex: '#4f46e5', group: 'Indigo' },
	{ id: 'indigo-700', label: 'Indigo 700', hex: '#4338ca', group: 'Indigo' },
	{ id: 'indigo-800', label: 'Indigo 800', hex: '#3730a3', group: 'Indigo' },
	{ id: 'indigo-900', label: 'Indigo 900', hex: '#312e81', group: 'Indigo' },
	// Violet
	{ id: 'violet-100', label: 'Violet 100', hex: '#ede9fe', group: 'Violet' },
	{ id: 'violet-200', label: 'Violet 200', hex: '#ddd6fe', group: 'Violet' },
	{ id: 'violet-300', label: 'Violet 300', hex: '#c4b5fd', group: 'Violet' },
	{ id: 'violet-400', label: 'Violet 400', hex: '#a78bfa', group: 'Violet' },
	{ id: 'violet-500', label: 'Violet 500', hex: '#8b5cf6', group: 'Violet' },
	{ id: 'violet-600', label: 'Violet 600', hex: '#7c3aed', group: 'Violet' },
	{ id: 'violet-700', label: 'Violet 700', hex: '#6d28d9', group: 'Violet' },
	{ id: 'violet-800', label: 'Violet 800', hex: '#5b21b6', group: 'Violet' },
	{ id: 'violet-900', label: 'Violet 900', hex: '#4c1d95', group: 'Violet' },
	// Purple
	{ id: 'purple-100', label: 'Purple 100', hex: '#f3e8ff', group: 'Purple' },
	{ id: 'purple-200', label: 'Purple 200', hex: '#e9d5ff', group: 'Purple' },
	{ id: 'purple-300', label: 'Purple 300', hex: '#d8b4fe', group: 'Purple' },
	{ id: 'purple-400', label: 'Purple 400', hex: '#c084fc', group: 'Purple' },
	{ id: 'purple-500', label: 'Purple 500', hex: '#a855f7', group: 'Purple' },
	{ id: 'purple-600', label: 'Purple 600', hex: '#9333ea', group: 'Purple' },
	{ id: 'purple-700', label: 'Purple 700', hex: '#7e22ce', group: 'Purple' },
	{ id: 'purple-800', label: 'Purple 800', hex: '#6b21a8', group: 'Purple' },
	{ id: 'purple-900', label: 'Purple 900', hex: '#581c87', group: 'Purple' },
	// Fuchsia
	{ id: 'fuchsia-100', label: 'Fuchsia 100', hex: '#fae8ff', group: 'Fuchsia' },
	{ id: 'fuchsia-200', label: 'Fuchsia 200', hex: '#f5d0fe', group: 'Fuchsia' },
	{ id: 'fuchsia-300', label: 'Fuchsia 300', hex: '#f0abfc', group: 'Fuchsia' },
	{ id: 'fuchsia-400', label: 'Fuchsia 400', hex: '#e879f9', group: 'Fuchsia' },
	{ id: 'fuchsia-500', label: 'Fuchsia 500', hex: '#d946ef', group: 'Fuchsia' },
	{ id: 'fuchsia-600', label: 'Fuchsia 600', hex: '#c026d3', group: 'Fuchsia' },
	{ id: 'fuchsia-700', label: 'Fuchsia 700', hex: '#a21caf', group: 'Fuchsia' },
	{ id: 'fuchsia-800', label: 'Fuchsia 800', hex: '#86198f', group: 'Fuchsia' },
	{ id: 'fuchsia-900', label: 'Fuchsia 900', hex: '#701a75', group: 'Fuchsia' },
	// Pink
	{ id: 'pink-100', label: 'Pink 100', hex: '#fce7f3', group: 'Pink' },
	{ id: 'pink-200', label: 'Pink 200', hex: '#fbcfe8', group: 'Pink' },
	{ id: 'pink-300', label: 'Pink 300', hex: '#f9a8d4', group: 'Pink' },
	{ id: 'pink-400', label: 'Pink 400', hex: '#f472b6', group: 'Pink' },
	{ id: 'pink-500', label: 'Pink 500', hex: '#ec4899', group: 'Pink' },
	{ id: 'pink-600', label: 'Pink 600', hex: '#db2777', group: 'Pink' },
	{ id: 'pink-700', label: 'Pink 700', hex: '#be185d', group: 'Pink' },
	{ id: 'pink-800', label: 'Pink 800', hex: '#9d174d', group: 'Pink' },
	{ id: 'pink-900', label: 'Pink 900', hex: '#831843', group: 'Pink' },
	// Rose
	{ id: 'rose-100', label: 'Rose 100', hex: '#ffe4e6', group: 'Rose' },
	{ id: 'rose-200', label: 'Rose 200', hex: '#fecdd3', group: 'Rose' },
	{ id: 'rose-300', label: 'Rose 300', hex: '#fda4af', group: 'Rose' },
	{ id: 'rose-400', label: 'Rose 400', hex: '#fb7185', group: 'Rose' },
	{ id: 'rose-500', label: 'Rose 500', hex: '#f43f5e', group: 'Rose' },
	{ id: 'rose-600', label: 'Rose 600', hex: '#e11d48', group: 'Rose' },
	{ id: 'rose-700', label: 'Rose 700', hex: '#be123c', group: 'Rose' },
	{ id: 'rose-800', label: 'Rose 800', hex: '#9f1239', group: 'Rose' },
	{ id: 'rose-900', label: 'Rose 900', hex: '#881337', group: 'Rose' }
] as const;

export const SHAPE_PALETTE: readonly ShapeOption[] = [
	{ id: 'circle', label: 'Circle', pathFn: circlePath },
	{ id: 'hexagon', label: 'Hexagon', pathFn: hexagonPath },
	{ id: 'pentagon', label: 'Pentagon', pathFn: pentagonPath },
	{ id: 'square', label: 'Square', pathFn: squarePath },
	{ id: 'triangle', label: 'Triangle', pathFn: trianglePath },
	{ id: 'pentagram', label: 'Pentagram', pathFn: pentagramPath },
	{ id: 'hexagram', label: 'Hexagram', pathFn: hexagramPath },
	{ id: 'octagram', label: 'Octagram', pathFn: octagramPath }
] as const;

export const PATTERN_PALETTE: readonly PatternOption[] = [
	// Row 1: Fills
	{ id: 'solid', label: 'Solid', patternDef: solidPattern },
	{ id: 'inverse-dots', label: 'Inverse Dots', patternDef: inverseDotsPattern },
	{ id: 'dotted', label: 'Dotted', patternDef: dottedPattern },
	{ id: 'open', label: 'Open', patternDef: openPattern },
	// Row 2: Lines
	{ id: 'horizontal', label: 'Horizontal', patternDef: horizontalPattern },
	{ id: 'striped', label: 'Vertical', patternDef: stripedPattern },
	{ id: 'diagonal-right', label: 'Diagonal ↘', patternDef: diagonalRightPattern },
	{ id: 'diagonal-left', label: 'Diagonal ↙', patternDef: diagonalLeftPattern },
	// Row 3: Dotted Lines
	{ id: 'dotted-horizontal', label: 'Dotted ―', patternDef: dottedHorizontalPattern },
	{ id: 'dotted-vertical', label: 'Dotted |', patternDef: dottedVerticalPattern },
	{ id: 'dotted-diagonal-right', label: 'Dotted ↘', patternDef: dottedDiagonalRightPattern },
	{ id: 'dotted-diagonal-left', label: 'Dotted ↙', patternDef: dottedDiagonalLeftPattern },
	// Row 4: Gradients
	{ id: 'gradient-tb', label: 'Gradient ↓', patternDef: gradientTopBottomPattern },
	{ id: 'gradient-bt', label: 'Gradient ↑', patternDef: gradientBottomTopPattern },
	{ id: 'gradient-lr', label: 'Gradient →', patternDef: gradientLeftRightPattern },
	{ id: 'gradient-rl', label: 'Gradient ←', patternDef: gradientRightLeftPattern }
] as const;

// ─── Defaults ────────────────────────────────────────────────────────

/** Default preferences matching the original game appearance. */
export const DEFAULT_PREFERENCES: PlayerPreferences = {
	colors: ['pink-500', 'blue-500', 'amber-500'],
	shapes: ['circle', 'square', 'triangle'],
	patterns: ['solid', 'striped', 'open']
};

// ─── Build active config from preferences ────────────────────────────

/** Build an ActiveConfig from PlayerPreferences by resolving palette lookups. */
export function buildActiveConfig(prefs: PlayerPreferences): ActiveConfig {
	const colorHexMap = {} as Record<Color, string>;
	const shapePathMap = {} as Record<Shape, (w: number, h: number) => string>;
	const shadingMap = {} as Record<Shading, PatternDef>;

	const colors = [Color.A, Color.B, Color.C] as const;
	const shapes = [Shape.A, Shape.B, Shape.C] as const;
	const shadings = [Shading.A, Shading.B, Shading.C] as const;

	for (let i = 0; i < 3; i++) {
		const colorOpt = COLOR_PALETTE.find((c) => c.id === prefs.colors[i]);
		colorHexMap[colors[i]] = colorOpt?.hex ?? COLOR_PALETTE[i].hex;

		const shapeOpt = SHAPE_PALETTE.find((s) => s.id === prefs.shapes[i]);
		shapePathMap[shapes[i]] = shapeOpt?.pathFn ?? SHAPE_PALETTE[i].pathFn;

		const patternOpt = PATTERN_PALETTE.find((p) => p.id === prefs.patterns[i]);
		shadingMap[shadings[i]] = patternOpt?.patternDef ?? PATTERN_PALETTE[i].patternDef;
	}

	return { colorHexMap, shapePathMap, shadingMap };
}

// ─── Validation ──────────────────────────────────────────────────────

const colorIds = new Set(COLOR_PALETTE.map((c) => c.id));
const shapeIds = new Set(SHAPE_PALETTE.map((s) => s.id));
const patternIds = new Set(PATTERN_PALETTE.map((p) => p.id));

function isValidTriple(arr: readonly string[], validIds: Set<string>): boolean {
	if (arr.length !== 3) return false;
	if (new Set(arr).size !== 3) return false;
	return arr.every((id) => validIds.has(id));
}

/** Validate that preferences contain exactly 3 distinct valid IDs per category. */
export function isValidPreferences(prefs: unknown): prefs is PlayerPreferences {
	if (typeof prefs !== 'object' || prefs === null) return false;
	const p = prefs as Record<string, unknown>;
	if (!Array.isArray(p.colors) || !Array.isArray(p.shapes) || !Array.isArray(p.patterns)) {
		return false;
	}
	return (
		isValidTriple(p.colors as string[], colorIds) &&
		isValidTriple(p.shapes as string[], shapeIds) &&
		isValidTriple(p.patterns as string[], patternIds)
	);
}
