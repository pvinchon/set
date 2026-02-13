import { assert, assertEquals } from "jsr:@std/assert@1";
import { selectCard } from "./actions.ts";
import { generateInitialState } from "./generator.ts";
import { createDeck } from "../deck/mod.ts";
import { hasAnySet, isValidSet } from "../set/mod.ts";
import { createCard } from "../card/mod.ts";
import { Color, Num, Shading, Shape } from "../attributes/mod.ts";
import type { GameState } from "./model.ts";
import type { Board } from "../board/mod.ts";

function createTestState(): GameState {
  const deck = createDeck();
  return generateInitialState(deck);
}

// Helper to create a board with known valid set at indices 0, 1, 2
function createBoardWithKnownSet(): Board {
  return {
    cards: [
      // Valid set at 0, 1, 2 (all different everything)
      createCard(Num.A, Shape.A, Shading.A, Color.A),
      createCard(Num.B, Shape.B, Shading.B, Color.B),
      createCard(Num.C, Shape.C, Shading.C, Color.C),
      // Fill rest with cards that don't form sets with above
      createCard(Num.A, Shape.A, Shading.A, Color.B),
      createCard(Num.A, Shape.A, Shading.B, Color.A),
      createCard(Num.A, Shape.B, Shading.A, Color.A),
      createCard(Num.B, Shape.A, Shading.A, Color.A),
      createCard(Num.A, Shape.A, Shading.B, Color.B),
      createCard(Num.A, Shape.B, Shading.A, Color.B),
      createCard(Num.B, Shape.A, Shading.A, Color.B),
      createCard(Num.A, Shape.B, Shading.B, Color.A),
      createCard(Num.B, Shape.A, Shading.B, Color.A),
    ],
  };
}

Deno.test("selectCard: first selection returns selected state", () => {
  const state = createTestState();
  const result = selectCard(state, 5);

  assertEquals(result.type, "selected");
  assertEquals(result.state.selection.indices, [5]);
});

Deno.test("selectCard: second selection returns selected state", () => {
  const state = createTestState();
  const after1 = selectCard(state, 3).state;
  const result = selectCard(after1, 7);

  assertEquals(result.type, "selected");
  assertEquals(result.state.selection.indices, [3, 7]);
});

Deno.test("selectCard: deselection returns selected state", () => {
  const state = createTestState();
  const after1 = selectCard(state, 3).state;
  const after2 = selectCard(after1, 7).state;
  const result = selectCard(after2, 3); // deselect 3

  assertEquals(result.type, "selected");
  assertEquals(result.state.selection.indices, [7]);
});

Deno.test("selectCard: valid set clears selection and replaces cards", () => {
  const deck = createDeck();
  const board = createBoardWithKnownSet();
  const state: GameState = {
    deck,
    board,
    selection: { indices: [] },
  };

  // Select indices 0, 1, 2 which form a valid set
  const after1 = selectCard(state, 0).state;
  const after2 = selectCard(after1, 1).state;
  const result = selectCard(after2, 2);

  assertEquals(result.type, "valid_set");
  assertEquals(result.state.selection.indices, []);

  // Board should still have 12 cards
  assertEquals(result.state.board.cards.length, 12);

  // Board should still have a valid set (invariant)
  assert(hasAnySet(result.state.board.cards));
});

Deno.test("selectCard: invalid set clears selection", () => {
  const deck = createDeck();
  // Create board with invalid set at 0, 1, 2
  const board: Board = {
    cards: [
      // Invalid set: two same num (A, A, B)
      createCard(Num.A, Shape.A, Shading.A, Color.A),
      createCard(Num.A, Shape.B, Shading.B, Color.B),
      createCard(Num.B, Shape.C, Shading.C, Color.C),
      // Fill rest
      createCard(Num.A, Shape.A, Shading.A, Color.B),
      createCard(Num.A, Shape.A, Shading.B, Color.A),
      createCard(Num.A, Shape.B, Shading.A, Color.A),
      createCard(Num.B, Shape.A, Shading.A, Color.A),
      createCard(Num.A, Shape.A, Shading.B, Color.B),
      createCard(Num.A, Shape.B, Shading.A, Color.B),
      createCard(Num.B, Shape.A, Shading.A, Color.B),
      createCard(Num.B, Shape.B, Shading.B, Color.B), // Same as [1] - adds valid set
      createCard(Num.C, Shape.C, Shading.C, Color.C), // Adds valid set with [10] and another
    ],
  };
  const state: GameState = { deck, board, selection: { indices: [] } };

  // Verify 0, 1, 2 is invalid
  assertEquals(
    isValidSet(board.cards[0], board.cards[1], board.cards[2]),
    false,
  );

  const after1 = selectCard(state, 0).state;
  const after2 = selectCard(after1, 1).state;
  const result = selectCard(after2, 2);

  assertEquals(result.type, "invalid_set");
  assertEquals(result.state.selection.indices, []);

  // Board should be unchanged
  assertEquals(result.state.board, board);
});

Deno.test("selectCard: maintains board invariant after replacement", () => {
  const state = createTestState();

  // Run multiple valid sets and verify invariant holds
  let current = state;
  for (let round = 0; round < 5; round++) {
    // Find a valid set in current board
    const cards = current.board.cards;
    let foundSet = false;

    for (let i = 0; i < 10 && !foundSet; i++) {
      for (let j = i + 1; j < 11 && !foundSet; j++) {
        for (let k = j + 1; k < 12 && !foundSet; k++) {
          if (isValidSet(cards[i], cards[j], cards[k])) {
            // Select this set
            const after1 = selectCard(current, i).state;
            const after2 = selectCard(after1, j).state;
            const result = selectCard(after2, k);

            assertEquals(result.type, "valid_set");
            assert(
              hasAnySet(result.state.board.cards),
              `Round ${round}: board should have valid set after replacement`,
            );

            current = result.state;
            foundSet = true;
          }
        }
      }
    }

    assert(foundSet, `Round ${round}: should find a valid set`);
  }
});
