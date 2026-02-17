# Research: Board Animations

**Feature**: 004-board-animations  
**Date**: 2026-02-17

## Research Task 1: Current Rendering Architecture Limitations

### Context
The spec requires six distinct animation types (deal, hover, active, selection, valid/invalid feedback, replacement). The current rendering pipeline uses `container.innerHTML = ""` followed by full DOM reconstruction on every state change. This destroys all existing DOM nodes, killing any in-progress CSS animations/transitions.

### Findings
- `renderGame()` in `src/game/state/renderer.ts` wipes and rebuilds all 12 card elements on every call.
- `handleCardClick()` in `src/game/main.ts` calls `render()` synchronously after `selectCard()`, meaning:
  - For **valid sets**: the board state already contains replacement cards when `render()` fires — there is no intermediate "show old cards animating out" phase.
  - For **invalid sets**: the selection is already cleared when `render()` fires — the selected cards lose their styling instantly.
- The 300ms `setTimeout` for `data-feedback` is effectively a race condition: the DOM nodes the feedback classes target are destroyed by `render()` before the animation can play.

### Decision: Switch to incremental DOM patching
- **Chosen approach**: Replace `innerHTML = ""` with a patch-based renderer that reuses existing card elements and only updates changed attributes/classes.
- **Rationale**: Incremental DOM updates preserve element identity, allowing CSS transitions/animations to play without interruption. This is the simplest approach that enables all animation types.
- **Alternatives considered**:
  - **Virtual DOM library** (Preact, etc.) — rejected per constitution (zero external runtime dependencies).
  - **Deferred re-render with clone** (clone DOM, animate, then swap) — rejected as overly complex and fragile.
  - **Animation-then-render callback chain** — viable but couples animation logic to state management; harder to maintain.

## Research Task 2: Animation Phasing for Valid/Invalid Set Feedback

### Context
Valid set flow requires: show feedback → animate out old cards → animate in new cards → re-enable input. Invalid set flow requires: show feedback + shake → clear selection → re-enable input. Both need the render to be **deferred** until after animation completes.

### Findings
- Current `selectCard()` returns `{ type, state }` synchronously — the new state is **already computed** (including replacement cards for valid sets).
- The `data-feedback` attribute on the container triggers Tailwind group-data variants on selected cards (`group-data-[feedback=valid]:border-green-600`, etc.).
- The existing `animate-shake` keyframe animation is 0.3s — will be extended to 500ms per spec timing.

### Decision: Introduce an animation coordinator in main.ts
- **Chosen approach**: Add an `animating` flag in the game loop (`main.ts`). When a valid/invalid set is detected, the coordinator:
  1. Sets feedback state on the DOM (not in `render()` — directly on the already-rendered card elements).
  2. Waits for feedback animation to complete (via `animationend`/`transitionend` or `setTimeout`).
  3. For valid sets: animates out the matched cards, then updates state, then renders the new cards with entrance animation.
  4. For invalid sets: clears the feedback, re-renders with selection cleared.
  5. Clears the `animating` flag to re-enable input.
- **Rationale**: Keeps animation orchestration in the UI layer (`main.ts`) without polluting the pure game logic (`state/actions.ts`). The state module remains purely functional and testable.
- **Alternatives considered**:
  - **State machine with animation states** — adds complexity to the data model for UI-only concerns; rejected per constitution simplicity principle.
  - **Promise-based animation API** — viable, but `setTimeout`/`animationend` is simpler and sufficient for the fixed timing profile.

## Research Task 3: Staggered Deal Animation Technique

### Context
FR-001 requires cards to appear with staggered entrance animation on initial render. The board is a CSS grid with 12 cards.

### Findings
- Cards are rendered as `<div>` elements appended to a grid container.
- Tailwind CSS v4 supports arbitrary properties and utilities via `@utility` directives.
- CSS `animation-delay` with inline styles is the simplest stagger mechanism — no JS animation library needed.

### Decision: CSS animation with per-card `animation-delay` via inline style
- **Chosen approach**: Define a `@keyframes deal-in` animation (opacity 0→1, translateY 20px→0). Apply it to cards on initial render with `animation-delay: ${index * 100}ms` as an inline style. Cards start invisible (`opacity: 0`) and the animation fills forward.
- **Rationale**: Pure CSS approach, zero JS overhead, works with Tailwind's utility system, and stagger delay is trivially computed from the card index.
- **Alternatives considered**:
  - **Web Animations API** — more control but adds JS complexity for no benefit with fixed timing.
  - **Intersection Observer** — designed for scroll-triggered animations; overkill for a single board render.

