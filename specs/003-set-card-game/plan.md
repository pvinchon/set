# Implementation Plan: Set Card Game (Single Player)

**Branch**: `003-set-card-game` | **Date**: 2026-02-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-set-card-game/spec.md`

## Summary

Build a single-player Set card game running entirely in the browser. The game displays 12 cards with unique feature combinations (number, shape, shading, color). Players select 3-card sets; valid sets are replaced while guaranteeing a valid set always exists. Uses domain-driven architecture with branded types for type-safe feature comparisons.

## Technical Context

**Language/Version**: TypeScript (Deno latest stable)  
**Primary Dependencies**: Lume (static site generator), Tailwind CSS, esbuild plugin  
**Storage**: N/A (in-memory only, no persistence)  
**Testing**: `deno test` for unit tests on pure game logic  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge last 2 versions)  
**Project Type**: Static web application  
**Performance Goals**: FCP < 1s, set validation < 1ms, initial load < 100KB compressed  
**Constraints**: Offline-capable (PWA), no external runtime dependencies, WCAG 2.1 AA  
**Scale/Scope**: Single page, 12 cards, ~500 LOC game logic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Requirement | Pre-Design | Post-Design |
|-----------|-------------|------------|-------------|
| **Lightweight & Fast** | < 100KB compressed, FCP < 1s | ✅ | ✅ Domain folders don't add payload |
| **Offline-First** | PWA with Service Worker | ✅ | ✅ No change |
| **Simplicity** | Minimal UI, YAGNI | ✅ | ✅ Small focused modules (~50-100 LOC each) |
| **Tech Stack** | Deno, TypeScript, Lume, Tailwind | ✅ | ✅ No new dependencies |
| **Testing** | `deno test` for game logic | ✅ | ✅ Pure functions more testable |
| **CI/CD** | GitHub Actions, Lighthouse ≥ 95 | ✅ | ✅ Existing pipeline |

**Post-Design Notes**:
- Enums add minimal runtime overhead (just numbers)
- Domain folders improve organization without adding complexity
- Renderer isolation makes logic 100% testable without DOM mocks

## Project Structure

### Documentation (this feature)

```text
specs/003-set-card-game/
├── plan.md              # This file
├── research.md          # Domain-driven architecture research
├── data-model.md        # Branded types and entity definitions
├── quickstart.md        # Build/test/verify instructions
├── contracts/           # Type contracts and interfaces
└── tasks.md             # Implementation tasks
```

### Source Code (Domain-Driven Architecture)

```text
src/
├── index.vto                    # Page template
├── style.css                    # Tailwind + game styles
├── game/
│   ├── main.ts                  # Entry point, wires domains together
│   │
│   ├── attributes/              # DOMAIN: Card feature values
│   │   ├── mod.ts               # Re-exports all attribute types
│   │   └── types.ts             # Enums: Num, Shape, Shading, Color
│   │
│   ├── card/                    # DOMAIN: Single card
│   │   ├── mod.ts               # Re-exports card types and functions
│   │   ├── model.ts             # Card type using branded attributes
│   │   ├── equality.ts          # cardEquals, cardHash
│   │   └── renderer.ts          # renderCard (SVG generation)
│   │
│   ├── deck/                    # DOMAIN: Card deck
│   │   ├── mod.ts               # Re-exports deck types and functions
│   │   ├── model.ts             # Deck type, FULL_DECK (81 cards)
│   │   ├── factory.ts           # createDeck (configurable for difficulty)
│   │   └── draw.ts              # drawCards (with exclusion)
│   │
│   ├── set/                     # DOMAIN: Set validation
│   │   ├── mod.ts               # Re-exports set functions
│   │   └── validator.ts         # isValidSet, hasAnySet
│   │
│   ├── board/                   # DOMAIN: Game board state
│   │   ├── mod.ts               # Re-exports board types and functions
│   │   ├── model.ts             # Board type (12 cards)
│   │   ├── generator.ts         # generateBoard (with invariant)
│   │   └── replacer.ts          # replaceCards (simple swap)
│   │
│   ├── selection/               # DOMAIN: User selection state
│   │   ├── mod.ts               # Re-exports selection functions
│   │   ├── model.ts             # Selection state (0-3 cards)
│   │   └── actions.ts           # toggleSelection, clearSelection
│   │
│   └── state/                   # DOMAIN: Game state
│       ├── mod.ts               # Re-exports state types and actions
│       ├── model.ts             # GameState (deck, board, selection)
│       ├── actions.ts           # selectCard, submitSelection
│       └── renderer.ts          # renderGame (orchestrates card renderers)
│
└── pwa/                         # Existing PWA infrastructure
    └── ...

tests/
├── attributes/
│   └── types_test.ts            # Branded type behavior
├── card/
│   ├── model_test.ts            # Card creation and equality
│   └── factory_test.ts          # Card generation
├── set/
│   ├── validator_test.ts        # Set validation logic
│   └── completer_test.ts        # Third card computation
├── board/
│   ├── generator_test.ts        # Board generation invariant
│   └── replacer_test.ts         # Replacement algorithm
├── state/
│   └── actions_test.ts          # GameState actions
└── build_test.ts                # Existing build output test
```

**Structure Decision**: Domain-driven architecture with each domain (attributes, card, set, board, selection, state) in its own folder. Each domain owns its model and helpers. Domains are composable and independently testable. Enums in `attributes/` ensure type safety across the codebase.

## Key Architectural Decisions

### 1. Enums for Type Safety

Attributes use enums to prevent mixing feature values:

```typescript
// ❌ Without enums: easy to accidentally compare color with shape
type FeatureValue = 0 | 1 | 2;

// ✅ With enums: compiler catches mismatched comparisons
enum Num { A = 0, B = 1, C = 2 }
enum Shape { A = 0, B = 1, C = 2 }
enum Shading { A = 0, B = 1, C = 2 }
enum Color { A = 0, B = 1, C = 2 }
```

### 2. Domain Folder Structure

Each domain folder contains:
- `mod.ts` - Public API (re-exports)
- `model.ts` - Type definitions (pure data)
- `*.ts` - Logic helpers (pure functions, testable)
- `renderer.ts` - DOM concerns (isolated side effects)

### 3. Dependency Flow

```
attributes/ ← card/ ← deck/
               ↓  ↖      ↓
               ↓   set/ ←┘
               ↓     ↓
               └─> state/ ←── board/
                     ↑
                  selection/
                     ↓
                  main.ts
```

- `attributes/` has no dependencies (leaf)
- `card/` depends only on `attributes/`
- `deck/` depends on `card/` and `attributes/`
- `set/` depends on `card/`
- `board/` depends only on `card/` (model + swap)
- `selection/` depends on nothing (pure state)
- `state/` depends on `deck/`, `board/`, `selection/`, `set/`, `card/` (renderer calls renderCard)
- `main.ts` initializes state and calls renderGame

## Complexity Tracking

No constitution violations. Architecture aligns with simplicity principle:
- Each domain is ~50-100 LOC
- All logic is pure and testable
- Renderers isolate DOM side effects
- Total ~500 LOC game logic fits under 100KB compressed
