# Quickstart: Configuration Screen

**Feature**: 006-config-screen
**Date**: 2026-02-24

## Prerequisites

- Deno (latest stable) installed
- Repository cloned, on branch `006-config-screen`

## Development

```bash
# Start dev server
deno task serve

# Run tests
deno task test

# Build for production
deno task build

# Format code
deno task fmt

# Lint code
deno task lint
```

## Architecture Overview

This feature adds a **configuration screen** for players to customize card appearance (colors, shapes, patterns). Preferences are persisted to `localStorage`. The rendering pipeline reads from a runtime config object instead of hardcoded constants.

### New: `src/game/config/`

Domain module for preferences, palettes, persistence, and runtime config:

| File                  | Purpose                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `model.ts`            | `PlayerPreferences` type, palette arrays (`COLOR_PALETTE`, `SHAPE_PALETTE`, `PATTERN_PALETTE`), `DEFAULT_PREFERENCES`, `ActiveConfig` type, `buildActiveConfig()` |
| `mod.ts`              | Barrel re-exports + `getActiveConfig()` / `setActiveConfig()` singleton                                                                                           |
| `model_test.ts`       | Tests for defaults, validation, config building                                                                                                                   |
| `persistence.ts`      | `loadPreferences()`, `savePreferences()`, `clearPreferences()`                                                                                                    |
| `persistence_test.ts` | Tests for localStorage read/write/fallback                                                                                                                        |

### New: `src/screens/config/`

Configuration screen UI:

| File           | Purpose                                                                           |
| -------------- | --------------------------------------------------------------------------------- |
| `component.ts` | `createConfigScreen()` — palette selectors, live preview, save/reset/back buttons |

### Modified: `src/game/attributes/`

Rendering functions refactored to read from `ActiveConfig` instead of constants:

| File         | Change                                                                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color.ts`   | `renderColor()` reads `getActiveConfig().colorHexMap[color]` instead of `COLOR_HEX[color]`                                                               |
| `shape.ts`   | `shapePath()` calls `getActiveConfig().shapePathMap[shape](w, h)` instead of switch. New shape path functions for diamond/star/hexagon added.            |
| `shading.ts` | `renderShading()` calls `getActiveConfig().shadingApplyMap[shading](svg)` instead of switch. New pattern functions for dotted/crosshatch/gradient added. |

### Modified: `src/game/main.ts`

- Loads preferences from `localStorage` on startup
- Builds and sets `ActiveConfig`
- Registers `config` screen in router
- Passes `onSave` callback to config screen that persists + updates active config

### Modified: `src/screens/title/component.ts`

- Adds a "Settings" button below the difficulty buttons
- Settings button navigates to `router.navigateTo("config")`

### Modified: `src/style.css`

- Adds utility classes for palette button selected state (ring, scale)

## Key Design Decisions

1. **Config = rendering lookup, not game logic**: Enums (0/1/2) and set validation are untouched. Only the visual mapping changes.

2. **Runtime config singleton**: Module-scoped `activeConfig` initialized on startup from `localStorage`. Render functions import and read from it. No dependency injection needed.

3. **Curated palettes**: 8 colors, 6 shapes, 6 patterns — all defined as typed constants. Players select 3 per category.

4. **localStorage persistence**: Single JSON key (`set-game-prefs`). Validated on read with full fallback to defaults.

5. **Config screen as ScreenDef**: Follows the exact same pattern as title and play screens. Navigated via the existing router.

## File Dependency Order (for implementation)

```
1. src/game/config/model.ts          — types, palettes, defaults, buildActiveConfig
2. src/game/config/model_test.ts     — test defaults and config building
3. src/game/config/persistence.ts    — localStorage read/write
4. src/game/config/persistence_test.ts — test persistence
5. src/game/config/mod.ts            — barrel + singleton
6. src/game/attributes/color.ts      — refactor to read from ActiveConfig
7. src/game/attributes/shape.ts      — refactor + add new shape paths
8. src/game/attributes/shading.ts    — refactor + add new pattern renderers
9. src/screens/config/component.ts   — config screen UI
10. src/screens/title/component.ts   — add Settings button
11. src/game/main.ts                 — wire everything together
12. src/style.css                    — selected state styles
```