## Research Task 4: Hover & Active States

### Context
FR-002/FR-003 require visible hover and active/pressed effects.

### Findings
- Cards already have `hover:-translate-y-0.5 hover:shadow-lg` and `transition-all duration-150 ease-in-out`.
- The existing hover effect is minimal (0.5 unit lift + shadow). Can be enhanced.
- No `active:` state classes exist currently.

### Decision: Extend existing Tailwind utility classes
- **Chosen approach**: Enhance hover with `hover:-translate-y-1 hover:shadow-xl hover:scale-[1.02]` and add `active:scale-[0.97] active:shadow-sm` for pressed state. Increase transition duration to 300ms to match spec timing.
- **Rationale**: Pure CSS, no JS needed, works with Tailwind's existing utility-first approach, respects constitution simplicity.
- **Alternatives considered**:
  - **JS event listeners for mousedown/mouseup** — unnecessary since CSS `:active` pseudo-class handles this natively.
  - **Custom keyframe animation on hover** — overkill for a simple transform+shadow transition.

## Research Task 5: Input Locking During Animations

### Context
FR-010 requires silently dropping all clicks during blocking animations.

### Findings
- Click handlers are attached per-card via `addEventListener` in `renderGame()`.
- With incremental rendering, handlers will persist on elements.
- Need a mechanism to short-circuit the click handler when animating.

### Decision: Boolean flag `isAnimating` in the game loop
- **Chosen approach**: Add `let isAnimating = false` in `initGame()`. `handleCardClick()` returns early if `isAnimating` is true. Animation coordinator sets/clears the flag.
- **Rationale**: Simplest possible mechanism — a single boolean gate. No need for event listener removal/re-attachment or CSS `pointer-events: none`.
- **Alternatives considered**:
  - **`pointer-events: none` on container** — CSS approach, but harder to guarantee cleanup and doesn't prevent programmatic event dispatch.
  - **Remove/re-attach event listeners** — unnecessary complexity with incremental rendering.

## Research Task 6: Replacement Animation Sequencing

### Context
Valid set flow: feedback (500ms) → exit old cards (300ms) → enter new cards (300ms) = 1.1s total. Must not exceed 1.5s cap (SC-002).

### Findings
- `selectCard()` already computes the replacement board state synchronously.
- The replacement indices are known from `selection.indices`.
- With incremental rendering, old card elements can be animated out before patching in new card data.

### Decision: Three-phase animation sequence with delayed state application
- **Chosen approach**:
  1. **Phase 1 (Feedback)**: Apply feedback classes to selected card elements. Wait 500ms.
  2. **Phase 2 (Exit)**: Apply exit animation (scale-down + fade-out) to the three matched card elements. Wait 300ms.
  3. **Phase 3 (Enter)**: Apply the new state (which has replacement cards). Patch only the three replaced card elements with new card data + entrance animation classes. Wait 300ms.
  4. Clear `isAnimating` flag.
- The "old state" is held during phases 1-2, and the "new state" (with replacements) is applied only at phase 3.
- **Rationale**: Clean separation of animation phases. State remains immutable and pure — the delay is only in when it's applied to the DOM.
- **Alternatives considered**:
  - **Single animation with CSS `@keyframes` chaining** — harder to coordinate with state changes and doesn't allow state deferral.

## Research Task 7: Constitution Compliance

### Findings
All animation approaches use pure CSS (Tailwind utilities + custom `@keyframes`) with minimal JS coordination. No external dependencies added.

| Constitution Principle | Compliance |
|---|---|
| I. Lightweight & Fast | ✅ Zero new dependencies. CSS animations are GPU-accelerated. Custom keyframes add <1KB to stylesheet. |
| II. Offline-First | ✅ No network dependency. Animations are pure CSS/JS. |
| III. Simplicity | ✅ No animation library, no state machine, no virtual DOM. Minimal JS coordination with CSS doing the heavy lifting. |
| Payload <100KB | ✅ Additional CSS keyframes ~200 bytes. No JS library added. |
| DOM-based rendering | ✅ Incremental DOM patching is still DOM-based, not canvas/WebGL. |
| `deno test` | ✅ Animation coordination is testable via unit tests on the timing/flag logic. Visual animations are CSS-only and tested manually. |
