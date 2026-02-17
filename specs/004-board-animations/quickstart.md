# Quickstart: Board Animations

**Feature**: 004-board-animations  
**Date**: 2026-02-17

## What This Feature Does

Adds six types of CSS animations to the Set card game:
1. **Initial deal** — cards appear one by one with staggered fade-in/slide-up
2. **Hover** — cards lift and gain shadow when the pointer is over them
3. **Active/pressed** — cards scale down slightly when pressed
4. **Selection** — smooth transition between selected/unselected visual states
5. **Valid set feedback** — green pulse on matched cards, then exit → enter new cards
6. **Invalid set feedback** — red shake on unmatched cards, then clear selection

## Architecture Overview

```
src/game/main.ts          ← Animation coordinator (phases, input locking)
src/game/state/renderer.ts ← Incremental DOM patching (replaces innerHTML wipe)
src/game/card/renderer.ts  ← Card element creation (hover/active via CSS classes)
src/style.css              ← @keyframes + @utility definitions
```

### Key Design Decision: Incremental DOM Patching

The current renderer destroys and recreates all 12 card DOM elements on every state change (`innerHTML = ""`). This kills any in-progress animation. The main change is switching to **incremental patching** — reusing existing card elements and only updating their classes/content when the underlying card data changes. This preserves element identity so CSS transitions and animations can complete.

### Key Design Decision: Animation Coordinator

Animation orchestration lives in `main.ts` (the game loop), not in the state module. The game state (`GameState`) remains purely functional and unchanged. An `AnimationPhase` flag controls:
- Whether clicks are processed
- What CSS animation classes to apply
- When state transitions are applied to the DOM

## Files Modified

| File | Change |
|---|---|
| `src/style.css` | Add 4 new `@keyframes` + 5 `@utility` classes. Extend `shake` to 500ms. |
| `src/game/card/renderer.ts` | Update hover/active Tailwind classes. Increase transition to 300ms. |
| `src/game/state/renderer.ts` | Replace `innerHTML` wipe with incremental DOM patching. Add `options` parameter. |
| `src/game/main.ts` | Add animation coordinator with phase tracking, input locking, and sequenced timeouts. |

## Files Added

None. All changes modify existing files.

## How to Verify

```bash
# Build and serve locally
deno task serve

# Run existing tests (animation doesn't break game logic)
deno task test
```

### Manual Verification Checklist

1. **Deal animation**: Refresh the page. Cards should appear one by one (1.2s total).
2. **Hover**: Move mouse over a card — it lifts and gains shadow.
3. **Active**: Press and hold a card — it scales down slightly.
4. **Selection**: Click a card — smooth border/ring transition to selected state.
5. **Valid set**: Select 3 cards that form a valid set — green pulse, cards shrink out, new cards grow in.
6. **Invalid set**: Select 3 cards that don't form a valid set — red shake, then selection clears.
7. **Input lock**: During any of the above multi-step animations, rapidly click other cards — clicks should be ignored.
8. **Board stability**: After a valid set, the 9 non-replaced cards should not move or re-animate.

## Dependencies

None added. Uses only existing Tailwind CSS v4 features (`@keyframes`, `@utility`, utility classes).

## Timing Reference

| Animation | Duration |
|---|---|
| Deal stagger | 100ms per card (1.2s total) |
| Deal card animation | 300ms ease-out |
| Hover/selection transition | 300ms |
| Active transition | 150ms |
| Valid set pulse | 500ms |
| Invalid set shake | 500ms |
| Card exit | 300ms |
| Card enter | 300ms |
| Full valid-set sequence | 1.1s |
