# Tasks: Hello World Website with CI/CD

**Input**: Design documents from `/specs/001-hello-world-website/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Included — FR-006 requires automated tests in CI; research.md defines build-output validation tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Lume project, Deno configuration, and shared tooling that all user stories depend on.

- [ ] T001 Initialize Lume project by running `deno run -A https://lume.land/init.ts` to scaffold `_config.ts` and `deno.json` at repository root
- [ ] T002 Configure Lume to use `src/` as source directory and enable Tailwind CSS plugin with `minify: true` in `_config.ts`
- [ ] T003 Add `fmt`, `test`, `lint`, `serve`, and `build` tasks to `deno.json` (`deno fmt`, `deno test`, `deno lint`, `deno task lume -s`, `deno task lume`)
- [ ] T004 Create Tailwind CSS entry point at `src/style.css` with `@import "tailwindcss"`
- [ ] T005 Create base HTML layout template at `src/_includes/layout.vto` with `<!doctype html>`, `<html lang="en">`, `<head>` (charset, viewport, stylesheet link), and `<body>` wrapping `{{ content }}`
- [ ] T006 Add `_site/` to `.gitignore` at repository root

**Checkpoint**: `deno task build` runs without error and produces an empty `_site/` directory. `deno fmt --check` and `deno lint` pass on all files.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No additional foundational work needed beyond Phase 1 for this feature. All shared infrastructure is covered by Setup.

**⚠️ NOTE**: This phase is intentionally empty. User story implementation can begin immediately after Phase 1.

---

## Phase 3: User Story 1 — Visit the Hello World Page (Priority: P1) 🎯 MVP

**Goal**: A visitor navigates to the root URL and sees a "Hello, World!" page with clean, minimal, responsive design meeting WCAG 2.1 AA.

**Independent Test**: Open the built `_site/index.html` in a browser and confirm the greeting text appears with correct styling. Run `deno task test` to validate programmatically.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [US1] Create build-output validation test in `tests/build_test.ts` that: (1) runs the Lume build, (2) asserts `_site/index.html` exists, (3) asserts the HTML contains "Hello, World!", (4) asserts `_site/style.css` exists and is non-empty

### Implementation for User Story 1

- [ ] T008 [US1] Create the Hello World page template at `src/index.vto` using the `layout.vto` layout, and `<h1>` containing "Hello, World!" styled with Tailwind utility classes for centered, responsive, accessible design (high-contrast text, readable font size)
- [ ] T009 [US1] Verify WCAG 2.1 AA compliance: ensure colour contrast ratio ≥ 4.5:1 for text, keyboard-focusable elements have visible focus indicators, and `lang="en"` is set on `<html>`
- [ ] T010 [US1] Run `deno task build` and verify `_site/index.html` and `_site/style.css` are produced. Run `deno task test` and verify all assertions pass
- [ ] T011 [US1] Run `deno fmt --check` and `deno lint` to confirm all source files pass formatting and linting

**Checkpoint**: `_site/index.html` displays "Hello, World!" with correct styling. All tests pass. `deno fmt --check` and `deno lint` pass. The page is fully functional as a local static site.

---

## Phase 4: User Story 2 — Automated Quality Gate on Every Change (Priority: P2)

**Goal**: A CI pipeline runs formatting checks, linting, tests, and build on every push and PR, blocking merge on failure.

**Independent Test**: Push a commit with a deliberate `deno fmt` violation; verify the CI workflow fails and reports the specific issue. Push a clean commit; verify the workflow passes and PR is mergeable.

### Implementation for User Story 2

- [ ] T012 [US2] Create GitHub Actions CI workflow at `.github/workflows/ci.yml` triggered on `push` and `pull_request` events with steps: `actions/checkout@v4`, `denoland/setup-deno@v2` (with `cache: true`), `deno fmt --check`, `deno lint`, `deno task test`, `deno task build`
- [ ] T013 [US2] Add concurrency control to `ci.yml`: `concurrency: { group: "ci-${{ github.ref }}", cancel-in-progress: true }` to avoid redundant runs on rapid pushes
- [ ] T014 [US2] Document branch protection setup in the PR description: require the CI job as a required status check on `main`, require branches to be up to date before merging

**Checkpoint**: Pushing to any branch triggers the CI workflow. A formatting or lint error causes the workflow to fail. A clean push passes all steps. Branch protection (once configured) blocks merge on failure.

