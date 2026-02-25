# Data Model: Set Card Game (Single Player)

**Feature**: 003-set-card-game
**Date**: 2026-02-12

## Overview

All game state is in-memory, client-side only. No server, no database, no persistence. The data model uses **branded types** for type-safe feature comparisons and a **domain-driven structure** where each domain owns its types, logic, and rendering.

## Domain: Attributes

Location: `src/game/attributes/`

Attribute values use enums with values A, B, C to prevent mixing different features at compile time.

### Enum Definitions

```typescript
// attributes/types.ts

export enum Num {
	A = 0,
	B = 1,
	C = 2
} // 1, 2, or 3 shapes
export enum Shape {
	A = 0,
	B = 1,
	C = 2
} // diamond, squiggle, oval
export enum Shading {
	A = 0,
	B = 1,
	C = 2
} // solid, striped, open
export enum Color {
	A = 0,
	B = 1,
	C = 2
} // red, green, purple
```

### Type Safety Examples

```typescript
// ✅ SAFE: Same-type comparison
const a = Num.A;
const b = Num.B;
if (a === b) {
	/* compiles */
}

// ❌ COMPILE ERROR: Cross-type comparison prevented
const color = Color.B;
const shape = Shape.B;
if (color === shape) {
	/* TypeScript error! */
}
```

---

## Domain: Card

Location: `src/game/card/`

A card is a composition of four enum attribute values.

### Card Type

```typescript
// card/model.ts

import { Num, Shape, Shading, Color } from '../attributes/mod.ts';

export interface Card {
	readonly num: Num;
	readonly shape: Shape;
	readonly shading: Shading;
	readonly color: Color;
}
```

| Field   | Type    | Description                         |
| ------- | ------- | ----------------------------------- |
| num     | Num     | How many shapes (maps to 1, 2, 3)   |
| shape   | Shape   | Which shape (diamond/squiggle/oval) |
| shading | Shading | Fill style (solid/striped/open)     |
| color   | Color   | Card color (red/green/purple)       |

### Card Creation

```typescript
// card/model.ts (continued)

export function createCard(num: Num, shape: Shape, shading: Shading, color: Color): Card {
	return { num, shape, shading, color };
}
```

### Card Equality

```typescript
// card/equality.ts

import { Card } from './model.ts';

export function cardEquals(a: Card, b: Card): boolean {
	return a.num === b.num && a.shape === b.shape && a.shading === b.shading && a.color === b.color;
}

// For efficient Set/Map operations
export function cardHash(card: Card): number {
	return card.num * 27 + card.shape * 9 + card.shading * 3 + card.color;
}
```

---

## Domain: Deck

Location: `src/game/deck/`

A deck is a collection of cards to draw from. The full deck has all 81 cards; smaller decks reduce difficulty.

### Deck Type

```typescript
// deck/model.ts

import { Card } from '../card/mod.ts';

export interface Deck {
	readonly cards: readonly Card[]; // Available cards to draw from
}
```

### Full Deck (81 cards)

```typescript
// deck/model.ts (continued)

import { createCard } from '../card/mod.ts';
import { Num, Shape, Shading, Color } from '../attributes/mod.ts';

export const FULL_DECK: Deck = {
	cards: (() => {
		const cards: Card[] = [];
		for (const num of [Num.A, Num.B, Num.C]) {
			for (const shape of [Shape.A, Shape.B, Shape.C]) {
				for (const shading of [Shading.A, Shading.B, Shading.C]) {
					for (const color of [Color.A, Color.B, Color.C]) {
						cards.push(createCard(num, shape, shading, color));
					}
				}
			}
		}
		return cards;
	})()
};
```

### Deck Factory (Difficulty Levels)

