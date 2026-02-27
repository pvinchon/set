# Tasks: Migrate to Dynamic Framework (PWA-Compatible)

**Input**: Design documents from `/specs/007-migrate-dynamic-framework/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/README.md, quickstart.md

**Tests**: Not explicitly requested in spec. Only test _migration_ tasks (converting Deno.test → Vitest harness) are included as they are part of the migration itself, not new test authoring.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold SvelteKit project, remove Lume/Deno files, move game logic into place

- [x] T001 Run `npx sv create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:none" sveltekit-adapter="adapter:static" --install npm` to scaffold SvelteKit project into a temporary directory
- [x] T002 Copy scaffold output into repository root, merging with existing files (keep `.git/`, `specs/`, `.specify/`, `.github/`); update `package.json` name to `"set"`
- [x] T003 Run `npm install` to verify scaffold dependencies install successfully
- [x] T004 Delete scaffold demo files: `src/demo.spec.ts`, `src/routes/page.svelte.spec.ts`
- [x] T005 Delete Lume/Deno config files: `_config.ts`, `deno.json`
- [x] T006 Delete Lume-specific source files: `src/index.vto`, `src/_includes/layout.vto`, `src/pwa/plugin.ts`, `src/pwa/src/manifest.webmanifest.vto`, `src/pwa/src/service_worker.js`
- [x] T007 Delete files replaced by Svelte components: `src/screens/router.ts`, `src/screens/title/component.ts`, `src/screens/play/component.ts`, `src/game/board/component.ts`, `src/game/card/renderer.ts`, `src/game/main.ts`
- [x] T008 Move icon assets from `src/pwa/src/icons/` to `static/icons/` (4 PNG files)
- [x] T009 Move game logic to `src/lib/game/`: move `src/game/attributes/`, `src/game/board/model.ts`, `src/game/board/replacer.ts`, `src/game/board/replacer_test.ts`, `src/game/board/animations.ts`, `src/game/board/mod.ts`, `src/game/card/model.ts`, `src/game/card/equality.ts`, `src/game/card/equality_test.ts`, `src/game/card/model_test.ts`, `src/game/card/mod.ts`, `src/game/deck/`, `src/game/difficulty/`, `src/game/selection/`, `src/game/set/`, `src/game/state/` to corresponding `src/lib/game/` paths
- [x] T010 Move utility modules from `src/utils/` to `src/lib/utils/` (cx.ts, environment.ts, grid.ts, random.ts)
- [x] T011 Delete `src/style.css` (content will be merged into scaffold's `src/routes/layout.css`)
- [x] T012 Remove empty directories: `src/pwa/`, `src/screens/`, `src/game/`, `src/utils/`, `src/_includes/`

**Checkpoint**: Repository has SvelteKit scaffold at root, game logic in `src/lib/game/`, no Lume/Deno files remain. Project should `npm run check` successfully (after svelte-kit sync).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Configure scaffold files for the Set game — these changes are required before any user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Modify `svelte.config.js` to add `fallback: '404.html'` and `paths: { base: '/set' }` per Contract 1
- [x] T014 Modify `src/app.html` to add `<meta name="theme-color" content="#111827" />`, update favicon link to `%sveltekit.assets%/icons/icon-192.png`, add apple-touch-icon link per Contract 3
- [x] T015 Merge existing TailwindCSS custom styles and `@utility` rules from `src/style.css` into `src/routes/layout.css` (keep scaffold's `@import 'tailwindcss'` at top)
- [x] T016 Update `src/lib/utils/environment.ts` to replace `Deno.env.get("ENV")` with `import.meta.env.MODE` for environment detection
- [x] T017 Update all intra-game import paths in `src/lib/game/` module files — replace any `../../utils/` or `../` paths that changed due to the move from `src/game/` to `src/lib/game/` (check all `mod.ts` barrel files and cross-module imports)
- [x] T018 [P] Migrate test file `src/lib/game/attributes/color_test.ts` → `src/lib/game/attributes/color.test.ts`: replace `Deno.test` with Vitest `test`/`describe`, replace `jsr:@std/assert` imports with `vitest` `expect` assertions
- [x] T019 [P] Migrate test file `src/lib/game/attributes/num_test.ts` → `src/lib/game/attributes/num.test.ts`
- [x] T020 [P] Migrate test file `src/lib/game/attributes/shading_test.ts` → `src/lib/game/attributes/shading.test.ts`
- [x] T021 [P] Migrate test file `src/lib/game/attributes/shape_test.ts` → `src/lib/game/attributes/shape.test.ts`
- [x] T022 [P] Migrate test file `src/lib/game/board/replacer_test.ts` → `src/lib/game/board/replacer.test.ts`
- [x] T023 [P] Migrate test file `src/lib/game/card/equality_test.ts` → `src/lib/game/card/equality.test.ts`
- [x] T024 [P] Migrate test file `src/lib/game/card/model_test.ts` → `src/lib/game/card/model.test.ts`
- [x] T025 [P] Migrate test file `src/lib/game/deck/draw_test.ts` → `src/lib/game/deck/draw.test.ts`
- [x] T026 [P] Migrate test file `src/lib/game/deck/factory_test.ts` → `src/lib/game/deck/factory.test.ts`
- [x] T027 [P] Migrate test file `src/lib/game/difficulty/model_test.ts` → `src/lib/game/difficulty/model.test.ts`
- [x] T028 [P] Migrate test file `src/lib/game/selection/actions_test.ts` → `src/lib/game/selection/actions.test.ts`
- [x] T029 [P] Migrate test file `src/lib/game/set/validator_test.ts` → `src/lib/game/set/validator.test.ts`
- [x] T030 [P] Migrate test file `src/lib/game/state/actions_test.ts` → `src/lib/game/state/actions.test.ts`
- [x] T031 [P] Migrate test file `src/lib/game/state/generator_test.ts` → `src/lib/game/state/generator.test.ts`
- [x] T032 Run `npm run test` to verify all 14 migrated game logic tests pass under Vitest

**Checkpoint**: Foundation ready — `npm run test` passes all game logic tests, `npm run check` passes type checking, scaffold is configured for the Set game. User story implementation can now begin.

---

## Phase 3: User Story 1 — Application Runs Under a Dynamic Framework (Priority: P1) 🎯 MVP

**Goal**: The game renders and functions identically under SvelteKit — title screen, difficulty selection, gameplay, animations all work as before.

**Independent Test**: Open the application in a browser (`npm run dev`), play a full game from title screen through difficulty selection to gameplay completion, and confirm all existing functionality works identically.

### Implementation for User Story 1

- [x] T033 [US1] Create Card Svelte component in `src/lib/game/card/Card.svelte` — port SVG/HTML rendering from `renderer.ts`, use Svelte 5 `$props()` for `card`, `selected`, `onSelect` per Contract 5
- [x] T034 [US1] Create Board Svelte component in `src/lib/game/board/Board.svelte` — port card grid layout from `component.ts`, use `{#each}` with `<Card>`, handle selection, implement CSS animations/transitions per Contract 6
- [x] T035 [US1] Rewrite `src/routes/+page.svelte` as title screen — port difficulty selection UI from `screens/title/component.ts`, use `goto('/play')` for navigation, call state generator on difficulty select
- [x] T036 [US1] Create play screen in `src/routes/play/+page.svelte` — port gameplay UI from `screens/play/component.ts`, use `<Board>` component, reactive `$state()` for game state, navigate to `/` on game completion
- [x] T037 [US1] Update `src/routes/+layout.svelte` to set up global layout — import `./layout.css`, render `{@render children()}`, add any global UI chrome from the current `layout.vto`
- [x] T038 [US1] Verify board animations work in Svelte — ensure CSS transitions or Svelte `transition:` directives replicate the animation behavior from `src/game/board/animations.ts`

**Checkpoint**: User Story 1 complete — the game is fully playable under SvelteKit via `npm run dev`. Title screen → difficulty → play → win all work.

---

## Phase 4: User Story 2 — PWA Functionality Is Preserved (Priority: P1)

**Goal**: The app installs as a PWA, caches assets for offline play, and updates the cache on new deployments.

**Independent Test**: Install the app as a PWA via `npm run build && npm run preview`, go offline, and confirm the game loads and plays fully from cache.

### Implementation for User Story 2

- [x] T039 [US2] Install `@vite-pwa/sveltekit` dependency: `npm install -D @vite-pwa/sveltekit`
- [x] T040 [US2] Modify `vite.config.ts` to add `SvelteKitPWA` plugin with `injectManifest` strategy, PWA manifest (name, icons, display, theme_color), `devOptions: { enabled: false }` per Contract 2
- [x] T041 [US2] Create service worker in `src/service-worker.ts` — port cache-first logic from `src/pwa/src/service_worker.js`, use `self.__WB_MANIFEST` for precache entries, implement install/activate/fetch handlers per Contract 4
- [x] T042 [US2] Run `npm run build` and verify `build/` output contains `manifest.webmanifest`, `service-worker.js`, all icon files, and HTML pages per Contract 10
- [x] T043 [US2] Run `npm run preview`, open in browser, verify Lighthouse PWA audit passes (installable, offline-capable, valid manifest)

**Checkpoint**: User Story 2 complete — the app is a valid PWA with offline support, installable from the browser.

---

## Phase 5: User Story 3 — Development Workflow Supports Hot Reload (Priority: P2)

**Goal**: Source file changes are reflected in the browser automatically during development — CSS changes apply without full reload, TypeScript changes update within seconds.

**Independent Test**: Start the dev server with `npm run dev`, edit a component file, and observe the browser reflecting the change within seconds.

### Implementation for User Story 3

- [x] T044 [US3] Verify `npm run dev` starts the Vite dev server at `http://localhost:5173` and serves the game correctly
- [x] T045 [US3] Verify hot module replacement works: edit a Svelte component, confirm browser updates without full page reload; edit `layout.css`, confirm styles update without reload

**Checkpoint**: User Story 3 complete — developers get fast feedback loops with HMR during development.

---

## Phase 6: User Story 4 — Production Build Produces Optimised Static Output (Priority: P2)

**Goal**: `npm run build` produces optimised, minified static files in `build/` deployable to GitHub Pages, with total payload under 100 KB.

**Independent Test**: Run `npm run build`, inspect `build/` directory structure, measure total size, deploy to a static host and verify the app works.

### Implementation for User Story 4

- [x] T046 [US4] Migrate `tests/build_test.ts` → `tests/build.test.ts`: convert to Vitest, update assertions to check `build/` output directory, SvelteKit file structure (`_app/`, `index.html`, `play/index.html`, `404.html`)
- [x] T047 [US4] Run `npm run build` and verify total compressed output is under 100 KB (constitution limit)
- [x] T048 [US4] Run `npm run preview` and verify the production build serves correctly with all game functionality intact

**Checkpoint**: User Story 4 complete — production build is optimised, under budget, and deployable as static files.

---

## Phase 7: User Story 5 — Service Worker Is Not Registered in Development (Priority: P3)

**Goal**: During `npm run dev`, no service worker is registered so developers don't encounter stale cached assets.

**Independent Test**: Start the dev server, open browser DevTools → Application → Service Workers, confirm no service worker is registered.

### Implementation for User Story 5

- [x] T049 [US5] Verify `devOptions: { enabled: false }` in `vite.config.ts` prevents SW registration during `npm run dev` — check DevTools Service Workers panel shows none
- [x] T050 [US5] Verify service worker IS registered when serving the production build via `npm run preview`

**Checkpoint**: User Story 5 complete — no stale cache issues during development, SW only active in production.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: CI/CD updates, cleanup, and final validation

- [x] T051 [P] Update `.github/workflows/ci.yml`: replace `setup-deno` with `setup-node@v4` (Node.js 22), add `npm ci`, `npx playwright install chromium --with-deps`, replace test/lint/build commands with `npm run test`, `npm run lint`, `npm run build`
- [x] T052 [P] Update `.github/workflows/cd.yml`: replace build command with `npm run build`, update artifact path from `_site` to `build`
- [x] T053 Run `npm run lint` and fix any ESLint/Prettier issues across all source files
- [x] T054 Run `npm run check` to verify TypeScript type checking passes with zero errors
- [x] T055 Delete any remaining empty directories or orphaned files from the migration
- [x] T056 Run full validation: `npm run test && npm run lint && npm run check && npm run build` — all must pass
- [x] T057 Verify quickstart.md instructions: follow the developer guide end-to-end (`npm install` → `npm run dev` → `npm run test` → `npm run build` → `npm run preview`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase — core app functionality
- **User Story 2 (Phase 4)**: Depends on US1 (needs working app to add PWA layer)
- **User Story 3 (Phase 5)**: Depends on US1 (needs working app to verify HMR)
- **User Story 4 (Phase 6)**: Depends on US2 (needs PWA config for full build output)
- **User Story 5 (Phase 7)**: Depends on US2 (needs PWA/SW config to verify dev-mode behavior)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) only — the MVP
- **User Story 2 (P1)**: Depends on US1 — PWA wraps around working app
- **User Story 3 (P2)**: Depends on US1 — can start after US1 completes, parallel with US2
- **User Story 4 (P2)**: Depends on US2 — needs full build including PWA assets
- **User Story 5 (P3)**: Depends on US2 — needs SW configuration to verify

### Within Each Phase

- Setup: Tasks T001–T012 are sequential (each builds on the previous)
- Foundational: T013–T017 are sequential config tasks; T018–T031 (test migrations) all [P] parallel; T032 validates after all
- US1: T033–T034 (components) can be parallel; T035–T036 (pages) depend on components; T037–T038 finalize
- US2: T039–T043 are sequential (install → config → implement → verify)
- Polish: T051–T052 are [P] parallel; T053–T057 are sequential validation

### Parallel Opportunities

```
After Phase 2 completes:

  ┌─ US1 (Phase 3): T033 ║ T034 → T035 → T036 → T037 → T038
  │
  └─ Once US1 done:
       ├─ US2 (Phase 4): T039 → T040 → T041 → T042 → T043
       │
       └─ US3 (Phase 5): T044 → T045  (parallel with US2)
            │
            └─ Once US2 done:
                 ├─ US4 (Phase 6): T046 → T047 → T048
                 └─ US5 (Phase 7): T049 → T050  (parallel with US4)
```

Within Foundational phase — all 14 test migrations can run in parallel:

```
T018 ║ T019 ║ T020 ║ T021 ║ T022 ║ T023 ║ T024 ║ T025 ║ T026 ║ T027 ║ T028 ║ T029 ║ T030 ║ T031
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (scaffold + file moves)
2. Complete Phase 2: Foundational (config + test migration)
3. Complete Phase 3: User Story 1 (Svelte components + pages)
4. **STOP and VALIDATE**: Play a full game via `npm run dev`
5. Deploy/demo if ready — game works under SvelteKit

### Incremental Delivery

1. Setup + Foundational → Foundation ready, all game logic tests pass
2. Add User Story 1 → Game playable under SvelteKit → **MVP!**
3. Add User Story 2 → PWA installable and offline-capable
4. Add User Story 3 → HMR verified (likely works from scaffold already)
5. Add User Story 4 → Production build validated and size-checked
6. Add User Story 5 → Dev-mode SW behavior confirmed
7. Polish → CI/CD updated, full validation pass

### Key Risk: Payload Budget

Constitution limit is 100 KB. Current is ~88 KB, projected ~95–98 KB with Svelte runtime. Monitor during US4 (T047). If over budget, optimize by:

- Reviewing Svelte component size
- Ensuring tree-shaking works for game logic
- Checking TailwindCSS purge is effective

---

## Notes

- [P] tasks = different files, no dependencies on each other
- [Story] label maps task to specific user story for traceability
- The scaffold provides ESLint, Prettier, Vitest, TailwindCSS — no custom setup needed for those
- All test migrations follow the same pattern: `Deno.test` → `test`, `assertEquals` → `expect().toBe()`, `assertThrows` → `expect().toThrow()`
- Svelte 5 runes only: `$props()`, `$state()`, `$derived()`, `$effect()` — no legacy `export let` or `<slot />`
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
