# Tasks: Configuration Screen

**Input**: Design documents from `/specs/006-config-screen/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: Create the new module directories and scaffolding

- [x] T001 Create config domain module directory structure at `src/game/config/` and config screen directory at `src/screens/config/`
- [x] T002 Create barrel export file `src/game/config/mod.ts` with placeholder exports

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Config model, palettes, defaults, persistence, and ActiveConfig singleton — required before any user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Define `PlayerPreferences`, `ColorOption`, `ShapeOption`, `PatternOption`, and `ActiveConfig` types in `src/game/config/model.ts`
- [x] T004 Define `COLOR_PALETTE` (8 colors), `SHAPE_PALETTE` (6 shapes), `PATTERN_PALETTE` (6 patterns) constant arrays in `src/game/config/model.ts`
- [x] T005 Define `DEFAULT_PREFERENCES` constant and `buildActiveConfig()` function in `src/game/config/model.ts`
- [x] T006 Add validation function `isValidPreferences()` in `src/game/config/model.ts` (exactly 3 distinct valid IDs per category)
- [x] T007 [P] Write tests for defaults, palette lookups, `buildActiveConfig()`, and `isValidPreferences()` in `src/game/config/model_test.ts`
- [x] T008 [P] Implement `loadPreferences()`, `savePreferences()`, `clearPreferences()` in `src/game/config/persistence.ts`
- [x] T009 [P] Write tests for persistence with localStorage mock (load/save/clear/fallback) in `src/game/config/persistence_test.ts`
- [x] T010 Implement `getActiveConfig()` and `setActiveConfig()` singleton accessors in `src/game/config/mod.ts`, re-export all public API
- [x] T011 Add new SVG path functions for diamond, star, and hexagon to `SHAPE_PALETTE` definitions in `src/game/config/model.ts`
- [x] T012 Add new pattern apply functions for dotted, crosshatch, and gradient to `PATTERN_PALETTE` definitions in `src/game/config/model.ts`

**Checkpoint**: Config domain module ready — all types, palettes, persistence, singleton usable

---

## Phase 3: User Story 1 — Customize Card Colors (Priority: P1) 🎯 MVP

**Goal**: Player can select 3 colors from a palette of 8 on the config screen; cards render with chosen colors

**Independent Test**: Open config screen → change colors → save → start game → verify cards use new colors

### Implementation for User Story 1

- [x] T013 [US1] Refactor `renderColor()` in `src/game/attributes/color.ts` to read hex from `getActiveConfig().colorHexMap` instead of hardcoded `COLOR_HEX`
- [x] T014 [US1] Add "Settings" button to title screen in `src/screens/title/component.ts` that calls `router.navigateTo("config")`
- [x] T015 [US1] Create `createConfigScreen()` factory in `src/screens/config/component.ts` — scaffold with back button, save button, and color palette section only
- [x] T016 [US1] Implement color palette selector UI in `src/screens/config/component.ts` — togglable buttons with `aria-pressed`, selected ring, max 3 enforcement
- [x] T017 [US1] Implement live preview area in `src/screens/config/component.ts` — render 3 sample cards reflecting current color selections
- [x] T018 [US1] Wire config screen into router and load preferences on app startup in `src/game/main.ts`
- [x] T019 [US1] Add selected-state styles for palette buttons (ring, scale) in `src/style.css`

**Checkpoint**: Color customization fully functional — player can choose 3 colors, preview, save, and play with them

---

## Phase 4: User Story 4 — Preferences Persist Across Sessions (Priority: P1)

**Goal**: Saved color/shape/pattern preferences survive browser close and are restored on next visit

**Independent Test**: Save preferences → close browser → reopen → verify config screen and game reflect saved selections

### Implementation for User Story 4

- [x] T020 [US4] Load preferences from localStorage on app startup and apply via `setActiveConfig(buildActiveConfig(prefs))` in `src/game/main.ts`
- [x] T021 [US4] Wire save action in `src/screens/config/component.ts` to call `savePreferences()` and `setActiveConfig()` then navigate to title
- [x] T022 [US4] Wire back/cancel action in `src/screens/config/component.ts` to discard unsaved changes and navigate to title
- [x] T023 [US4] Populate config screen selections from current `ActiveConfig` on screen create in `src/screens/config/component.ts`
- [x] T024 [US4] Handle corrupted/invalid localStorage data gracefully — fall back to defaults without errors in `src/game/main.ts`

**Checkpoint**: Preferences persist — save, close, reopen, verify restored

---

## Phase 5: User Story 2 — Customize Card Shapes (Priority: P2)

**Goal**: Player can select 3 shapes from a palette of 6 on the config screen; cards render with chosen shapes

**Independent Test**: Open config screen → change shapes → save → start game → verify cards use new shapes

### Implementation for User Story 2

- [x] T025 [US2] Refactor `shapePath()` in `src/game/attributes/shape.ts` to call `getActiveConfig().shapePathMap[shape](w, h)` instead of switch statement
- [x] T026 [US2] Add shape palette selector section to `src/screens/config/component.ts` — togglable shape preview buttons, max 3 enforcement
- [x] T027 [US2] Update live preview in `src/screens/config/component.ts` to reflect current shape selections on sample cards
- [x] T028 [US2] Add save validation — disable save button when any category has fewer than 3 selections in `src/screens/config/component.ts`

**Checkpoint**: Shape customization fully functional alongside colors

---

## Phase 6: User Story 3 — Customize Card Patterns (Priority: P3)

**Goal**: Player can select 3 patterns from a palette of 6 on the config screen; cards render with chosen patterns

**Independent Test**: Open config screen → change patterns → save → start game → verify cards use new patterns

### Implementation for User Story 3

- [x] T029 [US3] Refactor `renderShading()` in `src/game/attributes/shading.ts` to call `getActiveConfig().shadingApplyMap[shading](svg)` instead of switch statement
- [x] T030 [US3] Add pattern palette selector section to `src/screens/config/component.ts` — togglable pattern preview buttons, max 3 enforcement
- [x] T031 [US3] Update live preview in `src/screens/config/component.ts` to reflect current pattern selections on sample cards

**Checkpoint**: Full visual customization — colors, shapes, and patterns all configurable

---

## Phase 7: User Story 5 — Reset to Defaults (Priority: P2)

**Goal**: Player can revert all customizations to original defaults with one action

**Independent Test**: Customize preferences → press Reset to Defaults → verify selections revert → save → verify game uses defaults

### Implementation for User Story 5

- [x] T032 [US5] Implement "Reset to Defaults" button in `src/screens/config/component.ts` that reverts all palette selections to `DEFAULT_PREFERENCES`
- [x] T033 [US5] Update live preview immediately after reset in `src/screens/config/component.ts`

**Checkpoint**: Reset to defaults works — all selections revert, preview updates, save persists defaults

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, accessibility, and cleanup

- [x] T034 [P] Verify WCAG 2.1 AA compliance — keyboard navigation on config screen, aria-pressed states, contrast ratios in `src/screens/config/component.ts`
- [x] T035 [P] Run `deno task test` to verify all existing tests still pass
- [x] T036 [P] Run `deno task build` to verify production build succeeds and payload stays under 100 KB
- [x] T037 Run quickstart.md validation — dev server starts, config screen accessible, end-to-end flow works

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **US1 Colors (Phase 3)**: Depends on Phase 2
- **US4 Persistence (Phase 4)**: Depends on Phase 3 (needs config screen to exist)
- **US2 Shapes (Phase 5)**: Depends on Phase 2; can run in parallel with Phase 3 attribute refactor, but config screen UI depends on Phase 3's scaffold
- **US3 Patterns (Phase 6)**: Depends on Phase 2; config screen UI depends on Phase 5's scaffold
- **US5 Reset (Phase 7)**: Depends on Phases 3–6 (needs all palette sections to exist)
- **Polish (Phase 8)**: Depends on all user stories being complete

### Within Each User Story

- Attribute refactor before config screen UI
- Config screen scaffold before palette sections
- Palette section before live preview integration
- Core implementation before save/validation

### Parallel Opportunities

Within Phase 2 (Foundational):

```
Parallel batch 1: T007 (model tests) + T008 (persistence impl) + T009 (persistence tests)
Sequential after: T010 (barrel), T011 (shape paths), T012 (pattern functions)
```

Within Phase 3 (US1 Colors):

```
T013 (color refactor) → T014 (settings button) can run in parallel
Then: T015 (screen scaffold) → T16 (color palette UI) → T17 (preview) → T18 (wiring) → T19 (styles)
```

---

## Implementation Strategy

### MVP First (User Story 1 + 4 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 — Color customization
4. Complete Phase 4: US4 — Persistence
5. **STOP and VALIDATE**: Player can customize colors, save, and they persist
6. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 Colors + US4 Persistence → MVP! Colors customizable and saved
3. US2 Shapes → Full shape customization added
4. US3 Patterns → Full visual customization
5. US5 Reset → Safety net for reverting
6. Polish → Accessibility, build, final validation

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [USn] label maps task to specific user story
- Each user story should be independently testable after completion
- Commit after each task or logical group
- Game logic modules (`set/`, `deck/`, `state/`, `selection/`, `board/`) are **not modified** — only rendering pipeline changes
- The rendering refactor (T013, T025, T029) must preserve existing default behavior when `ActiveConfig` uses `DEFAULT_PREFERENCES`
