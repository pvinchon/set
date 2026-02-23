# Tasks: Title Screen with Difficulty Selection

**Input**: Design documents from `/specs/005-title-screen-difficulty/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New difficulty domain module — foundational types that all user stories depend on

- [x] T001 Create `DifficultyLevel` enum and `DifficultyConfig` type with `getDifficultyConfig()` in src/game/difficulty/model.ts
- [x] T002 Create barrel re-exports in src/game/difficulty/mod.ts
- [x] T003 Create tests for difficulty config mapping in src/game/difficulty/model_test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend core state infrastructure to support difficulty — MUST complete before user story work

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Add `difficulty` field to `GameState` in src/game/state/model.ts
- [x] T005 Parameterize `generateInitialState()` to accept optional `boardSize` in src/game/state/generator.ts
- [x] T006 Add tests for 9-card and 12-card board generation in src/game/state/generator_test.ts

**Checkpoint**: Difficulty module and state infrastructure ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Choose Difficulty and Start Game (Priority: P1) 🎯 MVP

**Goal**: Player opens the game, sees a title screen with Easy/Normal/Hard buttons, selects one, and the game starts with the matching configuration.

**Independent Test**: Open the game → title screen appears with 3 buttons → select each one → game starts with correct settings (board size and attribute count).

### Implementation for User Story 1

- [x] T007 [P] [US1] Add `#title-screen` container with game name and 3 difficulty buttons (`data-difficulty` attributes) in src/index.vto
- [x] T008 [P] [US1] Add `#game-screen` wrapper around existing game board (hidden by default) in src/index.vto
- [x] T009 [US1] Implement `initTitleScreen()` in src/game/main.ts — attach click handlers on difficulty buttons, read `data-difficulty`, hide title, show game screen, call `initGame()` with selected `DifficultyLevel`
- [x] T010 [US1] Update `initGame()` in src/game/main.ts to accept `DifficultyLevel`, call `getDifficultyConfig()`, pass `deckOptions` to `createDeck()` and `boardSize` to `generateInitialState()`
- [x] T011 [US1] Set grid layout class dynamically on `#game-board` based on board size (9→`grid-cols-3`, 12→`grid-cols-3 sm:grid-cols-4`) in src/game/main.ts

**Checkpoint**: Title screen fully functional — player can choose difficulty and start a game. This is the MVP.

---

## Phase 4: User Story 2 — Difficulty Affects Gameplay (Priority: P1)

**Goal**: Each difficulty produces a meaningfully different game — Easy uses 9 cards with 3 attributes (num fixed), Normal uses 12 cards with 3 attributes (num fixed), Hard uses 12 cards with all 4 attributes.

**Independent Test**: Start a game on each difficulty → verify card count (9 or 12), verify cards on Easy/Normal all show 1 shape (num fixed to `Num.A`), verify Hard cards vary across all 4 attributes. Find a set → verify board refills to correct size.

### Implementation for User Story 2

- [x] T012 [US2] Verify replacement logic maintains correct board size (9 or 12) after set removal — add integration verification in src/game/main.ts
- [x] T013 [US2] Verify `#game-board` grid class is re-applied correctly after card replacements in src/game/main.ts

**Checkpoint**: All three difficulties produce distinct, correct gameplay. Board size and attribute count match spec for every difficulty level.

---

## Phase 5: User Story 3 — Return to Title Screen (Priority: P2)

**Goal**: Player can return to the title screen during gameplay to pick a different difficulty or start fresh.

**Independent Test**: Start a game → click "back" button → title screen reappears → select a different difficulty → new game starts with no leftover state.

### Implementation for User Story 3

- [x] T014 [P] [US3] Add `#back-to-title` button (labeled "← Set") above the game board in src/index.vto
- [x] T015 [US3] Implement `backToTitle()` in src/game/main.ts — hide game screen, show title screen, discard `GameState`
- [x] T016 [US3] Wire click handler on `#back-to-title` to call `backToTitle()` in src/game/main.ts

**Checkpoint**: Full round-trip works — title → game → title → game (different difficulty). No state leaks.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Visual transitions and final validation

- [x] T017 [P] Add fade/transition CSS for screen switching (title ↔ game) in src/style.css
- [x] T018 [P] Style title screen buttons for mobile and desktop (tap targets, spacing, contrast) in src/style.css
- [x] T019 Run `deno task build` and verify payload stays under 100 KB compressed
- [x] T020 Run quickstart.md validation — test all three difficulties end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (difficulty types must exist)
- **User Story 1 (Phase 3)**: Depends on Phase 2 (state infrastructure must support difficulty)
- **User Story 2 (Phase 4)**: Depends on Phase 3 (game must be startable with difficulty selection)
- **User Story 3 (Phase 5)**: Depends on Phase 3 (game must be startable before "back" makes sense)
- **Polish (Phase 6)**: Can overlap with Phase 3–5 for CSS tasks; validation tasks depend on all stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 — needs difficulty selection to be functional to verify gameplay differences
- **User Story 3 (P2)**: Depends on US1 — needs game screen to exist for "back" navigation to work

### Within Each Phase

- Models before services
- Infrastructure before UI
- Core implementation before integration
- T007 and T008 can run in parallel (both modify index.vto but different sections)
- T017 and T018 can run in parallel (both add CSS but different rules)

### Parallel Opportunities

- T001, T002 are sequential (T002 re-exports T001)
- T007 + T008 can run in parallel within US1 (different HTML sections)
- T014 can run in parallel with US2 tasks (different file section)
- T017 + T018 can run in parallel (independent CSS rules)

---

## Parallel Example: User Story 1

```bash
# Step 1: HTML structure (parallel)
Task T007: "Add #title-screen container in src/index.vto"
Task T008: "Add #game-screen wrapper in src/index.vto"

# Step 2: Main logic (sequential, depends on HTML)
Task T009: "Implement initTitleScreen() in src/game/main.ts"
Task T010: "Update initGame() in src/game/main.ts"
Task T011: "Set grid layout class dynamically in src/game/main.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003) — difficulty types
2. Complete Phase 2: Foundational (T004–T006) — state infrastructure
3. Complete Phase 3: User Story 1 (T007–T011) — title screen + game start
4. **STOP and VALIDATE**: Title screen works, game starts with correct difficulty
5. This is a shippable MVP

### Incremental Delivery

1. Setup + Foundational → Difficulty types and state infrastructure ready
2. Add User Story 1 → Test → **MVP — title screen with difficulty selection**
3. Add User Story 2 → Test → Gameplay correctness verified across difficulties
4. Add User Story 3 → Test → Full navigation loop (title ↔ game)
5. Polish → CSS transitions, mobile styling, payload check

### Suggested MVP Scope

**User Story 1 alone** (Phases 1–3, tasks T001–T011) delivers the core value: a title screen where the player chooses difficulty and the game starts with correct parameters. This is sufficient for a first deployable increment.
