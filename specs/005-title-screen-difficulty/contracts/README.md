# Contracts: Title Screen with Difficulty Selection

**Feature**: 005-title-screen-difficulty
**Date**: 2026-02-20

This feature has no external API (no server, no HTTP endpoints, no WebSocket). All contracts are internal TypeScript module interfaces.

## Module Contracts

### `difficulty/mod.ts` — Public API

```typescript
/** The three difficulty levels available to the player. */
enum DifficultyLevel {
	Easy = 'easy',
	Normal = 'normal',
	Hard = 'hard'
}

/** Game configuration derived from a difficulty level. */
interface DifficultyConfig {
	readonly boardSize: number; // 9 or 12
	readonly deckOptions: DeckOptions;
}

/** Returns the game configuration for a given difficulty level. */
function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig;
```

### `state/generator.ts` — Extended Signature

```typescript
/** Generates the initial game state. boardSize defaults to 12 if omitted. */
function generateInitialState(deck: Deck, boardSize?: number): GameState;
```

### `state/model.ts` — Extended Type

```typescript
interface GameState {
	readonly deck: Deck;
	readonly board: Board;
	readonly selection: Selection;
	readonly difficulty: DifficultyLevel; // NEW
}
```

### `main.ts` — Screen Lifecycle

```typescript
/** Initialize the title screen. Called on DOMContentLoaded. */
function initTitleScreen(
	titleContainer: HTMLElement,
	gameContainer: HTMLElement,
	boardContainer: HTMLElement
): void;

/** Initialize and start a game with the given difficulty. */
function initGame(container: HTMLElement, difficulty: DifficultyLevel): void;
```

## HTML Contract (index.vto)

```html
<!-- Title screen: visible on load -->
<div id="title-screen">
	<h1>Set</h1>
	<button data-difficulty="easy">Easy</button>
	<button data-difficulty="normal">Normal</button>
	<button data-difficulty="hard">Hard</button>
</div>

<!-- Game screen: hidden on load -->
<div id="game-screen" class="hidden">
	<button id="back-to-title">← Set</button>
	<div id="game-board"></div>
</div>
```

Element IDs and `data-difficulty` attributes form the contract between HTML and JS.

### Difficulty Config Values

| Difficulty | `boardSize` | `deckOptions`       |
| ---------- | ----------- | ------------------- |
| Easy       | 9           | `{ nums: [Num.A] }` |
| Normal     | 12          | `{ nums: [Num.A] }` |
| Hard       | 12          | `{}`                |
