# Data Model: Configuration Screen

**Feature**: 006-config-screen
**Date**: 2026-02-24

## Entities

### PlayerPreferences (new)

The player's saved visual configuration. Stored as a single JSON object in `localStorage`.

| Field      | Type                                                  | Description                                                 |
| ---------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `colors`   | `[ColorOptionId, ColorOptionId, ColorOptionId]`       | Exactly 3 distinct color IDs, mapped to enum values A/B/C   |
| `shapes`   | `[ShapeOptionId, ShapeOptionId, ShapeOptionId]`       | Exactly 3 distinct shape IDs, mapped to enum values A/B/C   |
| `patterns` | `[PatternOptionId, PatternOptionId, PatternOptionId]` | Exactly 3 distinct pattern IDs, mapped to enum values A/B/C |

#### Validation Rules

- Each array must have exactly 3 elements
- All 3 elements within each array must be distinct
- Each element must reference a valid option from the corresponding palette
- Invalid or missing data triggers fallback to `DEFAULT_PREFERENCES`

### ColorOption (new)

A selectable color from the curated palette.

| Field   | Type     | Description                                            |
| ------- | -------- | ------------------------------------------------------ |
| `id`    | `string` | Unique identifier (e.g., `"pink"`, `"blue"`, `"teal"`) |
| `label` | `string` | Human-readable name (e.g., `"Pink"`, `"Blue"`)         |
| `hex`   | `string` | CSS hex color value (e.g., `"#dc267f"`)                |

#### Available Colors

| ID       | Label  | Hex       | Default? |
| -------- | ------ | --------- | -------- |
| `pink`   | Pink   | `#dc267f` | Yes (A)  |
| `blue`   | Blue   | `#648fff` | Yes (B)  |
| `amber`  | Amber  | `#ffb000` | Yes (C)  |
| `teal`   | Teal   | `#00b4d8` | No       |
| `purple` | Purple | `#7b2d8e` | No       |
| `red`    | Red    | `#e63946` | No       |
| `green`  | Green  | `#2a9d8f` | No       |
| `orange` | Orange | `#f77f00` | No       |

### ShapeOption (new)

A selectable shape from the curated palette.

| Field    | Type                                        | Description                                         |
| -------- | ------------------------------------------- | --------------------------------------------------- |
| `id`     | `string`                                    | Unique identifier (e.g., `"circle"`, `"diamond"`)   |
| `label`  | `string`                                    | Human-readable name (e.g., `"Circle"`, `"Diamond"`) |
| `pathFn` | `(width: number, height: number) => string` | SVG path generator function                         |

#### Available Shapes

| ID         | Label    | Description                                | Default? |
| ---------- | -------- | ------------------------------------------ | -------- |
| `circle`   | Circle   | Full circle centered in viewport           | Yes (A)  |
| `square`   | Square   | Fills entire viewport                      | Yes (B)  |
| `triangle` | Triangle | Equilateral triangle centered in viewport  | Yes (C)  |
| `diamond`  | Diamond  | Rotated square (45°) inscribed in viewport | No       |
| `star`     | Star     | 5-pointed star with inner/outer radius     | No       |
| `hexagon`  | Hexagon  | Regular hexagon centered in viewport       | No       |

### PatternOption (new)

A selectable shading/fill pattern from the curated palette.

| Field     | Type                           | Description                                                                 |
| --------- | ------------------------------ | --------------------------------------------------------------------------- |
| `id`      | `string`                       | Unique identifier (e.g., `"solid"`, `"dotted"`)                             |
| `label`   | `string`                       | Human-readable name (e.g., `"Solid"`, `"Dotted"`)                           |
| `applyFn` | `(svg: SVGSVGElement) => void` | Function that sets `--attribute-fill` CSS var (and adds `<defs>` if needed) |

#### Available Patterns

| ID           | Label      | Rendering Strategy                               | Default? |
| ------------ | ---------- | ------------------------------------------------ | -------- |
| `solid`      | Solid      | `--attribute-fill: var(--attribute-color)`       | Yes (A)  |
| `striped`    | Striped    | SVG `<pattern>` with vertical lines              | Yes (B)  |
| `open`       | Open       | `--attribute-fill: none`                         | Yes (C)  |
| `dotted`     | Dotted     | SVG `<pattern>` with small filled circles        | No       |
| `crosshatch` | Crosshatch | SVG `<pattern>` with crossed diagonal lines      | No       |
| `gradient`   | Gradient   | SVG `<linearGradient>` from color to transparent | No       |

### ActiveConfig (new, runtime)

The runtime configuration object that rendering functions read from. Derived from `PlayerPreferences` on app startup or when the player saves.

| Field             | Type                                              | Description                             |
| ----------------- | ------------------------------------------------- | --------------------------------------- |
| `colorHexMap`     | `Record<Color, string>`                           | Maps `Color.A/B/C` → hex string         |
| `shapePathMap`    | `Record<Shape, (w: number, h: number) => string>` | Maps `Shape.A/B/C` → SVG path generator |
| `shadingApplyMap` | `Record<Shading, (svg: SVGSVGElement) => void>`   | Maps `Shading.A/B/C` → fill applicator  |

Built from `PlayerPreferences` by looking up each selected option ID in the palette and extracting its visual data.

### Existing Entities (unchanged)

| Entity                                 | Impact                                                                    |
| -------------------------------------- | ------------------------------------------------------------------------- |
| `Card`                                 | Unchanged — still `{ num, shape, shading, color }` with enum values 0/1/2 |
| `Board`                                | Unchanged                                                                 |
| `Deck`                                 | Unchanged                                                                 |
| `GameState`                            | Unchanged                                                                 |
| `DifficultyLevel` / `DifficultyConfig` | Unchanged                                                                 |
| `Selection`                            | Unchanged                                                                 |

## State Transitions

```
[App Startup]
    │
    ├── Read localStorage("set-game-prefs")
    │   ├── Valid JSON → parse into PlayerPreferences → build ActiveConfig
    │   └── Missing/invalid → use DEFAULT_PREFERENCES → build ActiveConfig
    │
    ▼
┌──────────────┐
│ Title Screen  │
│ (ActiveConfig │
│  loaded)      │
└──────┬───────┘
       │ Player taps "Settings" button
       ▼
┌──────────────────┐
│  Config Screen    │  ← Shows current selections from ActiveConfig
│  (editing copy)   │     Live preview uses temporary config
└──────┬───────────┘
       │
       ├── Save → validate → write localStorage → update ActiveConfig → navigateTo("title")
       ├── Reset to Defaults → set selections to defaults (unsaved) → preview updates
       └── Back/Cancel → discard edits → navigateTo("title")
```

## Relationships

- `PlayerPreferences` → `ActiveConfig` (1:1 transformation on load/save)
- `ActiveConfig` → `renderColor()`, `renderShape()`, `renderShading()` (read at render time)
- `ColorOption.id` → `PlayerPreferences.colors[n]` (foreign key into palette)
- `ShapeOption.id` → `PlayerPreferences.shapes[n]` (foreign key into palette)
- `PatternOption.id` → `PlayerPreferences.patterns[n]` (foreign key into palette)
- `PlayerPreferences` ↔ `localStorage` (serialized as JSON string)
