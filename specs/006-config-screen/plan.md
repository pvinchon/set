# Implementation Plan: Configuration Screen

**Branch**: `006-config-screen` | **Date**: 2026-02-24 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-config-screen/spec.md`

## Summary

Add a configuration screen accessible from the title screen where players can customize the three colors, three shapes, and three shading patterns displayed on cards. Each attribute category offers a curated palette of at least six options; players select exactly three per category. A live preview shows sample cards with the current selections. Preferences are persisted to `localStorage` so they survive browser sessions. The existing rendering pipeline (`renderColor`, `renderShape`, `renderShading`) is refactored to read from a runtime configuration object rather than hardcoded constants. A new `config/` domain module owns the preferences model, persistence, and default values. The config screen is a new `ScreenDef` registered in the router alongside `title` and `play`.

## Technical Context

**Language/Version**: TypeScript (Deno latest stable)
**Primary Dependencies**: Lume v3.2.1 (SSG), Tailwind CSS v4, esbuild (bundler) — zero runtime dependencies
**Storage**: `localStorage` for player preferences (JSON-serialized)
**Testing**: `deno test -A` with `jsr:@std/assert@1`, co-located `*_test.ts` files
**Target Platform**: Modern evergreen browsers (last 2 versions of Chrome, Firefox, Safari, Edge), PWA-capable
**Project Type**: Single web application (static site via Lume)
**Performance Goals**: FCP < 1s, total payload < 100 KB compressed, live preview updates < 200ms
**Constraints**: Offline-capable (Service Worker), no external runtime dependencies, DOM-based rendering
**Scale/Scope**: Single-player browser game, ~800 LOC game logic (post-feature)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle             | Status | Notes                                                                                                                                                                                                                                    |
| --------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Lightweight & Fast | PASS   | Config screen is pure DOM + Tailwind classes. Palette data is a small static array (~1 KB). No new dependencies. `localStorage` is native API.                                                                                           |
| II. Offline-First     | PASS   | No network calls. Config screen is part of the static build, cached by existing Service Worker. `localStorage` works offline.                                                                                                            |
| III. Simplicity       | WATCH  | Adding a config screen introduces UI chrome beyond the cards. Justified: the spec explicitly requires it for accessibility and personalization. The screen is navigated to intentionally — it does not clutter the game or title screen. |
| Runtime: Deno         | PASS   | All code is Deno TypeScript.                                                                                                                                                                                                             |
| Language: TypeScript  | PASS   | No new languages introduced.                                                                                                                                                                                                             |
| Styling: Tailwind CSS | PASS   | Config screen styled with Tailwind utility classes only.                                                                                                                                                                                 |
| Build: Lume           | PASS   | Existing Lume pipeline handles the new code via esbuild. No new entry points.                                                                                                                                                            |
| Testing: deno test    | PASS   | New tests follow existing co-located `*_test.ts` pattern.                                                                                                                                                                                |
| WCAG 2.1 AA           | PASS   | Palette options are `<button>` elements with `aria-pressed` state. Color swatches include text labels. Keyboard navigation via standard tab order. Contrast ratios maintained.                                                           |

The "Simplicity" principle warrants a WATCH — the constitution says "no settings panels unless absolutely required." This feature adds a settings-like panel, but it is justified by the spec's accessibility rationale (colorblind support) and is entirely opt-in (accessed via a button, not shown by default).

## Project Structure

### Documentation (this feature)

```text
specs/006-config-screen/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── README.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── game/
│   ├── main.ts                          # MODIFIED: register config screen in router, load prefs on init
│   ├── config/                          # NEW: configuration domain module
│   │   ├── mod.ts                       # Public API barrel
│   │   ├── model.ts                     # Preferences type, palette definitions, defaults
│   │   ├── model_test.ts               # Tests for defaults, validation
│   │   ├── persistence.ts              # localStorage read/write/clear with fallback
│   │   └── persistence_test.ts         # Tests for persistence (with localStorage mock)
│   ├── attributes/
│   │   ├── color.ts                     # MODIFIED: render reads from runtime config, not constant
│   │   ├── shape.ts                     # MODIFIED: render reads from runtime config, new shape paths
│   │   └── shading.ts                  # MODIFIED: render reads from runtime config, new patterns
│   └── card/
│       └── renderer.ts                  # MODIFIED: accept config parameter for rendering pipeline
├── screens/
│   └── config/                          # NEW: configuration screen
│       └── component.ts                 # Config screen UI: palette selectors, preview, save/reset/back
└── style.css                            # MODIFIED: add styles for palette buttons (selected state ring)
```

**Structure Decision**: New `config/` module under `src/game/` for the domain model and persistence, following the existing domain-per-folder convention. New `config/` screen under `src/screens/` for the UI component, following the existing `title/` and `play/` pattern.

## Key Architectural Decisions

### 1. Config = Rendering Lookup, Not Game Logic

The configuration screen changes how enum values A/B/C _look_ — it does not change game mechanics. The `Color`, `Shape`, and `Shading` enums remain 0/1/2. The config maps each enum value to a _visual representation_ (hex color, SVG path generator, fill pattern). This separation means:

- `isValidSet()` is unchanged — it operates on enum values
- `createDeck()` is unchanged — it generates cards with enum values
- Only the rendering functions (`renderColor`, `renderShape`, `renderShading`) need to read from the config

### 2. Runtime Config Object, Not Module Constants

Currently `COLOR_HEX` is a module-level constant and `shapePath`/`renderShading` use switch statements. These are refactored to accept a config object parameter, or to read from a shared mutable config singleton that is set on app startup from `localStorage`. The singleton approach is simpler and avoids threading config through every function call.

**Chosen approach**: A module-level mutable config singleton (`activeConfig`) in `config/mod.ts`, initialized from `localStorage` on app startup. The rendering functions read from this singleton. The config screen writes to it and persists to `localStorage`.

### 3. Palette = Static Array of Options

Each attribute category has a fixed palette of at least 6 options defined at build time:

- **Colors**: 8 options (the 3 defaults + 5 additional: teal, purple, red, green, orange)
- **Shapes**: 6 options (circle, square, triangle, diamond, star, hexagon)
- **Patterns**: 6 options (solid, striped, open, dotted, crosshatch, gradient)

Players select exactly 3 from each palette. The palette arrays are typed constants in `config/model.ts`.

### 4. Config Screen as a Router Screen

The config screen is a `ScreenDef` registered in the router as `"config"`. Navigation: title → config (via button), config → title (via back/save). This follows the existing screen pattern exactly (see `createTitleScreen`, `createPlayScreen`).

### 5. localStorage for Persistence

Preferences are stored as a single JSON object under a well-known key (`set-game-prefs`). On load, the app reads this key, validates the structure, and falls back to defaults on any error. No cookies — `localStorage` is simpler and has more capacity.

### 6. Validation: Exactly 3 Distinct Per Category

The save action validates that exactly 3 distinct items are selected per attribute. The UI enforces this by disabling further selection when 3 are chosen (toggle behavior: clicking a selected item deselects it). The save button is disabled when any category has fewer than 3 selections.

## Complexity Tracking

| Violation                       | Why Needed                                                                                                   | Simpler Alternative Rejected Because                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| Settings panel (Simplicity III) | Accessibility: colorblind players need to choose high-contrast color schemes. Personalization: game variety. | No alternative achieves the accessibility goal. The panel is opt-in and hidden by default. |
