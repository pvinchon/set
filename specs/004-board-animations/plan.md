# Implementation Plan: Board Animations

**Branch**: `004-board-animations` | **Date**: 2026-02-17 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-board-animations/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add six CSS animation types to the Set card game (initial deal, hover/active, selection, valid/invalid set feedback, card replacement). Requires switching the renderer from full DOM wipe (`innerHTML`) to incremental DOM patching so animations can play on persistent elements. Animation coordination lives in the game loop with a phase-based state machine that locks input during blocking sequences. All animations are CSS-only (`@keyframes` + Tailwind utilities); no external dependencies added.

## Technical Context

**Language/Version**: TypeScript (Deno latest stable)  
**Primary Dependencies**: Tailwind CSS v4 (via Lume plugin), Lume v3.2.1, esbuild  
**Storage**: N/A  
**Testing**: `deno test` for game logic unit tests; manual verification for visual animations  
**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — last 2 versions)  
**Project Type**: Single static web app (Lume SSG)  
**Performance Goals**: All animations GPU-accelerated (transform/opacity only). No layout thrashing. 60fps on median devices.  
**Constraints**: Total payload <100KB (constitution). No external runtime dependencies. First Contentful Paint <1s.  
**Scale/Scope**: 12-card board, 6 animation types, 4 files modified, 0 files added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Status | Notes |
|---|---|---|---|
| I. Lightweight & Fast | Payload <100KB, no external deps, FCP <1s | ✅ PASS | CSS keyframes add ~200 bytes. No JS library. GPU-accelerated transforms only. |
| II. Offline-First | Fully playable offline | ✅ PASS | No network dependency. Pure CSS/JS animations. |
| III. Simplicity | Only elements needed for current state. YAGNI. | ✅ PASS | No animation library, no state machine in data model, no config UI. Minimal JS coordination. |
| Runtime: Deno | All tooling under Deno | ✅ PASS | No change to build pipeline. |
| Language: TypeScript | All logic in TS | ✅ PASS | Animation coordinator is TS. |
| Styling: Tailwind CSS | Utility-first, purge unused | ✅ PASS | New utilities via `@utility` directive. All used classes ship. |
| Build: Lume | Lume handles build | ✅ PASS | No build config changes. |
| Rendering: DOM-based | DOM rendering | ✅ PASS | Incremental DOM patching is still DOM-based. |
| Testing: `deno test` | Game logic tested | ✅ PASS | State logic unchanged, existing tests pass. Rendering changes are CSS-visual. |
| Accessibility: WCAG 2.1 AA | Color contrast, keyboard nav | ✅ PASS | Animations don't affect contrast ratios or keyboard navigation. |

**Gate result**: ✅ All checks pass. No violations to justify.

**Post-Phase 1 re-check**: ✅ All checks still pass. Design uses only CSS animations with minimal JS coordination. No new dependencies, no complexity beyond what's needed.

## Project Structure

### Documentation (this feature)

```text
specs/004-board-animations/
├── plan.md              # This file
├── research.md          # Phase 0 output - architecture decisions
├── data-model.md        # Phase 1 output - AnimationPhase/AnimationState
├── quickstart.md        # Phase 1 output - verification guide
├── contracts/           # Phase 1 output - CSS & TS interface contracts
│   └── README.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── style.css                    # MODIFIED: add @keyframes + @utility for animations
├── game/
│   ├── main.ts                  # MODIFIED: animation coordinator, phase tracking, input lock
│   ├── card/
│   │   └── renderer.ts          # MODIFIED: enhanced hover/active classes, transition duration
│   └── state/
│       └── renderer.ts          # MODIFIED: incremental DOM patching replaces innerHTML wipe
```

**Structure Decision**: Single static web app. All changes modify 4 existing files. No new files or directories added. The animation coordinator is co-located with the game loop in `main.ts` since it's UI-only orchestration that doesn't belong in the pure state module.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
