# Implementation Plan: Hello World Website with CI/CD

**Branch**: `001-hello-world-website` | **Date**: 2026-02-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-hello-world-website/spec.md`

## Summary

Deliver a minimal "Hello, World!" static website built with Lume (Deno-native SSG) and styled with Tailwind CSS, with a GitHub Actions CI pipeline (fmt + lint + test + build) gating every PR and a CD pipeline deploying to GitHub Pages on every merge to `main`. PWA/offline support is explicitly out of scope (deferred to a follow-up feature).

## Technical Context

**Language/Version**: TypeScript (Deno latest stable) for build configuration; HTML + CSS for markup and styling  
**Primary Dependencies**: Lume (Deno-native static site generator), Tailwind CSS (via Lume plugin)  
**Storage**: N/A (static site, no persistent storage)  
**Testing**: `deno test` for build-output validation and content assertions; `deno fmt --check` for formatting; `deno lint` for code quality  
**Target Platform**: Modern evergreen browsers (last 2 versions of Chrome, Firefox, Safari, Edge); hosted on GitHub Pages  
**Project Type**: Single static site  
**Performance Goals**: FCP < 1 s on Fast 3G
**Constraints**: Total compressed payload < 100 KB; zero external runtime dependencies; no server-side runtime  
**Scale/Scope**: Single page, single contributor workflow initially

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle / Constraint                                               | Status   | Notes                                                                          |
| -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| **I. Lightweight & Fast** — Payload < 100 KB                         | PASS     | Single HTML page + purged Tailwind CSS; well under limit                       |
| **I. Lightweight & Fast** — Zero external runtime deps               | PASS     | No frameworks, no CDN calls, no third-party analytics                          |
| **I. Lightweight & Fast** — FCP < 1 s on Fast 3G                     | PASS     | Minimal static page; design ensures compliance                                 |
| **I. Lightweight & Fast** — Deno + Lume; output minified/compressed  | PASS     | Lume builds static output; minification via Lume plugins                       |
| **II. Offline-First** — Service Worker + PWA manifest                | DEFERRED | Out of scope per clarification; follow-up feature                              |
| **III. Simplicity** — Only elements needed for current state         | PASS     | Single page with greeting text only                                            |
| **III. Simplicity** — YAGNI                                          | PASS     | No speculative features included                                               |
| **Technical** — Deno runtime, TypeScript, HTML, CSS                  | PASS     | All source uses these                                                          |
| **Technical** — Tailwind CSS (purged)                                | PASS     | Lume Tailwind plugin with purge enabled                                        |
| **Technical** — Lume SSG                                             | PASS     | `_config.ts` configures Lume                                                   |
| **Technical** — `deno test`                                          | PASS     | Tests validate build output                                                    |
| **Technical** — GitHub Actions CI on push/PR                         | PASS     | Workflow defined in `.github/workflows/ci.yml`                                 |
| **Technical** — GitHub Actions CD to GitHub Pages on merge to `main` | PASS     | Workflow defined in `.github/workflows/cd.yml`                                 |
| **Technical** — WCAG 2.1 AA                                          | PASS     | Colour contrast and keyboard navigation addressed in markup + Tailwind classes |
| **Workflow** — `deno task` for all local commands                    | PASS     | `deno.json` defines `build`, `serve`, `test`, `lint`, `fmt` tasks              |
| **Workflow** — Failing pipeline blocks merge                         | PASS     | Branch protection + required status checks                                     |

**Gate result: PASS** — One deferred item (PWA/offline) is justified by spec clarification. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/001-hello-world-website/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (empty — no APIs)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
.
├── _config.ts                        # Lume configuration (plugins, site settings)
├── deno.json                         # Deno config: imports, tasks, compiler options
├── src/
│   ├── index.vto                     # Main page template (Hello, World!)
│   ├── _includes/
│   │   └── layout.vto                # Base HTML layout (head, body wrapper)
│   └── style.css                     # Tailwind CSS entry point (@import "tailwindcss")
├── tests/
│   └── build_test.ts                 # Deno tests: output validation, content assertions
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI: fmt → lint → test → build (on push & PR)
│       └── cd.yml                    # CD: build → deploy to GitHub Pages (on merge to main)
└── _site/                            # Build output directory (git-ignored)
```

**Structure Decision**: Single-project layout. No backend, no separate frontend package. Lume convention: source files in `src/`, output in `_site/`, includes in `src/_includes/`. GitHub Actions workflows in `.github/workflows/`.

## Complexity Tracking

> No constitution violations requiring justification. Table intentionally left empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _(none)_  | —          | —                                    |
