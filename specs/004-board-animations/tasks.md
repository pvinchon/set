# Tasks: Board Animations

**Input**: Design documents from `/specs/004-board-animations/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define CSS animation keyframes and Tailwind utility classes used by all stories

- [x] T001 Add `@keyframes deal-in` (opacity 0→1, translateY 20px→0) in `src/style.css`
- [x] T002 Add `@keyframes card-exit` (opacity 1→0, scale 1→0.8) in `src/style.css`
- [x] T003 Add `@keyframes card-enter` (opacity 0→1, scale 0.8→1) in `src/style.css`
- [x] T004 Add `@keyframes set-pulse` (scale 1→1.05→1) in `src/style.css`
- [x] T005 Update existing `@keyframes shake` duration from 0.3s to 0.5s in `src/style.css`
- [x] T006 Add `@utility animate-deal-in` (deal-in 300ms ease-out forwards) in `src/style.css`
- [x] T007 Add `@utility animate-card-exit` (card-exit 300ms ease-in forwards) in `src/style.css`
- [x] T008 Add `@utility animate-card-enter` (card-enter 300ms ease-out forwards) in `src/style.css`
- [x] T009 Add `@utility animate-set-pulse` (set-pulse 500ms ease-in-out) in `src/style.css`

**Note**: T001–T009 all modify the same file (`src/style.css`) so they should be done sequentially in a single pass, but are listed individually for traceability.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Refactor the renderer from full DOM wipe to incremental DOM patching — required before ANY animation story can work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. The current `innerHTML = ""` approach destroys DOM elements, killing any in-progress CSS animation.

- [x] T010 Refactor `renderGame()` in `src/game/state/renderer.ts` to use incremental DOM patching instead of `innerHTML = ""` — reuse existing card elements by matching on `data-index`, only update classes and SVG content when the underlying card data changes
- [x] T011 Add `options` parameter to `renderGame()` in `src/game/state/renderer.ts` supporting `{ animationClass?: string; affectedIndices?: number[]; initialDeal?: boolean }` per contracts/README.md
- [x] T012 Add `AnimationPhase` type (`"idle" | "dealing" | "feedback" | "exiting" | "entering"`) and `AnimationState` interface to `src/game/main.ts` per data-model.md
- [x] T013 Add `isAnimating` guard to `handleCardClick()` in `src/game/main.ts` — return early (silently drop click) when `animationState.phase !== "idle"`
- [x] T014 Verify existing tests still pass after renderer refactor by running `deno task test`

**Checkpoint**: Renderer now patches DOM in-place. Game is fully functional with no animations yet. All existing tests pass.

---

## Phase 3: User Story 1 — Initial Board Deal Animation (Priority: P1) 🎯 MVP

**Goal**: Cards appear with staggered fade-in/slide-up animation when the game starts

**Independent Test**: Refresh the page — cards should appear one by one over 1.2s, not all at once

- [x] T015 [US1] Update `renderGame()` in `src/game/state/renderer.ts` to apply `animate-deal-in` class and `animation-delay: ${index * 100}ms` inline style to each card element when `options.initialDeal` is true; cards should start with `opacity: 0`
- [x] T016 [US1] Update `initGame()` in `src/game/main.ts` to call `renderGame()` with `{ initialDeal: true }` on first render, set `animationState.phase = "dealing"`, and schedule transition to `"idle"` after 1500ms (1.2s stagger + 300ms final card animation)
- [ ] T017 [US1] Manually verify deal animation: refresh page, confirm 12 cards appear staggered over ~1.2s, then board is interactive

**Checkpoint**: Initial deal animation works. Board becomes interactive after all cards have appeared.

---

## Phase 4: User Story 2 — Card Hover & Active State Animation (Priority: P1)

**Goal**: Cards lift on hover and press down on active/tap for tactile feedback

**Independent Test**: Hover a card (lifts with shadow). Press and hold (scales down). Release (returns to normal).

- [x] T018 [P] [US2] Update `CARD_BASE_CLASSES` in `src/game/card/renderer.ts`: change `hover:-translate-y-0.5` to `hover:-translate-y-1`, change `hover:shadow-lg` to `hover:shadow-xl`, add `hover:scale-[1.02]`, add `active:scale-[0.97]`, add `active:shadow-sm`, change `duration-150` to `duration-300`
- [ ] T019 [US2] Manually verify hover/active states: hover card (lifts + shadow + slight scale up), press card (scales down + shadow reduces), release (smooth transition back)

**Checkpoint**: Hover and active states provide tactile feedback. No visual conflicts with selected cards.

---

## Phase 5: User Story 3 — Card Selection Animation (Priority: P1)

**Goal**: Smooth transition between selected and unselected visual states on click

**Independent Test**: Click a card — border/ring transitions smoothly to blue. Click again — transitions back.

- [x] T020 [US3] Verify that the incremental DOM patching from T010 correctly toggles `SELECTED_CLASSES` in-place on existing card elements in `src/game/state/renderer.ts` without destroying/recreating the element, so the `transition-all duration-300` on the card enables smooth CSS transitions between selected and unselected states
- [ ] T021 [US3] Manually verify selection animation: click card (smooth border-blue + ring transition), click again (smooth transition back), click 3 different cards in sequence (each animates independently)

**Checkpoint**: Card selection/deselection transitions are smooth 300ms animations with no flicker.

---

## Phase 6: User Story 4 — Valid Set Celebration Animation (Priority: P2)

**Goal**: Green pulse feedback on three matched cards before replacement

**Independent Test**: Select a valid Set — three cards pulse with green accent for 500ms

- [x] T022 [US4] Update `handleCardClick()` in `src/game/main.ts` for `valid_set` result: store `result.state` in `animationState.pendingState`, set `phase = "feedback"` and `feedbackType = "valid"`, apply `animate-set-pulse` class and green border/ring classes (`border-green-600 ring-3 ring-green-600/40`) directly to the three selected card elements in the DOM, schedule transition to `"exiting"` phase after 500ms
- [x] T023 [US4] Update `SELECTED_CLASSES` in `src/game/card/renderer.ts` to remove the `group-data-[feedback=valid]` conditional classes (feedback is now applied directly by the animation coordinator, not via container data attributes)
- [ ] T024 [US4] Manually verify valid set feedback: select 3 cards forming a valid Set, confirm green pulse animation plays for ~500ms on the three cards

**Checkpoint**: Valid set shows green pulse feedback. Cards are not yet replaced (that's US6).

---

## Phase 7: User Story 5 — Invalid Set Rejection Animation (Priority: P2)

**Goal**: Red shake feedback on three unmatched cards before clearing selection

**Independent Test**: Select an invalid Set — three cards shake with red accent for 500ms, then deselect

- [x] T025 [US5] Update `handleCardClick()` in `src/game/main.ts` for `invalid_set` result: set `phase = "feedback"` and `feedbackType = "invalid"`, apply `animate-shake` class and red border/ring classes (`border-red-600 ring-3 ring-red-600/40`) directly to the three selected card elements, schedule transition to `"idle"` after 500ms — on transition, remove feedback classes, update state to cleared selection, and re-render via `renderGame()`
- [x] T026 [US5] Update `SELECTED_CLASSES` in `src/game/card/renderer.ts` to remove the `group-data-[feedback=invalid]` conditional classes and `group-data-[feedback=invalid]:animate-shake` (feedback is now applied directly by the animation coordinator)
- [x] T027 [US5] Remove the `container.dataset.feedback` logic (both `valid` and `invalid` branches) from `handleCardClick()` in `src/game/main.ts` — feedback is now handled by direct class manipulation, not container data attributes
- [ ] T028 [US5] Manually verify invalid set feedback: select 3 cards not forming a valid Set, confirm red shake animation plays for ~500ms, then cards smoothly return to unselected state

**Checkpoint**: Invalid set shows red shake feedback, then cleanly clears selection.

---

## Phase 8: User Story 6 — Card Replacement Animation (Priority: P2)

**Goal**: Matched cards exit with shrink/fade, new cards enter with grow/fade after valid set

**Independent Test**: After valid set feedback, matched cards shrink out, new cards grow in over ~600ms total

- [x] T029 [US6] Implement exit phase in `src/game/main.ts`: when transitioning from `"feedback"` to `"exiting"` for valid sets, apply `animate-card-exit` class to the three matched card elements, schedule transition to `"entering"` after 300ms
- [x] T030 [US6] Implement enter phase in `src/game/main.ts`: when transitioning from `"exiting"` to `"entering"`, apply `animationState.pendingState` as the new game state, call `renderGame()` with `{ animationClass: "animate-card-enter", affectedIndices: animationState.affectedIndices }` to patch only the three replaced card positions with new card data and entrance animation class, schedule transition to `"idle"` after 300ms
- [x] T031 [US6] Update `renderGame()` in `src/game/state/renderer.ts` to apply `options.animationClass` only to card elements at positions listed in `options.affectedIndices` during patching — other card elements must not be touched or re-animated
- [ ] T032 [US6] Manually verify full valid set sequence: select valid Set → green pulse (500ms) → cards shrink out (300ms) → new cards grow in (300ms) → board is interactive. Confirm non-replaced cards remain stable throughout.

**Checkpoint**: Full valid set animation sequence works end-to-end (1.1s total). Board stability maintained.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across all stories

- [x] T033 Remove the `group` class from `#game-board` container in `src/index.vto` if no other `group-data-*` variants remain in use (since feedback is now direct class manipulation)
- [x] T034 Run `deno task test` to confirm all existing unit tests pass after all changes
- [x] T035 Run `deno task build` and verify build succeeds with no errors
- [ ] T036 Run full manual quickstart validation per `specs/004-board-animations/quickstart.md`: verify all 8 items in the Manual Verification Checklist
- [x] T037 Verify input locking: during deal animation, valid set sequence, and invalid set sequence, rapidly click cards and confirm all clicks are silently dropped

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — defines CSS keyframes and utilities
- **Foundational (Phase 2)**: Depends on Phase 1 — refactors renderer, adds animation state
- **US1 (Phase 3)**: Depends on Phase 2 — uses `initialDeal` option and `"dealing"` phase
- **US2 (Phase 4)**: Depends on Phase 2 — uses incremental patching for transition persistence. Can run in parallel with US1/US3.
- **US3 (Phase 5)**: Depends on Phase 2 — uses incremental patching. Can run in parallel with US1/US2.
- **US4 (Phase 6)**: Depends on Phase 2 — uses `"feedback"` phase with `"valid"` type
- **US5 (Phase 7)**: Depends on Phase 2 — uses `"feedback"` phase with `"invalid"` type. Can run in parallel with US4.
- **US6 (Phase 8)**: Depends on US4 (Phase 6) — extends valid set flow with exit/enter phases
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Deal)**: Independent after Phase 2
- **US2 (Hover/Active)**: Independent after Phase 2
- **US3 (Selection)**: Independent after Phase 2
- **US4 (Valid Feedback)**: Independent after Phase 2
- **US5 (Invalid Feedback)**: Independent after Phase 2
- **US6 (Replacement)**: Depends on US4 (valid feedback must exist before exit/enter phases extend it)

