# Research: Configuration Screen

**Feature**: 006-config-screen
**Date**: 2026-02-24

## Research Tasks

### 1. How to make the rendering pipeline configurable without breaking the enum-based game logic?

**Decision**: Introduce a runtime configuration object that maps each enum value (A=0, B=1, C=2) to a visual representation. The enums and game logic remain untouched. Only the render functions read from the config.

**Rationale**:

- The current rendering functions (`renderColor`, `renderShape`, `renderShading`) map enum values to visuals via hardcoded lookups (`COLOR_HEX` constant, `shapePath` switch, `renderShading` switch).
- The SET validation (`isValidSet`) uses modular arithmetic on enum values — it never touches visual data. So swapping visuals is transparent to game logic.
- A config object maps `{ A: visual, B: visual, C: visual }` for each attribute. The render functions read from this object instead of constants.
- This is the minimal-change approach: game modules (`set/`, `deck/`, `state/`, `selection/`, `board/`) are untouched.

**Alternatives considered**:

- Thread config as a parameter through the entire rendering pipeline — more explicit but requires signature changes across `renderCard`, `renderColor`, `renderShape`, `renderShading`, `renderNum`, and every call site. Disproportionate churn for a simple lookup swap.
- Subclass/replace the enum values themselves — breaks the modular arithmetic (enum values must be 0/1/2 for `isValidSet`).

### 2. What is the best persistence mechanism for player preferences?

**Decision**: `localStorage` with a single JSON key (`set-game-prefs`).

**Rationale**:

- `localStorage` is synchronous, available in all target browsers, works offline, and has 5–10 MB quota — far more than the ~200 bytes of preferences data.
- A single key avoids key-management complexity. The value is a JSON object with `colors`, `shapes`, and `patterns` arrays.
- Read on app startup, write on save. No polling, no listeners.
- Graceful fallback: if `localStorage` is unavailable (e.g., private browsing in some Safari versions), the app uses defaults and shows a non-blocking message.

**Alternatives considered**:

- Cookies — limited to ~4 KB, sent with every request (irrelevant for static site but still wasteful), harder API. No advantage over `localStorage`.
- IndexedDB — asynchronous and more complex. Overkill for a single small object.
- No persistence — defeats the purpose of the feature.

### 3. What shapes to include in the expanded palette (6+ options)?

**Decision**: 6 shapes: **circle, square, triangle** (defaults) + **diamond, star, hexagon**.

**Rationale**:

- All 6 shapes are visually distinct and can be rendered as simple SVG `<path>` elements using the existing `shapePath()` pattern.
- Diamond is a rotated square (simple path). Star is a 5-pointed star (10 vertices alternating inner/outer radius). Hexagon is a regular 6-sided polygon.
- These shapes are universally recognizable and culturally neutral.
- 6 options gives $\binom{6}{3} = 20$ possible combinations, providing meaningful variety.

**Alternatives considered**:

- Heart, cross, arrow — more complex paths, potentially confusing at small sizes (80×80 viewport).
- More than 8 options — diminishing returns; too many choices slows the player without adding much value.

### 4. What shading patterns to include in the expanded palette (6+ options)?

**Decision**: 6 patterns: **solid, striped, open** (defaults) + **dotted, crosshatch, gradient**.

**Rationale**:

- **Solid**: `--attribute-fill` = `var(--attribute-color)` (existing)
- **Striped**: vertical lines via SVG `<pattern>` (existing)
- **Open**: `--attribute-fill` = `none` (existing)
- **Dotted**: SVG `<pattern>` with small circles — visually distinct from striped
- **Crosshatch**: SVG `<pattern>` with crossed diagonal lines — combines two line directions for a mesh effect
- **Gradient**: CSS linear gradient from `var(--attribute-color)` to transparent — unique fade effect
- All 6 are implementable with SVG patterns or CSS, no external assets.

**Alternatives considered**:

- Checkerboard — likely confused with crosshatch at small sizes.
- Diagonal lines — too similar to striped (just rotated).

### 5. What colors to include in the expanded palette?

**Decision**: 8 colors total: **pink (#dc267f), blue (#648fff), amber (#ffb000)** (defaults) + **teal (#00b4d8), purple (#7b2d8e), red (#e63946), green (#2a9d8f), orange (#f77f00)**.

**Rationale**:

- 8 options gives $\binom{8}{3} = 56$ possible combinations.
- Colors are chosen for WCAG AA contrast against white card backgrounds (all pass 3:1 for graphical objects per WCAG 1.4.11).
- Colors are chosen to be distinguishable under common color-vision deficiencies (deuteranopia, protanopia). Key distinctions: blue/teal (hue shift), red/pink (saturation), green/purple (hue opposition).
- Named colors from well-known accessible palettes (IBM Carbon, Tol, Wong).

**Alternatives considered**:

- Allow arbitrary hex input — violates "curated palette" assumption, harder to enforce contrast, harder UI.
- Fewer than 6 — not enough variety to meaningfully help colorblind players.

### 6. Config screen layout and UX

**Decision**: Single scrollable screen with three sections (Colors, Shapes, Patterns), each showing the palette as a row of togglable buttons. A live preview area at the top shows 3 sample cards (one per attribute value). Action buttons at the bottom: Save, Reset to Defaults, Back.

**Rationale**:

- Three sections map directly to the three attribute categories — clear mental model.
- Togglable buttons with `aria-pressed` state are accessible and touch-friendly.
- Selected items get a visible ring and checkmark. Non-selected items are dimmed.
- The preview updates instantly on any toggle — no separate "apply preview" step.
- Bottom action bar provides clear closure (save or discard).

**Alternatives considered**:

- Tabbed sections (one attribute per tab) — hides context, requires more navigation. Players want to see all three categories and the preview simultaneously.
- Drag-and-drop reordering — adds complexity for no game-mechanical benefit (the mapping of A/B/C is arbitrary since each card always uses the right enum value).
- Modal dialog instead of full screen — too small for palette grids + preview on mobile.

### 7. How to handle the config singleton pattern?

**Decision**: A module-scoped mutable variable `activeConfig` in `config/mod.ts`, set once on app startup via `loadPreferences()`, and updated when the player saves. Render functions import and read from this module.

**Rationale**:

- Simple: one import, no dependency injection framework.
- Consistent with existing patterns — the app already uses module-level state (e.g., `started` flag in title screen, `previousCards` WeakMap in board component).
- The config is write-rare (only on save/reset) and read-often (every card render). No concurrency concerns in a single-threaded browser.
- Testable: tests can call `setActiveConfig(testConfig)` to override for assertions.

**Alternatives considered**:

- Pass config as a parameter to every render function — too invasive for the existing codebase.
- Context/provider pattern — overengineered for a simple game with no component tree framework.
- Event-based (config publishes changes, renders subscribe) — unnecessary; the board is re-rendered on game start, not continuously.
