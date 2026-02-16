import { assertEquals } from "jsr:@std/assert@1";
import { Color, COLOR_HEX, renderColor } from "@/game/attributes/color.ts";

Deno.test("Color enum has values 0, 1, 2", () => {
  assertEquals(Color.A, 0);
  assertEquals(Color.B, 1);
  assertEquals(Color.C, 2);
});

Deno.test("COLOR_HEX has entry for Color.A (red)", () => {
  assertEquals(COLOR_HEX[Color.A], "#ff0000");
});

Deno.test("COLOR_HEX has entry for Color.B (green)", () => {
  assertEquals(COLOR_HEX[Color.B], "#00ff00");
});

Deno.test("COLOR_HEX has entry for Color.C (blue)", () => {
  assertEquals(COLOR_HEX[Color.C], "#0000ff");
});

Deno.test("COLOR_HEX values are valid hex colors", () => {
  const hexPattern = /^#[0-9a-fA-F]{6}$/;

  for (const color of [Color.A, Color.B, Color.C]) {
    assertEquals(hexPattern.test(COLOR_HEX[color]), true);
  }
});