```typescript
// deck/factory.ts

import { Deck } from './model.ts';
import { Card, createCard } from '../card/mod.ts';
import { Num, Shape, Shading, Color } from '../attributes/mod.ts';

export function createDeck(options?: {
	nums?: readonly Num[]; // Default: all 3
	shapes?: readonly Shape[]; // Default: all 3
	shadings?: readonly Shading[]; // Default: all 3
	colors?: readonly Color[]; // Default: all 3
}): Deck {
	const nums = options?.nums ?? [Num.A, Num.B, Num.C];
	const shapes = options?.shapes ?? [Shape.A, Shape.B, Shape.C];
	const shadings = options?.shadings ?? [Shading.A, Shading.B, Shading.C];
	const colors = options?.colors ?? [Color.A, Color.B, Color.C];

	const cards: Card[] = [];
	for (const num of nums) {
		for (const shape of shapes) {
			for (const shading of shadings) {
				for (const color of colors) {
					cards.push(createCard(num, shape, shading, color));
				}
			}
		}
	}
	return { cards };
}

// Example: Easy deck with 2 colors = 54 cards
// createDeck({ colors: [Color.A, Color.B] })
```

### Deck Draw (Exclusion)

```typescript
// deck/draw.ts

import { Deck } from './model.ts';
import { Card, cardEquals } from '../card/mod.ts';

// Draw N random cards from deck, excluding specified cards
export function drawCards(deck: Deck, count: number, exclude: readonly Card[]): Card[] {
	const available = deck.cards.filter((c) => !exclude.some((e) => cardEquals(c, e)));
	const shuffled = [...available].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}
```

---

## Domain: Set (Validation)

Location: `src/game/set/`

Set validation uses modular arithmetic. Not stored as a type - it's a rule applied to any 3 cards.

### Validation Rule

Three cards form a valid set if and only if, for each of the 4 features, the three values are either all equal OR all distinct.

**Mathematical check** for feature i across cards a, b, c:

```
(a[i] + b[i] + c[i]) % 3 === 0
```

This works because:

- All same (0+0+0=0, 1+1+1=3, 2+2+2=6): sum % 3 === 0
- All different (0+1+2=3): sum % 3 === 0
- Two same + one different (0+0+1=1): sum % 3 !== 0

### Validator

```typescript
// set/validator.ts

import { Card } from '../card/mod.ts';

export function isValidSet(a: Card, b: Card, c: Card): boolean {
	const checkFeature = (x: number, y: number, z: number): boolean => (x + y + z) % 3 === 0;

	return (
		checkFeature(a.num, b.num, c.num) &&
		checkFeature(a.shape, b.shape, c.shape) &&
		checkFeature(a.shading, b.shading, c.shading) &&
		checkFeature(a.color, b.color, c.color)
	);
}

export function hasAnySet(cards: readonly Card[]): boolean {
	const n = cards.length;
	for (let i = 0; i < n - 2; i++) {
		for (let j = i + 1; j < n - 1; j++) {
			for (let k = j + 1; k < n; k++) {
				if (isValidSet(cards[i], cards[j], cards[k])) {
					return true;
				}
			}
		}
	}
	return false;
}
```

---

## Domain: Board

Location: `src/game/board/`

The board holds exactly 12 cards with the invariant that at least one valid set always exists.

### Board Type

```typescript
// board/model.ts

import { Card } from '../card/mod.ts';

export interface Board {
	readonly cards: readonly Card[]; // Always exactly 12 cards
}

// Type guard for board invariant
export function isValidBoard(board: Board): boolean {
	return board.cards.length === 12;
}
```

| Field | Type     | Constraint                       |
| ----- | -------- | -------------------------------- |
| cards | Card[12] | Exactly 12 cards, >= 1 valid set |

### Board Invariant

- The board MUST always contain at least one valid set
- All 12 cards must be distinct (no duplicates)
- Board size is always exactly 12

### Board Generator

```typescript
// board/generator.ts

import { Board } from './model.ts';
import { Card } from '../card/mod.ts';
import { Deck } from '../deck/mod.ts';
import { hasAnySet } from '../set/mod.ts';

export function generateBoard(deck: Deck): Board {
	function tryGenerate(): Card[] {
		const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
		const cards = shuffled.slice(0, 12);

		if (hasAnySet(cards)) {
			return cards;
		}
		return tryGenerate(); // ~96.8% success, rarely recurses
	}

	return { cards: tryGenerate() };
}
```

### Board Replacer

```typescript
// board/replacer.ts

import { Board } from './model.ts';
import { Card } from '../card/mod.ts';

// Simple card replacement - no knowledge of sets or decks
export function replaceCards(
	board: Board,
	selectedIndices: [number, number, number],
	newCards: [Card, Card, Card]
): Board {
	const cards = board.cards.map((card, i) => {
		const idx = selectedIndices.indexOf(i);
		return idx !== -1 ? newCards[idx] : card;
	});
	return { cards };
}
```

