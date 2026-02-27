# Research: Title Screen with Difficulty Selection

**Feature**: 005-title-screen-difficulty
**Date**: 2026-02-20

## Research Tasks

### 1. Which attribute to fix for 3-attribute mode (Easy/Normal)?

**Decision**: Fix **number** to a single value (`Num.A` = 1 shape per card).

**Rationale**:

- Fixing number simplifies the visual parsing — every card shows exactly one shape, reducing cognitive load. Players only need to evaluate shape, shading, and color.
- Color, shape, and shading remain as the 3 active attributes, preserving full visual variety across all three remaining dimensions.
- The existing `DeckOptions` interface already supports `nums: [Num.A]` to fix number to a single value. No new API needed.
- Mathematically, fixing any one attribute to a single value reduces the deck from 81 to 27 cards (3³). The `isValidSet` check trivially passes for the fixed dimension since `(x+x+x) % 3 === 0`.

**Alternatives considered**:

- Fix **color** — makes all cards monochrome, which removes visual richness. The game feels less colorful and engaging.
- Fix **shading** — visually less obvious since shading is a subtle attribute. Players might not notice the simplification.
- Fix **shape** — all cards have the same shape, which removes the most visually distinctive attribute. Would feel monotonous.

### 2. Board size 9 with 3 attributes — does `hasAnySet` work reliably?

**Decision**: Yes. With a 27-card deck (3 attributes × 3 values each) and 9 cards drawn, the probability of containing at least one valid set is extremely high. The existing retry loop in `generateBoardCards()` handles the rare miss case.

**Rationale**:

- With 3 attributes and 3 values each, there are 27 unique cards. Drawing 9 cards (1/3 of the deck) yields ${9 \choose 3} = 84$ possible triples.
- The mathematical probability of no valid set among 9 cards from a 27-card 3-attribute deck is very low (<1%).
- The existing retry logic in `generateBoardCards()` and `tryReplacement()` already handles this — no changes to the retry approach needed.

**Alternatives considered**:

- Pre-compute boards with guaranteed sets — unnecessarily complex; the retry approach is fast and proven.
- Increase board size to 12 for Easy — contradicts the spec requirement and removes a key differentiator from Normal.

### 3. Grid layout for 9 cards vs 12 cards

**Decision**:

- 9 cards: `grid-cols-3` (3×3 grid on all screen sizes)
- 12 cards: `grid-cols-3 sm:grid-cols-4` (3×4 on small screens, 4×3 on larger, matching current behavior)

**Rationale**:

- 9 cards divide evenly into a 3×3 grid — clean, balanced, and immediately visually distinct from the 12-card layout.
- The current 12-card layout already handles responsive breakpoints well.
- Dynamic grid class is set on `#game-board` when the game initializes, based on the chosen difficulty.

**Alternatives considered**:

- Always use `grid-cols-3` for both (9 = 3×3, 12 = 3×4) — works but the 4-column layout on wider screens is a better use of space for 12 cards.

### 4. Title screen implementation approach

**Decision**: Render title screen as static HTML in `index.vto`, hidden/shown via CSS classes in `main.ts`.

**Rationale**:

- The title screen is static content (heading + 3 buttons) — no dynamic rendering needed.
- Placing it in `index.vto` means it's part of the initial HTML, visible on first paint without waiting for JS to execute. This meets the FCP < 1s constitution requirement.
- `main.ts` adds click handlers and toggles visibility between title screen and game board.
- This is consistent with the existing approach where `index.vto` defines the `#game-board` container and `main.ts` populates it.

**Alternatives considered**:

- Generate title screen entirely in JS (`main.ts`) — delays first paint; title would flash in after JS loads. Violates FCP performance goal.
- Separate page/route for title screen — overengineered for a single-page game; adds routing complexity with no benefit.
- Lume partial/component — unnecessary abstraction for 10 lines of HTML.

### 5. Screen transition animation

**Decision**: Simple CSS fade transition (opacity 0→1 / 1→0) for title↔game transitions, ~300ms duration.

**Rationale**:

- Consistent with the existing animation philosophy (CSS-only, GPU-friendly `opacity` + `transform`).
- Fast enough to feel snappy; slow enough to feel intentional.
- No new animation library or framework needed — just a CSS transition on the container elements.

**Alternatives considered**:

- No transition (instant swap) — feels jarring and unpolished.
- Slide transition — more complex, requires transform + overflow management. Over-designed for this use case.
- Shared element transition (title text morphs into game header) — impressive but violates Simplicity principle.

### 6. "Back to title" UI placement

**Decision**: A text button above the game board, replacing the current `<h1>Set</h1>` heading with a clickable element that returns to the title screen.

**Rationale**:

- The current layout has `<h1>Set</h1>` above the game board. Converting this to a clickable "← Set" link or button reuses existing screen real estate without adding new chrome.
- Consistent with the Simplicity principle: no hamburger menus, no toolbars, no settings panels.
- Clear affordance: clicking the game title to return to the start is a common pattern.

**Alternatives considered**:

- Floating button / FAB — adds visual clutter to the game board.
- Separate toolbar/header — violates Simplicity; adds chrome.
- Long-press or swipe gesture — not discoverable.

### 7. GameState model extension

**Decision**: Add `difficulty: DifficultyLevel` field to `GameState`.

**Rationale**:

- The difficulty level must be known throughout the game session so that replacement cards respect the difficulty config.
- Storing it in `GameState` keeps all game-relevant state in one place, consistent with the existing immutable state pattern.
- The `DifficultyLevel` enum maps to a `DifficultyConfig` (boardSize + deckOptions) via a pure lookup function.

**Alternatives considered**:

- Pass difficulty as a closure/parameter to `selectCard` — breaks the clean `selectCard(state, index)` API.
- Store config outside `GameState` as module-level state — breaks the immutable, self-contained state pattern.