### Parallel Opportunities

After Phase 2 (Foundational) is complete:

- **US1, US2, US3** can all run in parallel (different concerns: deal timing, CSS hover/active, selection transition)
- **US4 and US5** can run in parallel (different feedback types, same mechanism)
- **US6** must follow US4

---

## Parallel Example: After Phase 2

```
# These three can run simultaneously (different files/concerns):
Task T015-T017: US1 — Deal animation (main.ts + renderer.ts timing)
Task T018-T019: US2 — Hover/active (card/renderer.ts CSS classes only)
Task T020-T021: US3 — Selection (verify renderer patching)

# Then these two can run simultaneously:
Task T022-T024: US4 — Valid set feedback (main.ts coordinator)
Task T025-T028: US5 — Invalid set feedback (main.ts coordinator)

# Then:
Task T029-T032: US6 — Card replacement (extends US4)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 + 3)

1. Complete Phase 1: CSS keyframes and utilities (all in `src/style.css`)
2. Complete Phase 2: Incremental renderer + animation state (CRITICAL)
3. Complete Phase 3: Deal animation (US1 — first visual impression)
4. Complete Phase 4: Hover/active (US2 — tactile feedback)
5. Complete Phase 5: Selection transitions (US3 — core gameplay feel)
6. **STOP and VALIDATE**: Board loads with deal animation, cards feel responsive on hover/click/select

### Incremental Delivery

7. Add US4: Valid set celebration → green pulse feedback
8. Add US5: Invalid set rejection → red shake feedback
9. Add US6: Card replacement → exit/enter animation sequence
10. Complete Polish phase → full manual verification

### Key Risk

The **Foundational phase (Phase 2)** is the highest-risk work — it refactors the rendering pipeline from `innerHTML` wipe to incremental DOM patching. This is a structural change. All subsequent phases depend on it working correctly. Validate thoroughly at the Phase 2 checkpoint before proceeding.

---

## Notes

- No test tasks are generated — tests were not requested in the spec. Visual animations are verified manually.
- All CSS keyframes and utilities use GPU-accelerated properties only (transform, opacity) per constitution performance requirements.
- The `group-data-*` pattern for feedback is replaced by direct class manipulation — simpler and works with the incremental renderer.
- Total additional CSS: ~500 bytes (5 keyframes + 4 new utilities + 1 updated utility).
