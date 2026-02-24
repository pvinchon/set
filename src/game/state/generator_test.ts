import { assert, assertEquals } from "jsr:@std/assert@1";
import { generateInitialState } from "@/game/state/generator.ts";
import { createDeck } from "@/game/deck/mod.ts";
import { hasAnySet } from "@/game/set/mod.ts";
import { cardEquals } from "@/game/card/mod.ts";
import { EMPTY_SELECTION } from "@/game/selection/mod.ts";
import { DifficultyLevel } from "@/game/difficulty/mod.ts";
import { Num } from "@/game/attributes/mod.ts";

Deno.test("generateInitialState returns 12 cards on board", () => {
  const deck = createDeck();
  const state = generateInitialState(deck);

  assertEquals(state.board.cards.length, 12);
});

Deno.test("generateInitialState returns 9 cards when boardSize is 9", () => {
  const deck = createDeck({ nums: [Num.A] });
  const state = generateInitialState(deck, 9, DifficultyLevel.Easy);

  assertEquals(state.board.cards.length, 9);
});

Deno.test("generateInitialState returns 12 cards when boardSize is 12 with restricted deck", () => {
  const deck = createDeck({ nums: [Num.A] });
  const state = generateInitialState(deck, 12, DifficultyLevel.Normal);

  assertEquals(state.board.cards.length, 12);
});

Deno.test("generateInitialState stores difficulty in state", () => {
  const deck = createDeck();
  const state = generateInitialState(deck, 12, DifficultyLevel.Hard);

  assertEquals(state.difficulty, DifficultyLevel.Hard);
});

Deno.test("generateInitialState defaults to Hard difficulty", () => {
  const deck = createDeck();
  const state = generateInitialState(deck);

  assertEquals(state.difficulty, DifficultyLevel.Hard);
});

Deno.test("generateInitialState returns distinct cards", () => {
  const deck = createDeck();
  const state = generateInitialState(deck);

  for (let i = 0; i < state.board.cards.length; i++) {
    for (let j = i + 1; j < state.board.cards.length; j++) {
      assertEquals(
        cardEquals(state.board.cards[i], state.board.cards[j]),
        false,
      );
    }
  }
});

Deno.test("generateInitialState always contains a valid set", () => {
  const deck = createDeck();

  // Run multiple times to verify invariant
  for (let i = 0; i < 20; i++) {
    const state = generateInitialState(deck);
    assert(
      hasAnySet(state.board.cards),
      `State ${i} board should contain a valid set`,
    );
  }
});

Deno.test("generateInitialState returns empty selection", () => {
  const deck = createDeck();
  const state = generateInitialState(deck);

  assertEquals(state.selection, EMPTY_SELECTION);
});

Deno.test("generateInitialState preserves deck reference", () => {
  const deck = createDeck();
  const state = generateInitialState(deck);

  assertEquals(state.deck, deck);
});

Deno.test("generateInitialState produces different boards", () => {
  const deck = createDeck();

  // Generate multiple states and check for variety
  const boards: string[] = [];
  for (let i = 0; i < 5; i++) {
    const state = generateInitialState(deck);
    const sig = state.board.cards
      .map((c) => `${c.num}${c.shape}${c.shading}${c.color}`)
      .sort()
      .join(",");
    boards.push(sig);
  }

  const unique = new Set(boards);
  assert(
    unique.size > 1,
    "generateInitialState should produce different boards",
  );
});
