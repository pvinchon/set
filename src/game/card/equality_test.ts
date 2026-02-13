import { assertEquals } from "jsr:@std/assert@1";
import { cardEquals } from "./equality.ts";
import { createCard } from "./model.ts";
import { Color, Num, Shading, Shape } from "../attributes/mod.ts";

Deno.test("cardEquals returns true for identical cards", () => {
  const card1 = createCard(Num.A, Shape.B, Shading.C, Color.A);
  const card2 = createCard(Num.A, Shape.B, Shading.C, Color.A);

  assertEquals(cardEquals(card1, card2), true);
});

Deno.test("cardEquals returns false when num differs", () => {
  const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
  const card2 = createCard(Num.B, Shape.A, Shading.A, Color.A);

  assertEquals(cardEquals(card1, card2), false);
});

Deno.test("cardEquals returns false when shape differs", () => {
  const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
  const card2 = createCard(Num.A, Shape.B, Shading.A, Color.A);

  assertEquals(cardEquals(card1, card2), false);
});

Deno.test("cardEquals returns false when shading differs", () => {
  const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
  const card2 = createCard(Num.A, Shape.A, Shading.B, Color.A);

  assertEquals(cardEquals(card1, card2), false);
});

Deno.test("cardEquals returns false when color differs", () => {
  const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
  const card2 = createCard(Num.A, Shape.A, Shading.A, Color.B);

  assertEquals(cardEquals(card1, card2), false);
});
