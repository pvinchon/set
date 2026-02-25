# Quickstart: Set Card Game (Single Player)

**Feature**: 003-set-card-game
**Date**: 2026-02-12

## Prerequisites

- Deno (latest stable) installed
- Repository cloned, on branch `003-set-card-game`

## Build and Test

```bash
# Build the site (compiles game TS, generates static output)
deno task build

# Run all tests (game logic)
deno task test

# Run tests for a specific domain
deno test tests/card/
deno test tests/set/
deno test tests/board/

# Serve locally with live reload
deno task serve
```

## Verify the Game Locally

1. Run `deno task serve` and open the site in your browser
2. You should see a board of 12 cards arranged in a grid
3. Each card shows 1-3 shapes with distinct color and shading
4. Click/tap 3 cards to select them -- valid sets are removed and replaced
5. Invalid selections show error feedback and deselect
6. Refresh the page to start a new game

## Verify Offline Play

1. Load the game once with network active (Service Worker caches assets)
2. Go offline (DevTools > Network > Offline)
3. Reload -- the game should load fully from cache
4. Play normally -- all game logic runs client-side

## Project Structure

### Source Code (Domain-Driven)

```text
src/
├── index.vto                    # Page template
├── style.css                    # Tailwind + game styles
├── game/
│   ├── main.ts                  # Entry point
│   │
│   ├── attributes/              # Enum feature types
│   │   ├── mod.ts               # Public exports
│   │   └── types.ts             # Num, Shape, Shading, Color enums
│   │
│   ├── card/                    # Card domain
│   │   ├── mod.ts               # Public exports
│   │   ├── model.ts             # Card interface
│   │   ├── equality.ts          # cardEquals, cardHash
│   │   └── renderer.ts          # SVG rendering
│   │
│   ├── deck/                    # Deck domain
│   │   ├── mod.ts               # Public exports
│   │   ├── model.ts             # Deck type, FULL_DECK
│   │   ├── factory.ts           # createDeck (difficulty levels)
│   │   └── draw.ts              # drawCards (with exclusion)
│   │
│   ├── set/                     # Set validation domain
│   │   ├── mod.ts               # Public exports
│   │   └── validator.ts         # isValidSet, hasAnySet
│   │
│   ├── board/                   # Board domain
│   │   ├── mod.ts               # Public exports
│   │   ├── model.ts             # Board interface
│   │   ├── generator.ts         # generateBoard
│   │   └── replacer.ts          # replaceCards (simple swap)
│   │
│   ├── selection/               # Selection state domain
│   │   ├── mod.ts               # Public exports
│   │   ├── model.ts             # Selection interface
│   │   └── actions.ts           # toggleSelection, clearSelection
│   │
│   └── state/                   # Game state domain
│       ├── mod.ts               # Public exports
│       ├── model.ts             # GameState (deck, board, selection)
│       ├── actions.ts           # selectCard, submitSelection
│       └── renderer.ts          # renderGame (calls card renderer)
│
└── pwa/                         # Existing PWA infrastructure
```

### Tests (Mirror Domain Structure)

```text
tests/
├── attributes/
│   └── types_test.ts            # Enum type safety tests
├── card/
│   ├── model_test.ts            # Card creation
│   └── equality_test.ts         # cardEquals, cardHash
├── deck/
│   └── factory_test.ts          # Deck creation, subsets
├── set/
│   └── validator_test.ts        # isValidSet, hasAnySet tests
├── board/
│   ├── generator_test.ts        # Board invariant
│   └── replacer_test.ts         # Replacement algorithm
├── state/
│   └── actions_test.ts          # selectCard, submitSelection
└── build_test.ts                # Build output verification
```

## Key Architectural Patterns

### 1. Domain Modules

Each domain folder has `mod.ts` as its public API:

```typescript
// Import from domain, not from internal files
import { Card, createCard, renderCard } from './card/mod.ts';

// ❌ Avoid deep imports
import { Card } from './card/model.ts';
```

### 2. Enums for Type Safety

Feature values use enums to prevent mixing:

```typescript
import { Num, Color } from './attributes/mod.ts';

const num = Num.B;
const col = Color.B;

// ❌ TypeScript Error: Cannot compare Num with Color
if (num === col) {
}
```

### 3. Pure Functions

Logic files (validator, completer, generator) are pure functions with no DOM access:

```typescript
// set/validator.ts - Pure, easily testable
export function isValidSet(a: Card, b: Card, c: Card): boolean {
	// No DOM, no side effects
}
```

### 4. Renderer Isolation

All DOM operations are in `renderer.ts` files:

```typescript
// card/renderer.ts - All DOM code here
export function renderCard(card: Card, index: number): HTMLElement {
	// SVG generation, DOM manipulation
}
```

## Dependency Flow

```
attributes/  (leaf - no dependencies)
     ↓
   card/     (depends on attributes/)
     ↓
   deck/     (depends on card/, attributes/)
     ↓
   set/      (depends on card/)

  board/     (depends on card/)

selection/   (no dependencies)
     ↓
  state/     (depends on deck/, board/, selection/, set/, card/)
     ↓        ↑ renderGame calls renderCard
  main.ts    (initializes state, calls renderGame)
```

## Running Individual Domain Tests

```bash
# Test branded type safety
deno test tests/attributes/

# Test card creation and equality
deno test tests/card/

# Test set validation (exhaustive)
deno test tests/set/validator_test.ts

# Test board invariant holds
deno test tests/board/generator_test.ts

# Run all tests
deno test
```

## Configuration

| File               | Purpose                         |
| ------------------ | ------------------------------- |
| `_config.ts`       | Lume config with esbuild plugin |
| `deno.json`        | Task definitions, import map    |
| `src/game/main.ts` | Game entry point                |
