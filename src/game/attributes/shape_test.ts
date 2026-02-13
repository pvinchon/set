import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { Shape, SHAPE_PATH } from "./shape.ts";

Deno.test("Shape enum has values 0, 1, 2", () => {
  assertEquals(Shape.A, 0);
  assertEquals(Shape.B, 1);
  assertEquals(Shape.C, 2);
});

Deno.test("SHAPE_PATH has entry for Shape.A (triangle)", () => {
  assertStringIncludes(SHAPE_PATH[Shape.A], "M");
  assertStringIncludes(SHAPE_PATH[Shape.A], "L");
  assertStringIncludes(SHAPE_PATH[Shape.A], "Z");
});

Deno.test("SHAPE_PATH has entry for Shape.B (square)", () => {
  assertStringIncludes(SHAPE_PATH[Shape.B], "M");
  assertStringIncludes(SHAPE_PATH[Shape.B], "L");
  assertStringIncludes(SHAPE_PATH[Shape.B], "Z");
});

Deno.test("SHAPE_PATH has entry for Shape.C (circle)", () => {
  assertStringIncludes(SHAPE_PATH[Shape.C], "A"); // arc command
});

Deno.test("SHAPE_PATH values are valid SVG paths", () => {
  const pathCommandPattern = /^[MLCZA0-9.\s]+$/i;

  for (const shape of [Shape.A, Shape.B, Shape.C]) {
    assertEquals(pathCommandPattern.test(SHAPE_PATH[shape]), true);
  }
});
