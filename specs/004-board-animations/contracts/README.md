# Contracts: Board Animations

**Feature**: 004-board-animations  
**Date**: 2026-02-17

## Overview

This feature has **no API contracts** in the traditional sense (no REST endpoints, no GraphQL schema, no IPC protocol). It is a purely client-side UI feature that modifies the rendering layer.

The "contracts" for this feature are the **CSS animation interfaces** and the **TypeScript function signatures** that define how animation coordination works between modules.

## CSS Animation Keyframes Contract

These keyframes MUST be defined in `src/style.css` and are the shared animation vocabulary:

```css
/* Initial card deal — staggered per card */
@keyframes deal-in {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Card exit after valid set match */
@keyframes card-exit {
  from { opacity: 1; transform: scale(1); }
  to   { opacity: 0; transform: scale(0.8); }
}

/* New card entrance after replacement */
@keyframes card-enter {
  from { opacity: 0; transform: scale(0.8); }
  to   { opacity: 1; transform: scale(1); }
}

/* Valid set celebration pulse */
@keyframes set-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.05); }
}

/* Invalid set shake (existing, extended to 500ms) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%      { transform: translateX(-4px); }
  75%      { transform: translateX(4px); }
}
```

## Tailwind Utility Classes Contract

Custom utilities registered via `@utility` in `src/style.css`:

| Utility Class | Animation | Duration | Fill Mode |
|---|---|---|---|
| `animate-deal-in` | `deal-in` | 300ms ease-out | forwards |
| `animate-card-exit` | `card-exit` | 300ms ease-in | forwards |
| `animate-card-enter` | `card-enter` | 300ms ease-out | forwards |
| `animate-set-pulse` | `set-pulse` | 500ms ease-in-out | none |
| `animate-shake` | `shake` | 500ms ease | none |

## TypeScript Interface Contract

### AnimationPhase (new type)

```typescript
type AnimationPhase = "idle" | "dealing" | "feedback" | "exiting" | "entering";
```

### renderGame() — Modified Signature

```typescript
/**
 * Renders or patches the game board.
 * On first call: creates card elements with deal-in animation.
 * On subsequent calls: patches existing elements in-place.
 * 
 * @param state - Current game state
 * @param container - The #game-board element
 * @param onCardClick - Click handler for card selection
 * @param options - Animation options for the current render
 */
function renderGame(
  state: GameState,
  container: HTMLElement,
  onCardClick: (index: number) => void,
  options?: {
    animationClass?: string;        // CSS class to apply to changed cards
    affectedIndices?: number[];     // Which card positions to animate
    initialDeal?: boolean;          // Whether this is the first render (stagger deal)
  }
): void;
```

### renderCard() — Modified Signature

```typescript
/**
 * Creates or updates a card element.
 * 
 * @param card - Card data to render
 * @param selected - Whether the card is currently selected
 * @returns HTMLElement representing the card
 */
function renderCard(card: Card, selected?: boolean): HTMLElement;
```

No signature change — animation classes are applied by the caller (`renderGame`), not by `renderCard` itself.

## Timing Contract

All animation sequences MUST respect these timing constraints:

| Sequence | Total Duration | Breakdown |
|---|---|---|
| Initial deal | 1.2s | 12 cards × 100ms stagger delay + 300ms animation |
| Card selection | 300ms | Single transition |
| Valid set | 1.1s | 500ms feedback + 300ms exit + 300ms enter |
| Invalid set | 500ms | 500ms feedback (shake + red) |
| Card hover | 300ms | CSS transition |
| Card active | 150ms | CSS transition |

## Input Lock Contract

- When `AnimationPhase !== "idle"`: all `onCardClick` invocations are no-ops.
- The animation coordinator MUST set phase back to `"idle"` after the final animation in any sequence completes.
- No clicks are queued — they are silently dropped.
