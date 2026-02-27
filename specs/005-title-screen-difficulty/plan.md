# Implementation Plan: Title Screen with Difficulty Selection

**Branch**: `005-title-screen-difficulty` | **Date**: 2026-02-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-title-screen-difficulty/spec.md`

## Summary

Add a title screen that gates gameplay behind a difficulty selection (Easy / Normal / Hard). Difficulty controls two parameters: board size (9 or 12 cards) and active attribute count (3 or 4). The existing `DeckOptions` infrastructure already supports restricting attributes to 1 value, so difficulty is implemented by passing the appropriate options to `createDeck()` and parameterizing `generateInitialState()` with the board size. A new `difficulty/` domain module defines the configuration mapping. The title screen is rendered in `main.ts` using DOM manipulation, consistent with the existing rendering approach. A "back" button during gameplay returns to the title screen.

## Technical Context

**Language/Version**: TypeScript (Deno latest stable)
**Primary Dependencies**: Lume v3.2.1 (SSG), Tailwind CSS v4, esbuild (bundler) — zero runtime dependencies
**Storage**: N/A — no persistence, state is in-memory only
**Testing**: `deno test -A` with `jsr:@std/assert@1`, co-located `*_test.ts` files
**Target Platform**: Modern evergreen browsers (last 2 versions of Chrome, Firefox, Safari, Edge), PWA-capable
**Project Type**: Single web application (static site via Lume)
**Performance Goals**: FCP < 1s, total payload < 100 KB compressed
**Constraints**: Offline-capable (Service Worker), no external runtime dependencies, DOM-based rendering
**Scale/Scope**: Single-player browser game, ~600 LOC game logic

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle             | Status | Notes                                                                                                                                                                                       |
| --------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Lightweight & Fast | PASS   | Title screen is pure DOM + Tailwind classes, no new dependencies. Three buttons add negligible payload.                                                                                     |
| II. Offline-First     | PASS   | No network calls. Title screen is part of the static build, cached by existing Service Worker.                                                                                              |
| III. Simplicity       | PASS   | Title screen shows only what's needed: game name + 3 buttons. "Back" button is the single addition during gameplay. Difficulty config is a small lookup — no settings panel or persistence. |
| Runtime: Deno         | PASS   | All code is Deno TypeScript.                                                                                                                                                                |
| Language: TypeScript  | PASS   | No new languages introduced.                                                                                                                                                                |
| Styling: Tailwind CSS | PASS   | Title screen styled with Tailwind utility classes only.                                                                                                                                     |
| Build: Lume           | PASS   | Existing Lume pipeline handles the new code via esbuild.                                                                                                                                    |
| Testing: deno test    | PASS   | New tests follow existing co-located `*_test.ts` pattern.                                                                                                                                   |
| WCAG 2.1 AA           | PASS   | Buttons are semantic `<button>` elements with clear labels. Contrast ratios maintained.                                                                                                     |

No violations. No complexity tracking needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-title-screen-difficulty/
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
├── index.vto                          # Modified: add title screen container, hide game board initially, add back button
├── style.css                          # Modified: add title screen transition animations
├── game/
│   ├── main.ts                        # Modified: add screen routing (title ↔ game), pass difficulty config
│   ├── difficulty/                    # NEW: difficulty domain module
│   │   ├── mod.ts                     # Public API barrel
│   │   ├── model.ts                   # DifficultyLevel enum + DifficultyConfig type
│   │   └── model_test.ts             # Tests for difficulty config mapping
│   └── state/
│       ├── generator.ts               # Modified: accept boardSize parameter
│       ├── generator_test.ts          # Modified: test with different board sizes
│       ├── actions.ts                 # No changes needed (replacement count is always 3)
│       └── model.ts                   # Modified: add difficulty to GameState
```

**Structure Decision**: New `difficulty/` folder follows the existing domain-per-folder convention (attributes/, card/, deck/, board/, selection/, set/, state/). Minimal file count — just `mod.ts`, `model.ts`, and a test file.

## Key Architectural Decisions

### 1. Difficulty = DeckOptions + Board Size

Each difficulty maps to a `{ boardSize, deckOptions }` config:

- **Easy**: `boardSize: 9`, fix one attribute to a single value → 27-card deck, 3 active attributes
- **Normal**: `boardSize: 12`, fix one attribute to a single value → 27-card deck, 3 active attributes
- **Hard**: `boardSize: 12`, all attributes vary → 81-card deck, 4 active attributes

The fixed attribute for Easy/Normal is **number** (fixed to `Num.A` = 1 shape per card). Every card shows exactly one shape, reducing cognitive load. Shape, shading, and color remain as the 3 active attributes, preserving full visual variety.

### 2. No Changes to Set Validation

`isValidSet()` checks all 4 attributes with `(a+b+c) % 3 === 0`. When one attribute is fixed to a single value across all cards, the check trivially passes for that dimension (`(x+x+x) % 3 === 0` for any x). No code changes needed in `set/validator.ts`.

### 3. No Changes to Board Replacement Logic

`selectCard()` in `state/actions.ts` draws 3 replacement cards and retries until `hasAnySet` passes. This logic is board-size-agnostic — it replaces 3 cards at the selected indices regardless of whether the board has 9 or 12 total cards. No changes needed.

### 4. Title Screen in main.ts, Not a Separate Module

The title screen is a simple DOM state: show title + buttons, hide game board. On difficulty click, hide title, show game board, call `initGame()` with config. This is ~30 lines of DOM code in `main.ts`, not warranting a separate renderer module.

### 5. Grid Layout Adapts to Board Size

- 9 cards (Easy): `grid-cols-3` (3×3 grid)
- 12 cards (Normal/Hard): `grid-cols-3 sm:grid-cols-4` (current layout)

The grid class is set dynamically on `#game-board` when the game starts.

### 6. Difficulty Stored in GameState

`GameState` gains a `difficulty` field so that the replacement logic and any future features can reference the current configuration without passing it as a separate parameter.
