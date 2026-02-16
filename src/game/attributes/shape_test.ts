import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { renderShape, Shape, shapePath } from "@/game/attributes/shape.ts";

Deno.test("Shape enum has values 0, 1, 2", () => {
  assertEquals(Shape.A, 0);
  assertEquals(Shape.B, 1);
  assertEquals(Shape.C, 2);
});

Deno.test("shapePath returns circle path for Shape.A", () => {
  const path = shapePath(Shape.A, 80, 80);
  assertStringIncludes(path, "A"); // arc command for circle
});

Deno.test("shapePath returns square path for Shape.B", () => {
  const path = shapePath(Shape.B, 80, 80);
  assertStringIncludes(path, "M");
  assertStringIncludes(path, "L");
  assertStringIncludes(path, "Z");
});

Deno.test("shapePath returns triangle path for Shape.C", () => {
  const path = shapePath(Shape.C, 80, 80);
  assertStringIncludes(path, "M");
  assertStringIncludes(path, "L");
  assertStringIncludes(path, "Z");
});

Deno.test("shapePath values are valid SVG paths", () => {
  const pathCommandPattern = /^[MLCZA0-9.\s-]+$/i;

  for (const shape of [Shape.A, Shape.B, Shape.C]) {
    assertEquals(pathCommandPattern.test(shapePath(shape, 100, 100)), true);
  }
});
