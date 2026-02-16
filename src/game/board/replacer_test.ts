import { assertEquals } from "jsr:@std/assert@1";
import { replaceCards } from "@/game/board/replacer.ts";
import { createCard } from "@/game/card/mod.ts";
import { Color, Num, Shading, Shape } from "@/game/attributes/mod.ts";
import type { Board } from "@/game/board/model.ts";

Deno.test("replaceCards swaps cards at specified indices", () => {
  const original: Board = {
    cards: [
      createCard(Num.A, Shape.A, Shading.A, Color.A), // 0
      createCard(Num.A, Shape.A, Shading.A, Color.B), // 1
      createCard(Num.A, Shape.A, Shading.A, Color.C), // 2
      createCard(Num.A, Shape.A, Shading.B, Color.A), // 3
    ],
  };

  const newCards: [
    typeof original.cards[0],
    typeof original.cards[0],
    typeof original.cards[0],
  ] = [
    createCard(Num.C, Shape.C, Shading.C, Color.A),
    createCard(Num.C, Shape.C, Shading.C, Color.B),
    createCard(Num.C, Shape.C, Shading.C, Color.C),
  ];

  const result = replaceCards(original, [0, 1, 2], newCards);

  // Indices 0, 1, 2 should be replaced
  assertEquals(result.cards[0], newCards[0]);
  assertEquals(result.cards[1], newCards[1]);
  assertEquals(result.cards[2], newCards[2]);

  // Index 3 should be unchanged
  assertEquals(result.cards[3], original.cards[3]);
});

Deno.test("replaceCards handles non-contiguous indices", () => {
  const original: Board = {
    cards: [
      createCard(Num.A, Shape.A, Shading.A, Color.A), // 0 - replace
      createCard(Num.A, Shape.A, Shading.A, Color.B), // 1 - keep
      createCard(Num.A, Shape.A, Shading.A, Color.C), // 2 - replace
      createCard(Num.A, Shape.A, Shading.B, Color.A), // 3 - keep
      createCard(Num.A, Shape.A, Shading.B, Color.B), // 4 - replace
    ],
  };

  const newCards: [
    typeof original.cards[0],
    typeof original.cards[0],
    typeof original.cards[0],
  ] = [
    createCard(Num.B, Shape.B, Shading.B, Color.B),
    createCard(Num.C, Shape.C, Shading.C, Color.C),
    createCard(Num.A, Shape.B, Shading.C, Color.A),
  ];

  const result = replaceCards(original, [0, 2, 4], newCards);

  assertEquals(result.cards[0], newCards[0]);
  assertEquals(result.cards[1], original.cards[1]); // unchanged
  assertEquals(result.cards[2], newCards[1]);
  assertEquals(result.cards[3], original.cards[3]); // unchanged
  assertEquals(result.cards[4], newCards[2]);
});

Deno.test("replaceCards preserves board length", () => {
  const original: Board = {
    cards: Array.from({ length: 12 }, (_, i) =>
      createCard(
        (i % 3) as Num,
        Math.floor(i / 3) % 3 as Shape,
        Math.floor(i / 9) % 3 as Shading,
        Color.A,
      )),
  };

  const newCards: [
    typeof original.cards[0],
    typeof original.cards[0],
    typeof original.cards[0],
  ] = [
    createCard(Num.C, Shape.C, Shading.C, Color.C),
    createCard(Num.B, Shape.B, Shading.B, Color.B),
    createCard(Num.A, Shape.A, Shading.A, Color.A),
  ];

  const result = replaceCards(original, [3, 7, 11], newCards);

  assertEquals(result.cards.length, 12);
});

Deno.test("replaceCards does not mutate original board", () => {
  const originalCards = [
    createCard(Num.A, Shape.A, Shading.A, Color.A),
    createCard(Num.A, Shape.A, Shading.A, Color.B),
    createCard(Num.A, Shape.A, Shading.A, Color.C),
    createCard(Num.A, Shape.A, Shading.B, Color.A),
  ];
  const original: Board = { cards: [...originalCards] };

  const newCards: [
    typeof original.cards[0],
    typeof original.cards[0],
    typeof original.cards[0],
  ] = [
    createCard(Num.C, Shape.C, Shading.C, Color.A),
    createCard(Num.C, Shape.C, Shading.C, Color.B),
    createCard(Num.C, Shape.C, Shading.C, Color.C),
  ];

  replaceCards(original, [0, 1, 2], newCards);

  // Original should be unchanged
  assertEquals(original.cards[0], originalCards[0]);
  assertEquals(original.cards[1], originalCards[1]);
  assertEquals(original.cards[2], originalCards[2]);
});
