# Tasks: Set Card Game (Single Player)

**Input**: Design documents from `/specs/003-set-card-game/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Configure build pipeline and project scaffolding for game module

- [x] T001 Configure esbuild plugin and register game entry point (`site.add("game/main.ts"); site.use(esbuild())`) in \_config.ts
- [x] T002 [P] Add `<script type="module" src="/game/main.js"></script>` to src/\_includes/layout.vto

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and pure-logic modules that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Implement Card interface, FeatureValue type (`0 | 1 | 2`), and cardsEqual function in src/game/card.ts
- [x] T004 [P] Implement generateAllCards (81 cards), randomCard, and randomCardsExcluding in src/game/card_gen.ts
- [x] T005 [P] Implement isValidSet (`(a[i]+b[i]+c[i])%3===0` for all 4 features), computeThirdCard (`(3-a[i]-b[i])%3`), and findValidSet (scan all triples) in src/game/set.ts
- [x] T006 [P] Write card type, equality, and generation tests (81 unique cards, no duplicates, exclusion works) in tests/card_test.ts
- [x] T007 [P] Write set validation tests (valid sets, invalid sets, third-card computation, findValidSet returns correct triple) in tests/set_test.ts

**Checkpoint**: Card types and set-validation logic ready — all tests pass with `deno task test`

---

## Phase 3: User Story 1 — Find Sets on the Board (Priority: P1) 🎯 MVP

**Goal**: Player sees 12 cards, selects 3, gets immediate feedback, valid sets are replaced

**Independent Test**: Deal 12 cards, select 3 that form a valid set → cards replaced; select 3 invalid → error feedback, cards deselected

- [x] T008 [P] [US1] Implement generateBoard (12 random distinct cards, retry if no valid set ~3.2% chance) and replaceCards (random-first + deterministic fallback using computeThirdCard to guarantee board invariant) in src/game/board.ts
- [x] T009 [P] [US1] Implement selection state machine (createSelection, toggleCard, isComplete, selectedIndices, clearSelection) in src/game/selection.ts
- [x] T010 [P] [US1] Implement renderCard: SVG shapes (diamond path `M20 4 L38 40 L20 76 L2 40Z`, oval `<rect rx="16">`, squiggle cubic bezier), shadings (solid fill, open stroke-only, striped `url(#stripe)`), 1/2/3 shape layout, and 3 colours (#dc2626 red, #16a34a green, #7c3aed purple) in src/game/render_card.ts
- [x] T011 [US1] Implement renderBoard (create card grid, place 12 cards) and updateSelection (toggle selected class on card elements) in src/game/render_board.ts
- [x] T012 [P] [US1] Implement showFeedback for valid (brief green flash) and invalid (brief red shake) set selections in src/game/feedback.ts
- [x] T013 [P] [US1] Replace Hello World content with game board HTML: SVG `<defs>` block for stripe pattern, card grid container `<div>`, in src/index.vto
- [x] T014 [P] [US1] Add card grid layout (`grid grid-cols-3 sm:grid-cols-4 gap-3`), card appearance styles (border, rounded, padding, selected state, hover), and feedback animation keyframes to src/style.css
- [x] T015 [US1] Wire entry point: initialise board via generateBoard, render board, attach click handlers to cards, manage selection state, validate on 3-card selection, call replaceCards + re-render on valid set, show feedback on invalid in src/game/main.ts

**Checkpoint**: Game is playable — player can find sets, see feedback, and cards are replaced. Board always has a valid set.

---

## Phase 4: User Story 2 — A Valid Set Is Always Present (Priority: P1)

**Goal**: Prove the board invariant holds: every board (initial and after replacement) contains at least one valid set

**Independent Test**: Run automated tests that generate boards and perform replacements, asserting findValidSet never returns null

- [x] T016 [US2] Write board invariant tests: initial generateBoard always has valid set (10 runs), replaceCards preserves invariant (10 runs × 10 replacements each), deterministic fallback engages correctly when random replacement yields set-free board in tests/board_test.ts

**Checkpoint**: Board invariant is proven by automated tests

---

## Phase 5: User Story 3 — Continuous Play (Priority: P1)

**Goal**: Game never ends — player keeps finding sets indefinitely with no deck depletion or game-over

**Independent Test**: Perform 50+ consecutive set-find-and-replace cycles; game never terminates

- [x] T017 [US3] Verify continuous play model: assert card_gen.ts draws from full 81-card universe (not a finite deck), board.ts replaceCards has no depletion guard, main.ts has no game-over condition; add endurance test (50 consecutive replacements all succeed) in tests/board_test.ts

**Checkpoint**: Confirmed no termination — game plays indefinitely

---

## Phase 6: User Story 4 — Start a New Game (Priority: P2)

**Goal**: Player can reset to a fresh board by refreshing the page (no button needed — state is in-memory only)

**Independent Test**: Mid-game, refresh the page and verify a fresh 12-card board is dealt

- [x] T018 [US4] Verify new-game-via-refresh: confirm main.ts calls generateBoard on page load (no saved state to restore), so every refresh produces a fresh board with valid-set guarantee

**Checkpoint**: Page refresh always starts a new game — no additional UI needed

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Build validation, final verification

- [x] T019 [P] Update existing build output tests to verify game page content: card grid container present, game JS script tag present, Hello World text removed in tests/build_test.ts
- [x] T020 Run quickstart.md end-to-end validation: `deno task build`, `deno task test`, `deno task serve`, verify game plays correctly in browser, verify offline play works

**Checkpoint**: All tests pass, build output is correct, offline play verified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — delivers playable MVP
- **US2 (Phase 4)**: Depends on Phase 3 (board.ts must exist) — proves invariant
- **US3 (Phase 5)**: Depends on Phase 3 — verifies continuous play
- **US4 (Phase 6)**: Depends on Phase 3 — verifies refresh-based reset
- **Polish (Phase 7)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Requires Foundational only — can start as soon as Phase 2 is complete
- **US2 (P1)**: Requires US1 (tests exercise board.ts implemented in US1)
- **US3 (P1)**: Requires US1 (verifies the continuous-play design from US1)
- **US4 (P2)**: Requires US1 (needs working game to verify refresh reset)
- **US2, US3, US4**: Can proceed in parallel after US1 is complete

### Within Each Phase

- Tasks without [P] must run sequentially in listed order
- Tasks with [P] can run in parallel with other [P] tasks in the same phase
- Models/types before services/logic, logic before rendering, rendering before wiring

### Parallel Opportunities

**Phase 2** (after T003):

```
T004 [P] card_gen.ts  ─┐
T005 [P] set.ts        ├─ parallel
T006 [P] card_test.ts  │
T007 [P] set_test.ts   ─┘
```

**Phase 3** (all [P] tasks together, then sequential):

```
T008 [P] board.ts        ─┐
T009 [P] selection.ts     │
T010 [P] render_card.ts   ├─ parallel
T012 [P] feedback.ts      │
T013 [P] index.vto        │
T014 [P] style.css        ─┘
        ↓
T011    render_board.ts   (after T010)
        ↓
T015    main.ts           (after all above)
```

**After US1** (Phases 4, 5, 6 in parallel):

```
T016 [US2] board tests    ─┐
T017 [US3] endurance      ├─ parallel
T018 [US4] refresh verify ─┘
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (2 tasks)
2. Complete Phase 2: Foundational (5 tasks)
3. Complete Phase 3: User Story 1 (8 tasks)
4. **STOP and VALIDATE**: Play the game locally with `deno task serve`
5. Run `deno task test` — all tests pass
6. Verify refresh starts a new game

### Incremental Delivery

1. Setup + Foundational → Build pipeline ready, core types tested
2. US1 → Playable game (MVP!) — validate with `deno task serve`
3. US2 → Invariant proven by tests — validate with `deno task test`
4. US3 → Continuous play verified — validate with endurance test
5. US4 → Refresh resets game — validate by refreshing mid-game
6. Polish → Build tests, final quickstart validation

---

## Notes

- All game logic files are ~30-80 lines each (small, domain-focused)
- Pure logic files (card.ts, card_gen.ts, set.ts, board.ts, selection.ts) have zero DOM dependency
- Rendering files (render_card.ts, render_board.ts, feedback.ts) own all DOM interaction
- No external dependencies added — game uses only TypeScript + Tailwind + inline SVG
- Commit after each task or logical group
