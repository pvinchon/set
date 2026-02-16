import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { renderShading, Shading } from "@/game/attributes/shading.ts";

Deno.test("Shading enum has values 0, 1, 2", () => {
  assertEquals(Shading.A, 0);
  assertEquals(Shading.B, 1);
  assertEquals(Shading.C, 2);
});

const TEST_COLOR = "#ff0000";
const TEST_PATTERN_ID = "test-stripe";

Deno.test("getShadingStyle for solid returns color fill", () => {
  const style = getShadingStyle(Shading.A, TEST_COLOR, TEST_PATTERN_ID);

  assertEquals(style.fill, TEST_COLOR);
  assertEquals(style.stroke, TEST_COLOR);
  assertEquals(style.defs, undefined);
});

Deno.test("getShadingStyle for striped returns pattern fill", () => {
  const style = getShadingStyle(Shading.B, TEST_COLOR, TEST_PATTERN_ID);

  assertEquals(style.fill, `url(#${TEST_PATTERN_ID})`);
  assertEquals(style.stroke, TEST_COLOR);
  assertStringIncludes(style.defs!, `id="${TEST_PATTERN_ID}"`);
  assertStringIncludes(style.defs!, "pattern");
});

Deno.test("getShadingStyle for open returns no fill", () => {
  const style = getShadingStyle(Shading.C, TEST_COLOR, TEST_PATTERN_ID);

  assertEquals(style.fill, "none");
  assertEquals(style.stroke, TEST_COLOR);
  assertEquals(style.defs, undefined);
});

Deno.test("getShadingStyle striped pattern uses correct color", () => {
  const color = "#00ff00";
  const style = getShadingStyle(Shading.B, color, "my-pattern");

  assertStringIncludes(style.defs!, `stroke="${color}"`);
});
