# Tasks: Offline Support (PWA)

**Input**: Design documents from `/specs/002-offline-support/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — the existing test file (`tests/build_test.ts`) already tests build outputs; PWA-specific assertions will be added.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup

**Purpose**: Create icon assets and static PWA files needed by all stories

- [x] T001 [P] Create placeholder PWA icon `src/icons/icon-192.png` (192×192 PNG, simple "S" or Set logo on white background)
- [x] T002 [P] Create placeholder PWA icon `src/icons/icon-512.png` (512×512 PNG, same design as 192)
- [x] T003 [P] Create maskable PWA icon `src/icons/icon-maskable-192.png` (192×192 PNG, content within inner 80% safe zone)
- [x] T004 [P] Create maskable PWA icon `src/icons/icon-maskable-512.png` (512×512 PNG, content within inner 80% safe zone)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Register SW and manifest in the build pipeline — MUST be complete before any user story delivers value

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Add `site.add("service_worker.js")` and `site.add("manifest.webmanifest")` and `site.add("icons")` to `_config.ts` so Lume copies these files to `_site/`
- [x] T006 Add Lume `process([".html"])` hook in `_config.ts` that injects `<link rel="manifest" href="/manifest.webmanifest">`, `<meta name="theme-color" content="#111827">`, and `<link rel="apple-touch-icon" href="/icons/icon-192.png">` into the `<head>` of every HTML page
- [x] T007 Add Lume `process([".html"])` hook in `_config.ts` that injects a `<script>` tag before `</body>` registering the Service Worker: `if ("serviceWorker" in navigator) { navigator.serviceWorker.register("/service_worker.js"); }`

**Checkpoint**: After this phase, the build pipeline copies all PWA files and injects manifest/SW-registration links into HTML. The SW itself has no caching logic yet.

---

## Phase 3: User Story 1 — Browse Offline (Priority: P1) 🎯 MVP

**Goal**: After one online visit, the site loads fully from cache when offline.

**Independent Test**: Build the site, serve locally, open in Chrome, enable "Offline" in DevTools Network tab, reload — page displays correctly.

### Implementation for User Story 1

- [x] T008 [US1] Create `src/service_worker.js` with placeholder tokens `__CACHE_NAME__` and `__PRECACHE_URLS__`, implementing: `install` event (open cache, `cache.addAll(PRECACHE_URLS)`, `self.skipWaiting()`), `activate` event (delete old caches where name ≠ `CACHE_NAME`, `self.clients.claim()`), `fetch` event (cache-first: match request in cache, return cached response or fall back to `fetch()`)
- [x] T009 [US1] Add Lume `process([".js"])` hook in `_config.ts` that replaces `__PRECACHE_URLS__` in `service_worker.js` with a JSON array of all output URLs (enumerate `site.pages` and `site.files`, filter out `service_worker.js` itself) and replaces `__CACHE_NAME__` with `"set-v${Date.now()}"`
- [x] T010 [US1] Add build-output tests in `tests/build_test.ts`: assert `_site/service_worker.js` exists and is non-empty, assert `service_worker.js` does NOT contain the literal string `__PRECACHE_URLS__` (i.e., placeholder was replaced), assert `service_worker.js` does NOT contain the literal string `__CACHE_NAME__`, assert `service_worker.js` contains `"/"` and `"/style.css"` in the precache list

**Checkpoint**: At this point, the site has a fully working Service Worker. Building and serving locally, then going offline, the page loads from cache. FR-001, FR-002, FR-004, FR-007 are satisfied.

---

## Phase 4: User Story 2 — Cache Update (Priority: P2)

**Goal**: When content changes and the site is rebuilt/redeployed, returning visitors automatically get updated cached content.

**Independent Test**: Build the site, visit once, change the `<h1>` text in `src/index.vto`, rebuild, visit again — confirm new content appears; go offline — confirm new content is still cached.

### Implementation for User Story 2

- [x] T011 [US2] Verify cache versioning works by adding a test in `tests/build_test.ts`: run two builds, read `_site/service_worker.js` after each, assert the `CACHE_NAME` values differ (timestamps differ between builds)
- [x] T012 [US2] Verify old-cache cleanup logic in `src/service_worker.js` `activate` handler: ensure `caches.keys()` filters by prefix `"set-"` so only this app's caches are deleted, not caches from other sites on the same GitHub Pages origin

**Checkpoint**: Cache invalidation is automatic — every build produces a new cache name, the `activate` event purges old caches, and `skipWaiting()` + `clients.claim()` ensure immediate takeover. FR-003 is satisfied.

---

## Phase 5: User Story 3 — Install as Home-Screen App (Priority: P3)

**Goal**: The site meets PWA installability criteria so visitors can add it to their home screen and launch it in a standalone window.

**Independent Test**: Open DevTools → Application → Manifest, confirm all fields are present and valid. Run Lighthouse PWA audit, confirm "Installable" badge.

### Implementation for User Story 3

- [x] T013 [P] [US3] Create `src/manifest.webmanifest` with fields: `name` ("Set"), `short_name` ("Set"), `start_url` ("/"), `display` ("standalone"), `background_color` ("#ffffff"), `theme_color` ("#111827"), and `icons` array referencing all four icon files with correct `sizes`, `type` ("image/png"), and `purpose` ("any" for standard, "maskable" for maskable)
- [x] T014 [P] [US3] Add manifest validation tests in `tests/build_test.ts`: assert `_site/manifest.webmanifest` exists, parse it as JSON, assert it has `name`, `short_name`, `start_url`, `display`, assert `icons` array has at least 4 entries, assert icons include 192×192 and 512×512 sizes
- [x] T015 [P] [US3] Add icon file tests in `tests/build_test.ts`: assert `_site/icons/icon-192.png`, `_site/icons/icon-512.png`, `_site/icons/icon-maskable-192.png`, and `_site/icons/icon-maskable-512.png` all exist
- [x] T016 [US3] Add HTML injection tests in `tests/build_test.ts`: assert `_site/index.html` contains `rel="manifest"`, contains `apple-touch-icon`, contains `theme-color`, and contains `serviceWorker`

**Checkpoint**: All three user stories are complete. The site works offline, updates caches automatically, and is installable as a PWA. FR-005, FR-006, FR-008 are satisfied.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T017 Run `deno task build && deno task test` and verify all tests pass
- [x] T018 Run quickstart.md validation: follow all steps in `specs/002-offline-support/quickstart.md` manually (serve locally, verify offline, verify manifest, verify installability)
- [x] T019 Verify total payload stays under 100 KB compressed (constitution constraint) and SW + manifest add < 50 KB uncompressed (SC-005)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — create icon files immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (icon files must exist for `site.add("icons")`) — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — creates and wires up the Service Worker
- **US2 (Phase 4)**: Depends on Phase 3 — verifies cache versioning behaviour that the SW implements
- **US3 (Phase 5)**: Depends on Phase 2 only — manifest and icons are independent of SW caching logic. Can be done in parallel with US1/US2.
- **Polish (Phase 6)**: Depends on all user story phases

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational (Phase 2). No dependencies on other stories. **This is the MVP.**
- **US2 (P2)**: Depends on US1 (Phase 3) — cache versioning validation requires the SW to exist.
- **US3 (P3)**: Depends on Foundational (Phase 2) only. Can be done in parallel with US1.

### Within Each User Story

- Core file creation before build integration
- Build integration before tests
- Tests validate build output (not unit tests of runtime behaviour)

### Parallel Opportunities

- T001, T002, T003, T004 can all run in parallel (independent icon files)
- T013, T014, T015 can all run in parallel (manifest file + tests are independent files)
- US1 (Phase 3) and US3 (Phase 5) can run in parallel after Phase 2

---

## Parallel Example: User Story 1 (Phase 3)

```bash
# T008: Create src/service_worker.js (the core service worker file)
# Then sequentially:
# T009: Add the Lume process() hook to inject precache URLs into service_worker.js
# T010: Add build tests verifying service_worker.js output
```

## Parallel Example: User Story 3 (Phase 5)

```bash
# Launch all in parallel (different files, no dependencies):
# T013: Create src/manifest.webmanifest
# T014: Add manifest validation tests
# T015: Add icon file existence tests
# Then:
# T016: Add HTML injection tests (depends on T006, T007 from Phase 2)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create icon PNGs)
2. Complete Phase 2: Foundational (wire up build pipeline)
3. Complete Phase 3: User Story 1 (Service Worker with precaching)
4. **STOP and VALIDATE**: Build, serve, go offline — site loads from cache
5. Deploy/demo if ready — the site works offline!

### Incremental Delivery

1. Setup + Foundational → Build pipeline ready
2. Add US1 → Offline browsing works → Deploy (MVP!)
3. Add US2 → Cache update verified → Deploy
4. Add US3 → Installable PWA → Deploy
5. Polish → All tests pass, payload validated

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Icon PNGs must be created or sourced manually (no auto-generation) — simple placeholder icons are acceptable for the initial implementation
- The Service Worker is vanilla JavaScript (not TypeScript) because it runs in the browser, not Deno
- All build integration happens in `_config.ts` via Lume's `site.process()` and `site.add()` APIs
- Commit after each task or logical group
