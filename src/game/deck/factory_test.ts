import { assertEquals, assertThrows } from "jsr:@std/assert@1";
import { createDeck } from "@/game/deck/factory.ts";
import { Color, Num, Shading, Shape } from "@/game/attributes/mod.ts";
import { cardEquals } from "@/game/card/mod.ts";

Deno.test("createDeck with no options produces 81 unique cards", () => {
  const deck = createDeck();

  assertEquals(deck.cards.length, 81);

  // Check uniqueness by comparing all pairs
  for (let i = 0; i < deck.cards.length; i++) {
    for (let j = i + 1; j < deck.cards.length; j++) {
      assertEquals(cardEquals(deck.cards[i], deck.cards[j]), false);
    }
  }
});

Deno.test("createDeck with single num produces 27 cards", () => {
  const deck = createDeck({ nums: [Num.A] });

  // 1 num × 3 shapes × 3 shadings × 3 colors = 27
  assertEquals(deck.cards.length, 27);

  for (const card of deck.cards) {
    assertEquals(card.num, Num.A);
  }
});

Deno.test("createDeck with single shape produces 27 cards", () => {
  const deck = createDeck({ shapes: [Shape.B] });

  // 3 nums × 1 shape × 3 shadings × 3 colors = 27
  assertEquals(deck.cards.length, 27);

  for (const card of deck.cards) {
    assertEquals(card.shape, Shape.B);
  }
});

Deno.test("createDeck with multiple single restrictions produces correct count", () => {
  const deck = createDeck({
    nums: [Num.A],
    shapes: [Shape.A],
    shadings: [Shading.A],
    colors: [Color.A],
  });

  // 1 × 1 × 1 × 1 = 1
  assertEquals(deck.cards.length, 1);
  assertEquals(deck.cards[0].num, Num.A);
  assertEquals(deck.cards[0].shape, Shape.A);
  assertEquals(deck.cards[0].shading, Shading.A);
  assertEquals(deck.cards[0].color, Color.A);
});

Deno.test("createDeck throws for 2 attribute values", () => {
  assertThrows(
    () => createDeck({ nums: [Num.A, Num.B] }),
    Error,
    "1 or 3 values",
  );
});

Deno.test("createDeck throws for mixed invalid counts", () => {
  assertThrows(
    () =>
      createDeck({
        nums: [Num.A, Num.B], // invalid: 2
        shapes: [Shape.A], // valid: 1
      }),
    Error,
    "1 or 3 values",
  );
});

Deno.test("createDeck with all three values works", () => {
  const deck = createDeck({
    nums: [Num.A, Num.B, Num.C],
    shapes: [Shape.A, Shape.B, Shape.C],
    shadings: [Shading.A, Shading.B, Shading.C],
    colors: [Color.A, Color.B, Color.C],
  });

  assertEquals(deck.cards.length, 81);
});