---

## Domain: Selection

Location: `src/game/selection/`

Manages the 0-3 card selection state.

### Selection Model

```typescript
// selection/model.ts

export interface Selection {
	readonly indices: readonly number[]; // 0-3 selected card indices
}

export const EMPTY_SELECTION: Selection = { indices: [] };
```

### Selection Actions

```typescript
// selection/actions.ts

import { Selection, EMPTY_SELECTION } from './model.ts';

export function toggleSelection(selection: Selection, index: number): Selection {
	const current = selection.indices;

	if (current.includes(index)) {
		// Deselect
		return { indices: current.filter((i) => i !== index) };
	}

	if (current.length >= 3) {
		// Already 3 selected, ignore
		return selection;
	}

	// Select
	return { indices: [...current, index] };
}

export function clearSelection(): Selection {
	return EMPTY_SELECTION;
}

export function isComplete(selection: Selection): boolean {
	return selection.indices.length === 3;
}
```

---

## Domain: GameState

Location: `src/game/state/`

Captures the full game state: deck, board, and selection.

### GameState Model

```typescript
// state/model.ts

import { Deck } from '../deck/mod.ts';
import { Board } from '../board/mod.ts';
import { Selection, EMPTY_SELECTION } from '../selection/mod.ts';

export interface GameState {
	readonly deck: Deck;
	readonly board: Board;
	readonly selection: Selection;
}

export function createInitialState(deck: Deck): GameState {
	// Generate board with set invariant
	const board = generateBoardWithSet(deck);
	return {
		deck,
		board,
		selection: EMPTY_SELECTION
	};
}
```

### GameState Actions

```typescript
// state/actions.ts

import { GameState } from './model.ts';
import { toggleSelection, isComplete, EMPTY_SELECTION } from '../selection/mod.ts';
import { isValidSet, hasAnySet } from '../set/mod.ts';
import { drawCards } from '../deck/mod.ts';
import { replaceCards } from '../board/mod.ts';

export function selectCard(state: GameState, index: number): GameState {
	const selection = toggleSelection(state.selection, index);
	return { ...state, selection };
}

export function submitSelection(state: GameState): GameState {
	if (!isComplete(state.selection)) {
		return state;
	}

	const [i, j, k] = state.selection.indices;
	const cards = state.board.cards;

	if (!isValidSet(cards[i], cards[j], cards[k])) {
		// Invalid set - clear selection
		return { ...state, selection: EMPTY_SELECTION };
	}

	// Valid set - replace cards with recursion for set invariant
	const remaining = cards.filter((_, idx) => ![i, j, k].includes(idx));

	function tryReplacement(): GameState {
		const newCards = drawCards(state.deck, 3, remaining);
		const newBoard = replaceCards(state.board, [i, j, k], [newCards[0], newCards[1], newCards[2]]);

		if (hasAnySet(newBoard.cards)) {
			return { ...state, board: newBoard, selection: EMPTY_SELECTION };
		}
		return tryReplacement(); // ~96.8% success rate
	}

	return tryReplacement();
}
```

---

## State Transitions

### Game Start

1. Call `createInitialState(deck)` → GameState with deck, board, empty selection
2. Board guaranteed to contain at least one valid set

### Card Selection

1. Player clicks card at index `i`
2. Call `selectCard(state, i)` → new GameState with updated selection
3. When 3 cards selected, call `submitSelection(state)`:
   - If valid set: replace cards, clear selection, ensure new board has set
   - If invalid: clear selection only

### New Game

1. Refresh page (or call `createInitialState(deck)`)
2. All state resets

---

## Relationships

```
GameState ────contains────> Deck
GameState ────contains────> Board
GameState ────contains────> Selection
Deck (1) ────contains────> (27-81) Card
Deck     ────draws────> Card[] (with exclusion)
Board (1) ────contains────> (12) Card
Card  (1) ────uses────> (4) Attribute Values
     │                        │
     │                        ├── Num
     │                        ├── Shape
     │                        ├── Shading
     │                        └── Color
     │
Selection (1) ────references────> (0-3) Card indices
Set Validation ────evaluates────> (3) Cards
```
