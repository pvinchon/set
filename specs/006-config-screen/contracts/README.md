# Contracts: Configuration Screen

**Feature**: 006-config-screen
**Date**: 2026-02-24

This feature has no external API (no server, no HTTP endpoints). All contracts are internal TypeScript module interfaces.

## Module Contracts

### `config/mod.ts` — Public API

```typescript
/** A player's saved visual preferences. */
interface PlayerPreferences {
	readonly colors: readonly [string, string, string]; // 3 ColorOption IDs
	readonly shapes: readonly [string, string, string]; // 3 ShapeOption IDs
	readonly patterns: readonly [string, string, string]; // 3 PatternOption IDs
}

/** A selectable color from the curated palette. */
interface ColorOption {
	readonly id: string;
	readonly label: string;
	readonly hex: string;
}

/** A selectable shape from the curated palette. */
interface ShapeOption {
	readonly id: string;
	readonly label: string;
	readonly pathFn: (width: number, height: number) => string;
}

/** A selectable shading pattern from the curated palette. */
interface PatternOption {
	readonly id: string;
	readonly label: string;
	readonly applyFn: (svg: SVGSVGElement) => void;
}

/** Runtime config derived from PlayerPreferences, read by render functions. */
interface ActiveConfig {
	readonly colorHexMap: Record<Color, string>;
	readonly shapePathMap: Record<Shape, (w: number, h: number) => string>;
	readonly shadingApplyMap: Record<Shading, (svg: SVGSVGElement) => void>;
}

/** The curated palettes (constant arrays). */
const COLOR_PALETTE: readonly ColorOption[];
const SHAPE_PALETTE: readonly ShapeOption[];
const PATTERN_PALETTE: readonly PatternOption[];

/** Default preferences matching the original game appearance. */
const DEFAULT_PREFERENCES: PlayerPreferences;

/** Get the active runtime configuration. */
function getActiveConfig(): ActiveConfig;

/** Set the active runtime configuration (called on load and save). */
function setActiveConfig(config: ActiveConfig): void;

/** Build an ActiveConfig from PlayerPreferences by resolving palette lookups. */
function buildActiveConfig(prefs: PlayerPreferences): ActiveConfig;
```

### `config/persistence.ts` — Storage API

```typescript
/** localStorage key for preferences. */
const STORAGE_KEY = 'set-game-prefs';

/** Load preferences from localStorage. Returns DEFAULT_PREFERENCES on failure. */
function loadPreferences(): PlayerPreferences;

/** Save preferences to localStorage. Returns true on success, false on failure. */
function savePreferences(prefs: PlayerPreferences): boolean;

/** Clear saved preferences from localStorage. */
function clearPreferences(): void;
```

### `attributes/color.ts` — Modified Signature

```typescript
/** Existing — unchanged. */
enum Color {
	A = 0,
	B = 1,
	C = 2
}

/** Modified: reads hex from getActiveConfig().colorHexMap instead of COLOR_HEX constant. */
function renderColor(color: Color, svgs: SVGSVGElement[]): SVGSVGElement[];
```

The `COLOR_HEX` constant is removed (or kept as a fallback). `renderColor` calls `getActiveConfig().colorHexMap[color]` to get the hex value.

### `attributes/shape.ts` — Modified Signature

```typescript
/** Existing — unchanged. */
enum Shape {
	A = 0,
	B = 1,
	C = 2
}

/** Modified: reads path generator from getActiveConfig().shapePathMap instead of switch statement. */
function shapePath(shape: Shape, width: number, height: number): string;

/** Unchanged signature. */
function renderShape(shape: Shape, svgs: SVGSVGElement[]): SVGSVGElement[];
```

The `shapePath` function calls `getActiveConfig().shapePathMap[shape](width, height)` instead of using a switch statement.

### `attributes/shading.ts` — Modified Signature

```typescript
/** Existing — unchanged. */
enum Shading {
	A = 0,
	B = 1,
	C = 2
}

/** Modified: reads apply function from getActiveConfig().shadingApplyMap instead of switch statement. */
function renderShading(shading: Shading, svgs: SVGSVGElement[]): SVGSVGElement[];
```

The `renderShading` function calls `getActiveConfig().shadingApplyMap[shading](svg)` instead of using a switch statement.

### `screens/config/component.ts` — New Screen

```typescript
/** Extended ScreenDef for the configuration screen. */
interface ConfigScreen extends ScreenDef {
	/** No additional methods needed — state is internal. */
}

/** Create the configuration screen definition. */
function createConfigScreen(router: Router, onSave: (prefs: PlayerPreferences) => void): ScreenDef;
```

### `game/main.ts` — Modified Wiring

```typescript
// New: load config on startup
const prefs = loadPreferences();
setActiveConfig(buildActiveConfig(prefs));

// New: config screen registered in router
const config = createConfigScreen({ navigateTo: (s) => router.navigateTo(s) }, (prefs) => {
	savePreferences(prefs);
	setActiveConfig(buildActiveConfig(prefs));
});

router = createRouter(app, { title, play, config }, 'title');
```

### `screens/title/component.ts` — Modified Factory

```typescript
/** Modified: accepts onConfig callback for navigating to config screen. */
function createTitleScreen(
	router: Router,
	onStart: (difficulty: DifficultyLevel) => void
): ScreenDef & TitleScreen;
// The title screen internally adds a "Settings" button that calls router.navigateTo("config").
```

## localStorage Schema

**Key**: `set-game-prefs`

**Value** (JSON):

```json
{
	"colors": ["pink", "blue", "amber"],
	"shapes": ["circle", "square", "triangle"],
	"patterns": ["solid", "striped", "open"]
}
```

**Validation on read**:

1. Key must exist
2. Value must parse as JSON
3. Must have `colors`, `shapes`, `patterns` keys
4. Each must be an array of exactly 3 strings
5. All 3 strings in each array must be distinct
6. Each string must be a valid ID from the corresponding palette
7. Any failure at any step → return `DEFAULT_PREFERENCES`
