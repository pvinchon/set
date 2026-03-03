import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { loadPreferences, savePreferences } from '$lib/game/config/persistence';
import { DEFAULT_PREFERENCES } from '$lib/game/config/model';
import type { PlayerPreferences } from '$lib/game/config/model';

/** Must match the key used in persistence.ts. */
const STORAGE_KEY = 'set-game-prefs';

// ─── localStorage stub (Node environment doesn't have localStorage) ──

const store = new Map<string, string>();
vi.stubGlobal('localStorage', {
	getItem: (key: string) => store.get(key) ?? null,
	setItem: (key: string, value: string) => {
		store.set(key, value);
	},
	removeItem: (key: string) => {
		store.delete(key);
	},
	clear: () => {
		store.clear();
	}
});

// ─── Helpers ─────────────────────────────────────────────────────────

beforeEach(() => {
	store.clear();
});

afterEach(() => {
	store.clear();
});

// ─── loadPreferences ────────────────────────────────────────────────

test('loadPreferences returns defaults when nothing stored', () => {
	const result = loadPreferences();
	expect(result).toEqual(DEFAULT_PREFERENCES);
});

test('loadPreferences returns stored valid preferences', () => {
	const prefs: PlayerPreferences = {
		colors: ['teal-600', 'purple-700', 'red-500'],
		shapes: ['hexagram', 'pentagram', 'hexagon'],
		patterns: ['dotted', 'inverse-dots', 'horizontal']
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
	const result = loadPreferences();
	expect(result).toEqual(prefs);
});

test('loadPreferences returns defaults for invalid JSON', () => {
	localStorage.setItem(STORAGE_KEY, 'not json{{{');
	const result = loadPreferences();
	expect(result).toEqual(DEFAULT_PREFERENCES);
});

test('loadPreferences returns defaults for invalid preferences', () => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify({ colors: ['bad'], shapes: [], patterns: [] }));
	const result = loadPreferences();
	expect(result).toEqual(DEFAULT_PREFERENCES);
});

test('loadPreferences returns defaults for wrong types in arrays', () => {
	localStorage.setItem(
		STORAGE_KEY,
		JSON.stringify({
			colors: [1, 2, 3],
			shapes: [4, 5, 6],
			patterns: [7, 8, 9]
		})
	);
	const result = loadPreferences();
	expect(result).toEqual(DEFAULT_PREFERENCES);
});

// ─── savePreferences ────────────────────────────────────────────────

test('savePreferences stores to localStorage and returns true', () => {
	const prefs: PlayerPreferences = {
		colors: ['green-500', 'orange-500', 'teal-600'],
		shapes: ['hexagon', 'hexagram', 'pentagram'],
		patterns: ['horizontal', 'dotted', 'open']
	};
	const result = savePreferences(prefs);
	expect(result).toEqual(true);
	const stored = localStorage.getItem(STORAGE_KEY);
	expect(stored).toEqual(JSON.stringify(prefs));
});

// ─── localStorage cleanup ────────────────────────────────────────────

test('localStorage.removeItem removes the storage key', () => {
	localStorage.setItem(STORAGE_KEY, 'something');
	localStorage.removeItem(STORAGE_KEY);
	expect(localStorage.getItem(STORAGE_KEY)).toEqual(null);
});

test('localStorage.removeItem does not throw when key missing', () => {
	localStorage.removeItem(STORAGE_KEY);
	expect(localStorage.getItem(STORAGE_KEY)).toEqual(null);
});
