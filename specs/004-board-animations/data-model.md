# Data Model: Board Animations

**Feature**: 004-board-animations  
**Date**: 2026-02-17

## Overview

This feature is primarily a **UI/rendering** feature — it does not change the core game data model (`GameState`, `Board`, `Selection`, `Card`, `Deck`). The data model changes are limited to introducing UI-layer state for animation coordination.

## Existing Entities (Unchanged)

### GameState

- `deck: Deck` — remaining cards to draw
- `board: Board` — the 12 cards currently displayed
- `selection: Selection` — indices of selected cards (0-3)

### Board

- `cards: readonly Card[]` — always 12 cards

### Selection

- `indices: readonly number[]` — 0 to 3 indices

### SelectionResult

- `type: "selected" | "valid_set" | "invalid_set"`
- `state: GameState` — the new state after the action

**No changes to any of these.** The game logic layer remains purely functional and unchanged.

## New UI-Layer State

### AnimationPhase (new enum-like type)

Represents the current phase of a blocking animation sequence.

| Value        | Description                                                                    |
| ------------ | ------------------------------------------------------------------------------ |
| `"idle"`     | No animation in progress. Input is enabled.                                    |
| `"dealing"`  | Initial board deal animation is playing. Input is disabled.                    |
| `"feedback"` | Valid or invalid set feedback animation is playing (500ms). Input is disabled. |
| `"exiting"`  | Matched cards are animating out (300ms). Input is disabled.                    |
| `"entering"` | New replacement cards are animating in (300ms). Input is disabled.             |

### AnimationState (new interface, UI-layer only)

Held in the game loop closure (`initGame` in `main.ts`), not in `GameState`.

| Field             | Type                           | Description                                                                                                                                 |
| ----------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `phase`           | `AnimationPhase`               | Current animation phase                                                                                                                     |
| `pendingState`    | `GameState \| null`            | The next game state to apply after animation completes (for valid sets, this holds the replacement board state during feedback/exit phases) |
| `feedbackType`    | `"valid" \| "invalid" \| null` | Type of feedback currently being shown                                                                                                      |
| `affectedIndices` | `number[]`                     | Board indices involved in the current animation (the 3 selected card indices)                                                               |

## State Transitions

```
idle → dealing (on initial render)
dealing → idle (after last card animates in, ~1.2s)

idle → feedback (on valid_set or invalid_set result)
feedback[invalid] → idle (after 500ms, clear selection UI)
feedback[valid] → exiting (after 500ms)
exiting → entering (after 300ms, apply pendingState, render new cards)
entering → idle (after 300ms, clear animation state)
```

## Rendering Model Changes

### Current: Full Re-render

- `renderGame()` wipes DOM via `innerHTML = ""` and rebuilds all 12 cards

### New: Incremental Patch

- `renderGame()` compares existing card elements with new state
- **Unchanged cards**: classes updated in-place (e.g., selection toggle)
- **Replaced cards**: element content replaced, entrance animation classes applied
- **Card identity**: each card element gets `data-index` for positional identity

### Card Element Lifecycle

```
[empty slot] → deal-in animation → visible card → hover/active states →
  select/deselect transitions → (if part of valid set) feedback → exit →
  replaced with new card → enter animation → visible card
```

## CSS Animation Definitions (New)

| Animation Name               | Duration | Easing      | Effect                                   |
| ---------------------------- | -------- | ----------- | ---------------------------------------- |
| `deal-in`                    | 300ms    | ease-out    | opacity 0→1, translateY(20px→0)          |
| `card-exit`                  | 300ms    | ease-in     | opacity 1→0, scale(1→0.8)                |
| `card-enter`                 | 300ms    | ease-out    | opacity 0→1, scale(0.8→1)                |
| `set-pulse`                  | 500ms    | ease-in-out | scale(1→1.05→1) with green border        |
| `shake` (existing, extended) | 500ms    | ease        | translateX(0→-4px→4px→0) with red border |

## Validation Rules

- `AnimationPhase` must be `"idle"` for card clicks to be processed
- `pendingState` must be non-null only during `"feedback"` and `"exiting"` phases for valid sets
- `affectedIndices` must contain exactly 3 indices during feedback/exit/enter phases, 0 during idle
- Stagger delay: `index * 100ms` for deal-in, no stagger for replacement cards

## Relationships

```
initGame (main.ts)
  ├── GameState (unchanged, from state/model.ts)
  ├── AnimationState (new, local to main.ts closure)
  └── renderGame (modified, from state/renderer.ts)
       ├── renderCard (modified, from card/renderer.ts)
       │    └── applies animation classes based on context
       └── patchBoard (new, incremental DOM update logic)
```
