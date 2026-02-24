import { assertEquals } from "jsr:@std/assert@1";
import { DifficultyLevel, getDifficultyConfig } from "@/game/difficulty/mod.ts";
import { Num } from "@/game/attributes/mod.ts";

Deno.test("Easy config has boardSize 9 and nums fixed to Num.A", () => {
  const config = getDifficultyConfig(DifficultyLevel.Easy);
  assertEquals(config.boardSize, 9);
  assertEquals(config.deckOptions.nums, [Num.A]);
});

Deno.test("Normal config has boardSize 12 and nums fixed to Num.A", () => {
  const config = getDifficultyConfig(DifficultyLevel.Normal);
  assertEquals(config.boardSize, 12);
  assertEquals(config.deckOptions.nums, [Num.A]);
});

Deno.test("Hard config has boardSize 12 and no attribute restrictions", () => {
  const config = getDifficultyConfig(DifficultyLevel.Hard);
  assertEquals(config.boardSize, 12);
  assertEquals(config.deckOptions, {});
});

Deno.test("all DifficultyLevel values have a config", () => {
  for (const level of Object.values(DifficultyLevel)) {
    const config = getDifficultyConfig(level);
    assertEquals(typeof config.boardSize, "number");
  }
});
