# Data Model: Title Screen with Difficulty Selection

**Feature**: 005-title-screen-difficulty
**Date**: 2026-02-20

## Entities

### DifficultyLevel (new)

An enum representing the three difficulty options available to the player.

| Value    | Label    |
| -------- | -------- |
| `Easy`   | "Easy"   |
| `Normal` | "Normal" |
| `Hard`   | "Hard"   |

### DifficultyConfig (new)

A configuration object derived from a `DifficultyLevel`. Determines the game parameters for that difficulty.

| Field         | Type          | Description                                     |
| ------------- | ------------- | ----------------------------------------------- |
| `boardSize`   | `9 \| 12`     | Number of cards on the board                    |
| `deckOptions` | `DeckOptions` | Attribute restrictions passed to `createDeck()` |

#### Difficulty → Config Mapping

| Difficulty | Board Size | Deck Options        | Deck Size | Active Attributes             |
| ---------- | ---------- | ------------------- | --------- | ----------------------------- |
| Easy       | 9          | `{ nums: [Num.A] }` | 27        | shape, shading, color         |
| Normal     | 12         | `{ nums: [Num.A] }` | 27        | shape, shading, color         |
| Hard       | 12         | `{}` (all defaults) | 81        | number, shape, shading, color |

### GameState (extended)

The existing `GameState` gains one new field.

| Field        | Type              | Status   | Description                                 |
| ------------ | ----------------- | -------- | ------------------------------------------- |
| `deck`       | `Deck`            | existing | The card pool for drawing replacements      |
| `board`      | `Board`           | existing | Face-up cards in play                       |
| `selection`  | `Selection`       | existing | Currently selected card indices             |
| `difficulty` | `DifficultyLevel` | **new**  | The active difficulty for this game session |

### Card (unchanged)

The `Card` type always has 4 attributes (`num`, `shape`, `shading`, `color`). For Easy/Normal, all cards share the same num value (`Num.A` = 1 shape) — the attribute is present but constant, so it has no gameplay effect on set validation.

### Board (unchanged structure, dynamic size)

The `Board` type (`{ cards: readonly Card[] }`) is unchanged. The card count is now 9 or 12 depending on difficulty, but the type itself is board-size-agnostic.

### Deck (unchanged)

Created via `createDeck(options)`. For Easy/Normal, `options.nums` is set to `[Num.A]`, producing a 27-card deck. For Hard, no options are passed, producing the full 81-card deck.

## State Transitions

```
[Page Load]
    │
    ▼
┌──────────────┐
│ Title Screen  │  ← Initial state: no game, no board
│ (no GameState)│
└──────┬───────┘
       │ Player selects difficulty
       ▼
┌──────────────┐
│   Playing     │  ← GameState created with chosen difficulty
│  (GameState)  │─── Player finds valid set → cards replaced, board maintained
└──────┬───────┘
       │ Player clicks "back"
       ▼
┌──────────────┐
│ Title Screen  │  ← GameState discarded
│ (no GameState)│
└──────────────┘
```

## Relationships

- `DifficultyLevel` → `DifficultyConfig` (1:1 pure lookup)
- `DifficultyConfig` → `Deck` via `createDeck(config.deckOptions)` (1:1, at game start)
- `DifficultyConfig.boardSize` → `generateInitialState(deck, boardSize)` parameter
- `GameState.difficulty` → referenced for display (e.g., showing current difficulty) but not for logic (logic uses the deck and board, which were already configured at creation time)
