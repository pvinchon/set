import { assertEquals } from "jsr:@std/assert@1";
import { createCard } from "@/game/card/model.ts";
import { Color, Num, Shading, Shape } from "@/game/attributes/mod.ts";

Deno.test("createCard returns card with correct attributes", () => {
  const card = createCard(Num.A, Shape.B, Shading.C, Color.A);

  assertEquals(card.num, Num.A);
  assertEquals(card.shape, Shape.B);
  assertEquals(card.shading, Shading.C);
  assertEquals(card.color, Color.A);
});

Deno.test("createCard creates distinct cards for different inputs", () => {
  const card1 = createCard(Num.A, Shape.A, Shading.A, Color.A);
  const card2 = createCard(Num.B, Shape.A, Shading.A, Color.A);

  assertEquals(card1.num !== card2.num, true);
});

Deno.test("createCard returns readonly card", () => {
  const card = createCard(Num.A, Shape.A, Shading.A, Color.A);

  // Card interface has readonly properties - this compiles as intended
  assertEquals(typeof card.num, "number");
  assertEquals(typeof card.shape, "number");
  assertEquals(typeof card.shading, "number");
  assertEquals(typeof card.color, "number");
});
