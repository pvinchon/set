# Contracts: Set Card Game (Single Player)

**Feature**: 003-set-card-game
**Date**: 2026-02-12

## Overview

This feature has no server-side API, no REST endpoints, and no external contracts. The game is entirely client-side. This document defines the **internal module contracts** for each domain.

## Domain: Attributes

Location: `src/game/attributes/`

### Types (`types.ts`)

```typescript
// Enums for type-safe feature comparisons
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

### Module Export (`mod.ts`)

```typescript
export { Num, Shape, Shading, Color } from './types.ts';
```

---

## Domain: Card

Location: `src/game/card/`

### Model (`model.ts`)

```typescript
import { Num, Shape, Shading, Color } from '../attributes/mod.ts';

export interface Card {
	readonly num: Num;
	readonly shape: Shape;
	readonly shading: Shading;
	readonly color: Color;
}

export function createCard(num: Num, shape: Shape, shading: Shading, color: Color): Card;
```

### Equality (`equality.ts`)

```typescript
import { Card } from './model.ts';

export function cardEquals(a: Card, b: Card): boolean;
export function cardHash(card: Card): number; // For Set/Map keying
```

### Renderer (`renderer.ts`)

```typescript
import { Card } from './model.ts';

export function renderCard(card: Card, index: number, isSelected: boolean): HTMLElement;
```

### Module Export (`mod.ts`)

```typescript
export { Card, createCard } from './model.ts';
export { cardEquals, cardHash } from './equality.ts';
export { renderCard } from './renderer.ts';
```

---

## Domain: Deck

Location: `src/game/deck/`

### Model (`model.ts`)

```typescript
import { Card } from '../card/mod.ts';

export interface Deck {
	readonly cards: readonly Card[]; // Available cards to draw from
}
```

### Factory (`factory.ts`)

```typescript
import { Deck } from './model.ts';

// Create decks with subsets for reduced difficulty
export function createDeck(options?: {
	nums?: readonly (0 | 1 | 2)[]; // Default: all 3
	shapes?: readonly (0 | 1 | 2)[]; // Default: all 3
	shadings?: readonly (0 | 1 | 2)[]; // Default: all 3
	colors?: readonly (0 | 1 | 2)[]; // Default: all 3
}): Deck;
```

### Draw (`draw.ts`)

```typescript
import { Deck } from './model.ts';
import { Card } from '../card/mod.ts';

// Draw N random cards from deck, excluding specified cards
export function drawCards(deck: Deck, count: number, exclude: readonly Card[]): Card[];
```

### Module Export (`mod.ts`)

```typescript
export { Deck } from './model.ts';
export { createDeck } from './factory.ts';
export { drawCards } from './draw.ts';
```

---

## Domain: Set

Location: `src/game/set/`

### Validator (`validator.ts`)

```typescript
import { Card } from '../card/mod.ts';

export function isValidSet(a: Card, b: Card, c: Card): boolean;
export function hasAnySet(cards: readonly Card[]): boolean;
```

### Module Export (`mod.ts`)

```typescript
export { isValidSet, hasAnySet } from './validator.ts';
```

---

## Domain: Board

Location: `src/game/board/`

### Model (`model.ts`)

```typescript
import { Card } from '../card/mod.ts';

export interface Board {
	readonly cards: readonly Card[]; // Exactly 12 cards
}

export function isValidBoard(board: Board): boolean;
```

### Generator (`generator.ts`)

```typescript
import { Board } from './model.ts';
import { Deck } from '../deck/mod.ts';

export function generateBoard(deck: Deck): Board; // 12 cards with >= 1 valid set
```

### Replacer (`replacer.ts`)

```typescript
import { Board } from './model.ts';
import { Card } from '../card/mod.ts';

// Simple card replacement - no knowledge of sets or decks
export function replaceCards(
	board: Board,
	selectedIndices: [number, number, number],
	newCards: [Card, Card, Card]
): Board;
```

### Module Export (`mod.ts`)

```typescript
export { Board, isValidBoard } from './model.ts';
export { generateBoard } from './generator.ts';
export { replaceCards } from './replacer.ts';
```

---

## Domain: Selection

Location: `src/game/selection/`

### Model (`model.ts`)

```typescript
export interface Selection {
	readonly indices: readonly number[]; // 0-3 card indices
}

export const EMPTY_SELECTION: Selection;
```

### Actions (`actions.ts`)

```typescript
import { Selection } from './model.ts';

export function toggleSelection(selection: Selection, index: number): Selection;
export function clearSelection(): Selection;
export function isComplete(selection: Selection): boolean; // true when 3 selected
```

### Module Export (`mod.ts`)

```typescript
export { Selection, EMPTY_SELECTION } from './model.ts';
export { toggleSelection, clearSelection, isComplete } from './actions.ts';
```

---

## Domain: GameState

Location: `src/game/state/`

### Model (`model.ts`)

```typescript
import { Deck } from '../deck/mod.ts';
import { Board } from '../board/mod.ts';
import { Selection } from '../selection/mod.ts';

export interface GameState {
	readonly deck: Deck;
	readonly board: Board;
	readonly selection: Selection;
}

export function createInitialState(deck: Deck): GameState;
```

### Actions (`actions.ts`)

```typescript
import { GameState } from './model.ts';

export function selectCard(state: GameState, index: number): GameState;
export function submitSelection(state: GameState): GameState; // Validates set, replaces cards if valid
```

### Module Export (`mod.ts`)

```typescript
export { GameState, createInitialState } from './model.ts';
export { selectCard, submitSelection } from './actions.ts';
export { renderGame } from './renderer.ts';
```

### Renderer (`renderer.ts`)

```typescript
import { GameState } from './model.ts';
import { renderCard } from '../card/mod.ts';

// Orchestrates rendering, calls card renderer with only needed data
export function renderGame(
	state: GameState,
	container: HTMLElement,
	onCardClick: (index: number) => void
): void;
```

---

## Entry Point

Location: `src/game/main.ts`

```typescript
// Wires all domains together
// Initializes game state
// Sets up event listeners
// Entry point loaded by HTML

export function initGame(container: HTMLElement): void;
```

---

## No External Contracts

- No HTTP APIs
- No WebSocket connections
- No localStorage/IndexedDB schemas
- No inter-page communication
- All state is in-memory, session-only
