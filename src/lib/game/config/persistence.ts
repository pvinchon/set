// Persistence — localStorage read/write/clear for player preferences

import { DEFAULT_PREFERENCES, isValidPreferences, type PlayerPreferences } from './model';

/** localStorage key for preferences. */
const STORAGE_KEY = 'set-game-prefs';

/** Load preferences from localStorage. Returns DEFAULT_PREFERENCES on failure. */
export function loadPreferences(): PlayerPreferences {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_PREFERENCES;
		const parsed: unknown = JSON.parse(raw);
		if (isValidPreferences(parsed)) return parsed;
		return DEFAULT_PREFERENCES;
	} catch {
		return DEFAULT_PREFERENCES;
	}
}

/** Save preferences to localStorage. Returns true on success, false on failure. */
export function savePreferences(prefs: PlayerPreferences): boolean {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
		return true;
	} catch {
		return false;
	}
}

/** Clear saved preferences from localStorage. Returns true on success, false on failure. */
export function clearPreferences(): boolean {
	try {
		localStorage.removeItem(STORAGE_KEY);
		return true;
	} catch {
		return false;
	}
}
