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

// renderShape tests

function createMockSVG(): {
  children: {
    setAttribute: (name: string, value: string) => void;
    style: Record<string, string>;
    tagName: string;
    d?: string;
  }[];
  appendChild: (child: unknown) => void;
  attributes: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
} {
  const svg: ReturnType<typeof createMockSVG> = {
    children: [],
    appendChild(child: unknown) {
      svg.children.push(child as typeof svg.children[0]);
    },
    attributes: {},
    setAttribute(name: string, value: string) {
      svg.attributes[name] = value;
    },
  };
  return svg;
}

function createMockPath(): {
  attributes: Record<string, string>;
  style: Record<string, string>;
  setAttribute: (name: string, value: string) => void;
} {
  const path: ReturnType<typeof createMockPath> = {
    attributes: {},
    style: {},
    setAttribute(name: string, value: string) {
      path.attributes[name] = value;
    },
  };
  return path;
}

Deno.test("renderShape appends a child to each SVG", () => {
  const mockPath = createMockPath();
  const originalCreateElementNS = globalThis.document?.createElementNS;
  // deno-lint-ignore no-explicit-any
  (globalThis as any).document = {
    createElementNS(_ns: string, _tag: string) {
      return mockPath;
    },
  };

  try {
    const mock = createMockSVG();
    const result = renderShape(Shape.A, [mock as unknown as SVGSVGElement]);

    assertEquals(result.length, 1);
    assertEquals(mock.children.length, 1);
    assertStringIncludes(mockPath.attributes["d"], "A");
    assertStringIncludes(
      mockPath.attributes["class"],
      "fill-[var(--attribute-fill)]",
    );
    assertStringIncludes(
      mockPath.attributes["class"],
      "stroke-[var(--attribute-color)]",
    );
    assertStringIncludes(mockPath.attributes["stroke-width"], "4px");
  } finally {
    if (originalCreateElementNS) {
      // deno-lint-ignore no-explicit-any
      (globalThis as any).document.createElementNS = originalCreateElementNS;
    } else {
      // deno-lint-ignore no-explicit-any
      delete (globalThis as any).document;
    }
  }
});

Deno.test("renderShape applies to all SVGs in array", () => {
  const paths: ReturnType<typeof createMockPath>[] = [];
  // deno-lint-ignore no-explicit-any
  (globalThis as any).document = {
    createElementNS(_ns: string, _tag: string) {
      const p = createMockPath();
      paths.push(p);
      return p;
    },
  };

  try {
    const mock1 = createMockSVG();
    const mock2 = createMockSVG();
    renderShape(Shape.B, [
      mock1 as unknown as SVGSVGElement,
      mock2 as unknown as SVGSVGElement,
    ]);

    assertEquals(mock1.children.length, 1);
    assertEquals(mock2.children.length, 1);
    assertEquals(paths.length, 2);
  } finally {
    // deno-lint-ignore no-explicit-any
    delete (globalThis as any).document;
  }
});
