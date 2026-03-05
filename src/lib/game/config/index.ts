// Config module — public API for visual configuration.
// Barrel file: re-exports types, palettes, defaults, singleton, persistence.

export {
	buildActiveConfig,
	COLOR_PALETTE,
	DEFAULT_PREFERENCES,
	PATTERN_PALETTE,
	SHAPE_PALETTE
} from './model';

export { loadPreferences, savePreferences, clearPreferences } from './persistence';

import type { ActiveConfig } from './model';
import { buildActiveConfig, DEFAULT_PREFERENCES } from './model';

/** Module-level singleton for the active rendering configuration. */
let activeConfig: ActiveConfig | null = null;

/** Get the active runtime configuration. Lazy-initialises with defaults. */
export function getActiveConfig(): ActiveConfig {
	if (!activeConfig) {
		activeConfig = buildActiveConfig(DEFAULT_PREFERENCES);
	}
	return activeConfig;
}

/** Set the active runtime configuration (called on load and save). */
export function setActiveConfig(config: ActiveConfig): void {
	activeConfig = config;
}
