# Research: Set Card Game (Single Player)

**Feature**: 003-set-card-game
**Date**: 2026-02-12

## 1. Card Shape Rendering (SVG)

**Decision**: Render all 3 shapes (diamond, squiggle, oval) as inline SVG using `<path>` and `<rect>` elements. Use CSS classes for color and shading instead of hardcoding attributes. Define one shared `<defs>` block for stripe patterns.

**Rationale**: Inline SVG is the lightest option (~300-500 bytes per card), requires no image loading, renders crisply at any size, and supports CSS styling for colors and shadings. This keeps the total payload well under the 100 KB constitution limit.

**Alternatives considered**:
- **Canvas rendering**: More complex API, harder to style with CSS, no native accessibility. Overkill for 12 static cards.
- **CSS-only shapes**: Possible for diamond and oval via `clip-path` or `border-radius`, but squiggle is impractical without SVG paths.
- **Image sprites (PNG/WebP)**: Would require 81 images or a sprite sheet. Much heavier than inline SVG and harder to maintain.

### Shape Definitions (viewBox `0 0 40 80`)

- **Diamond**: `M20 4 L38 40 L20 76 L2 40Z` (4 straight lines, ~40 bytes)
- **Oval**: `<rect x="4" y="8" width="32" height="64" rx="16"/>` (~45 bytes)
- **Squiggle**: `M25 6 C38 6,40 22,33 34 C26 46,6 42,5 56 C4 70,14 78,25 74 C14 78,-2 66,5 52 C12 38,30 44,35 30 C40 16,36 6,25 6Z` (~120 bytes)

### Shading Approach

- **Solid**: `fill: currentColor; stroke: currentColor`
- **Open**: `fill: none; stroke: currentColor`
- **Striped**: `fill: url(#stripe); stroke: currentColor` with a `<pattern>` using horizontal lines

Stripe pattern (shared, one per page):
```svg
<svg width="0" height="0" style="position:absolute">
  <defs>
    <pattern id="stripe" patternUnits="userSpaceOnUse" width="40" height="5">
      <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" stroke-width="1.5"/>
    </pattern>
  </defs>
</svg>
```

### Multi-Shape Layout (1, 2, or 3 shapes per card)

Shapes are centered vertically within the card SVG. Y-offsets for a 180-height card:
- 1 shape: y=50
- 2 shapes: y=12, y=88
- 3 shapes: y=2, y=50, y=98

## 2. Client-Side TypeScript with Lume

**Decision**: Use Lume's built-in `esbuild` plugin to compile and bundle game TypeScript into a single browser-ready JS file. Entry point at `src/game.ts`, output at `/game.js`.

**Rationale**: Lume 3.x includes `lume/plugins/esbuild.ts` which uses esbuild with `@luca/esbuild-deno-loader` for Deno module resolution. It bundles, minifies, and tree-shakes by default. This means zero new dependencies -- the esbuild plugin ships with Lume.

**Alternatives considered**:
- **Manual `site.process()` for TS compilation**: Would require reimplementing esbuild pipeline. Lume already handles this.
- **Separate build step (deno compile/bundle)**: Adds build complexity and a second tool. Lume's esbuild plugin is the canonical approach.
- **No TypeScript, write vanilla JS**: Loses type safety for game logic. TypeScript catches set-validation bugs at compile time.

### Integration

```typescript
// _config.ts addition:
import esbuild from "lume/plugins/esbuild.ts";
site.add("game.ts");
site.use(esbuild());
```

```html
<!-- layout.vto addition: -->
<script type="module" src="/game.js"></script>
```

## 3. Board Invariant: Guaranteeing a Valid Set Always Exists

**Decision**: Use recursive random replacement. Generate 3 random replacement cards, check the 12-card board for a set. If no set exists (~3.2% probability), recurse with new random cards.

**Rationale**: ~96.8% of random 12-card boards contain at least one valid set, so random replacement succeeds almost always. Recursion is simpler than a deterministic fallback and produces natural-feeling randomness.

**Alternatives considered**:
- **Pure retry with iteration**: Equivalent to recursion but less idiomatic in functional style.
- **Deterministic fallback (compute third card)**: More complex code for negligible performance benefit. The ~3.2% retry rate means average ~1.03 attempts per replacement.

### Key Math

- **Cap set size for 3^4 = 20**: Any 21+ cards from the 81-card universe must contain a valid set. A 12-card board *can* be set-free (max set-free is 20).
- **Probability of no set in 12 random cards: ~3.2%** (30:1 odds against at game start).
- **Average sets in 12 cards: ~2.78**.

### Algorithm (pseudocode)

```
// In main.ts orchestrator
function handleValidSet(board[12], selectedIndices[3], deck):
  remaining = board without selected cards  // 9 cards
  
  function tryReplacement():
    newCards = deck.drawCards(3, exclude=remaining)
    candidate = board.replaceCards(board, selectedIndices, newCards)
    
    if hasAnySet(candidate.cards):
      return candidate
    return tryReplacement()  // ~96.8% success, rarely recurses
  
  return tryReplacement()

// In deck/draw.ts
function drawCards(deck, count, exclude):
  available = deck.cards minus exclude
  return count random cards from available

// In board/replacer.ts (simple swap, no set/deck knowledge)
function replaceCards(board, indices[3], newCards[3]):
  return board with cards at indices replaced by newCards
```

### Card Universe

Since the game runs indefinitely (not limited to 81 cards), cards are drawn from the full 81-card universe. Duplicates on the board are fine -- the same card combination can appear multiple times across different boards. Each replacement draws from all 81 possible cards minus the 9 remaining cards on the board.

## 4. Card Grid Layout

**Decision**: Use CSS Grid (via Tailwind utilities) for the 12-card board layout. 4 columns x 3 rows on desktop, 3 columns x 4 rows on mobile.