---

## Phase 5: User Story 3 — Automatic Deployment on Merge (Priority: P3)

**Goal**: Merging to `main` automatically builds and deploys the site to GitHub Pages. The updated site is live at the public URL within minutes.

**Independent Test**: Merge a PR that changes the greeting text; verify the deploy workflow runs and the live GitHub Pages URL reflects the change.

### Implementation for User Story 3

- [ ] T015 [US3] Create GitHub Actions CD workflow at `.github/workflows/cd.yml` triggered on `push` to `main` only, with permissions (`contents: read`, `pages: write`, `id-token: write`), and steps: `actions/checkout@v4`, `denoland/setup-deno@v2` (with `cache: true`), `deno task build`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` (path: `_site`), `actions/deploy-pages@v4`
- [ ] T016 [US3] Add concurrency control to `cd.yml`: `concurrency: { group: "pages", cancel-in-progress: false }` and environment `github-pages` to serialise deployments
- [ ] T017 [US3] Document GitHub Pages setup in the PR description: enable Pages in repo settings with source set to "GitHub Actions"

**Checkpoint**: Merging to `main` triggers the deploy workflow. The site is published to the GitHub Pages URL. Concurrent merges queue rather than race.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation across all user stories and cleanup.

- [ ] T018 [P] Run `deno fmt --check`, `deno lint`, and `deno task test` to confirm all quality gates pass locally
- [ ] T019 [P] Verify `deno task build` output is under 100 KB compressed (constitution constraint)
- [ ] T020 Run quickstart.md validation: follow all steps in `specs/001-hello-world-website/quickstart.md` from a clean clone and confirm every command succeeds
- [ ] T021 Commit all changes with an atomic, descriptive commit message summarising the feature

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Empty — no blocking prerequisites beyond Setup
- **User Story 1 (Phase 3)**: Depends on Setup (Phase 1) completion
- **User Story 2 (Phase 4)**: Depends on Setup (Phase 1) completion; benefits from US1 tests existing but not strictly required
- **User Story 3 (Phase 5)**: Depends on Setup (Phase 1) completion; benefits from US2 CI workflow existing
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup — no dependencies on other stories
- **User Story 2 (P2)**: Can start after Setup — references `deno task test` and `deno task build` which exist from Setup, but benefits from US1 tests being written (T007)
- **User Story 3 (P3)**: Can start after Setup — benefits from US2 CI workflow being in place (merge gating), but the deploy workflow itself is independent

### Within Each User Story

- Tests written FIRST and verified to FAIL before implementation (US1)
- Implementation tasks follow logical dependency order
- Each story is independently testable at its checkpoint

### Parallel Opportunities

- T004, T005, T006 in Setup can run in parallel (different files)
- US1 and US2 can be worked on in parallel after Setup (US2 doesn't need US1 complete)
- T018 and T019 in Polish can run in parallel

---

## Parallel Example: User Story 1

```bash
# After Setup completes:

# Step 1: Write test first (must fail)
Task: T007 — Create build_test.ts

# Step 2: Implement (in parallel where possible)
Task: T008 — Create index.vto (page template)
Task: T009 — Verify WCAG compliance (same file, sequential after T008)

# Step 3: Validate
Task: T010 — Build and run tests (depends on T007, T008)
Task: T011 — Format and lint check (can run alongside T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T006)
2. Complete Phase 3: User Story 1 (T007–T011)
3. **STOP and VALIDATE**: `deno task build` produces valid output, all tests pass, page displays correctly
4. The site is a working Hello World page — minimal but complete

### Incremental Delivery

1. Setup → US1 → **MVP: working Hello World page** ✓
2. Add US2 → **CI pipeline gating PRs** ✓
3. Add US3 → **Auto-deploy to GitHub Pages** ✓
4. Polish → **Validated, clean, production-ready** ✓
5. Each story adds infrastructure without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup together (T001–T006)
2. Once Setup is done:
   - Developer A: User Story 1 (T007–T011)
   - Developer B: User Story 2 (T012–T014)
3. After US1 + US2: Developer A or B takes User Story 3 (T015–T017)
4. Polish phase together (T018–T021)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Tests are written FIRST (T007) and must fail before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total: 21 tasks across 6 phases
