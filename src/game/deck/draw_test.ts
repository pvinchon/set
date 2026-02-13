import { assert, assertEquals } from "jsr:@std/assert@1";
import { createDeck } from "./factory.ts";
import { drawCards } from "./draw.ts";
import { cardEquals, createCard } from "../card/mod.ts";
import { Color, Num, Shading, Shape } from "../attributes/mod.ts";

Deno.test("drawCards returns requested number of cards", () => {
  const deck = createDeck();
  const drawn = drawCards(deck, 12, []);

  assertEquals(drawn.length, 12);
});

Deno.test("drawCards returns distinct cards", () => {
  const deck = createDeck();
  const drawn = drawCards(deck, 12, []);

  // Check no duplicates
  for (let i = 0; i < drawn.length; i++) {
    for (let j = i + 1; j < drawn.length; j++) {
      assertEquals(cardEquals(drawn[i], drawn[j]), false);
    }
  }
});

Deno.test("drawCards excludes specified cards", () => {
  const deck = createDeck();
  const excluded = [
    createCard(Num.A, Shape.A, Shading.A, Color.A),
    createCard(Num.B, Shape.B, Shading.B, Color.B),
  ];

  const drawn = drawCards(deck, 10, excluded);

  for (const card of drawn) {
    for (const exc of excluded) {
      assertEquals(cardEquals(card, exc), false);
    }
  }
});

Deno.test("drawCards respects deck constraints", () => {
  const deck = createDeck({ nums: [Num.A] });
  const drawn = drawCards(deck, 5, []);

  for (const card of drawn) {
    assertEquals(card.num, Num.A);
  }
});

Deno.test("drawCards returns fewer cards when deck is limited", () => {
  const deck = createDeck({
    nums: [Num.A],
    shapes: [Shape.A],
    shadings: [Shading.A],
    colors: [Color.A],
  });

  // Only 1 card in deck
  const drawn = drawCards(deck, 12, []);

  assertEquals(drawn.length, 1);
});

Deno.test("drawCards with all excluded returns empty", () => {
  const deck = createDeck({
    nums: [Num.A],
    shapes: [Shape.A],
    shadings: [Shading.A],
    colors: [Color.A],
  });

  const excluded = [createCard(Num.A, Shape.A, Shading.A, Color.A)];

  const drawn = drawCards(deck, 5, excluded);
  assertEquals(drawn.length, 0);
});

Deno.test("drawCards produces shuffled results", () => {
  const deck = createDeck();

  // Draw multiple times and check that results vary
  const draws: string[] = [];
  for (let i = 0; i < 5; i++) {
    const drawn = drawCards(deck, 5, []);
    draws.push(
      drawn.map((c) => `${c.num}${c.shape}${c.shading}${c.color}`).join(","),
    );
  }

  // At least some draws should differ (statistically very likely with shuffle)
  const uniqueDraws = new Set(draws);
  assert(uniqueDraws.size > 1, "drawCards should shuffle results");
});