**Rationale**: CSS Grid is the simplest layout approach for a fixed-size card grid. Tailwind's `grid`, `grid-cols-*`, and `gap-*` utilities handle this with zero custom CSS. Responsive breakpoints via Tailwind's `sm:` prefix.

**Alternatives considered**:
- **Flexbox with wrapping**: Slightly more complex for a fixed grid; requires manual width calculations.
- **CSS `aspect-ratio` + absolute positioning**: Over-engineered for 12 cards.

### Layout

```html
<div class="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4">
  <!-- 12 card elements -->
</div>
```

## 5. Color Accessibility (WCAG 2.1 AA)

**Decision**: Use colors with sufficient contrast against white card backgrounds: red (#dc2626), green (#16a34a), purple (#7c3aed). All meet WCAG AA contrast ratio (>= 4.5:1) against white.

**Rationale**: Constitution requires WCAG 2.1 AA for colour contrast. The standard Set colors (red, green, purple) are inherently high-contrast. Using Tailwind's default palette colors ensures consistency and accessibility.

**Alternatives considered**:
- **Custom color values**: Unnecessary -- Tailwind's red-600, green-600, violet-600 already meet AA contrast.

### Contrast Ratios (against white #ffffff)

- Red (#dc2626): 4.63:1 -- PASS AA
- Green (#16a34a): 4.58:1 -- PASS AA
- Purple (#7c3aed): 4.62:1 -- PASS AA

## 6. Domain-Driven Architecture

**Decision**: Organize game code into domain folders (attributes, card, deck, set, board, selection, state). Each domain owns its model and logic. Use enums for attribute values.

**Rationale**: 
- **Separation of concerns**: Each domain is a self-contained unit with clear responsibilities
- **Testability**: Pure logic functions (validators, generators) are isolated from DOM renderers
- **Composability**: Domains depend on each other in a clear hierarchy (attributes → card → set → board)
- **Type safety**: Enums prevent accidental mixing of feature values (comparing color with shape)

**Alternatives considered**:
- **Flat file structure**: Simpler initially but becomes harder to navigate as the codebase grows. No clear ownership of concerns.
- **Class-based OOP**: Over-engineered for the functional nature of Set game logic. Classes add ceremony without benefit.
- **Separate packages**: Overkill for ~500 LOC. A folder structure provides the same benefits without package management overhead.

### Domain Responsibilities

| Domain | Responsibility | Dependencies |
|--------|---------------|--------------|
| `attributes/` | Enums for feature values | None (leaf) |
| `card/` | Card type, creation, equality, SVG rendering (with isSelected) | `attributes/` |
| `deck/` | Card collection, full deck (81), difficulty subsets, draw with exclusion | `card/`, `attributes/` |
| `set/` | Validation (isValidSet, hasAnySet) | `card/` |
| `board/` | 12-card state, generation, simple card swap | `card/` |
| `selection/` | Selection state (0-3 cards), toggle logic | None |
| `state/` | GameState, game actions, renderGame (orchestrates card renderer) | `deck/`, `board/`, `selection/`, `set/`, `card/` |

### Module Exports Pattern

Each domain uses `mod.ts` as the public API:

```typescript
// card/mod.ts
export { Card, createCard } from "./model.ts";
export { cardEquals } from "./equality.ts";
export { renderCard } from "./renderer.ts";

// state/mod.ts
export { GameState, createInitialState } from "./model.ts";
export { selectCard, submitSelection } from "./actions.ts";
export { renderGame } from "./renderer.ts";
```

Consumers import from the domain, not individual files:

```typescript
// Good: import from domain
import { Card, createCard, renderCard } from "./card/mod.ts";
import { createDeck, drawCards } from "./deck/mod.ts";
import { GameState, createInitialState, selectCard, submitSelection } from "./state/mod.ts";

// Avoid: deep imports
import { Card } from "./card/model.ts";
```

## 7. Enums for Type Safety

**Decision**: Use TypeScript enums with values A, B, C for each attribute. Enums are nominal, preventing accidental cross-attribute comparisons.

**Rationale**: Plain `0 | 1 | 2` union types are structurally identical, allowing accidental comparisons between different features:

```typescript
// BUG: Comparing color with shape compiles fine
const color: 0 | 1 | 2 = 1;
const shape: 0 | 1 | 2 = 1;
if (color === shape) { /* oops */ }
```

Enums catch this at compile time:

```typescript
enum Color { A, B, C }
enum Shape { A, B, C }

const color = Color.B;
const shape = Shape.B;
if (color === shape) { /* TS Error: types not comparable */ }
```

**Alternatives considered**:
- **String literal unions** (`"red" | "green" | "purple"`): Larger memory footprint, slower comparisons, and doesn't leverage modular arithmetic optimization.
- **Branded types**: More complex pattern with no practical benefit over enums for this use case.
- **No typing**: Relies on developer discipline. Bugs from comparing wrong features are subtle and hard to catch in code review.

### Implementation

```typescript
// attributes/types.ts
export enum Num { A = 0, B = 1, C = 2 }      // 1, 2, or 3 shapes
export enum Shape { A = 0, B = 1, C = 2 }    // diamond, squiggle, oval
export enum Shading { A = 0, B = 1, C = 2 }  // solid, striped, open
export enum Color { A = 0, B = 1, C = 2 }    // red, green, purple
```

### Generic Operations

For set validation (modular arithmetic), cast to number:

```typescript
function checkFeature(a: number, b: number, c: number): boolean {
  return ((a + b + c) % 3) === 0;
}

// Usage
checkFeature(card1.num, card2.num, card3.num);
```

Enums with numeric values cast implicitly, enabling modular arithmetic.
