import { assertEquals } from "jsr:@std/assert@1";
import { Num, renderNum } from "@/game/attributes/num.ts";

Deno.test("Num enum has values 0, 1, 2", () => {
  assertEquals(Num.A, 0);
  assertEquals(Num.B, 1);
  assertEquals(Num.C, 2);
});

Deno.test("Num values enable modular arithmetic", () => {
  // All same: sum divisible by 3
  assertEquals((Num.A + Num.A + Num.A) % 3, 0);
  assertEquals((Num.B + Num.B + Num.B) % 3, 0);
  assertEquals((Num.C + Num.C + Num.C) % 3, 0);

  // All different: sum divisible by 3
  assertEquals((Num.A + Num.B + Num.C) % 3, 0);

  // Two same + one different: sum NOT divisible by 3
  assertEquals((Num.A + Num.A + Num.B) % 3 !== 0, true);
  assertEquals((Num.B + Num.B + Num.A) % 3 !== 0, true);
});

// renderNum tests

function createMockSVG(): {
  cloneNode: (deep: boolean) => ReturnType<typeof createMockSVG>;
  querySelectorAll: (selector: string) => never[];
} {
  return {
    cloneNode(_deep: boolean) {
      return createMockSVG();
    },
    querySelectorAll(_selector: string) {
      return [];
    },
  };
}

Deno.test("renderNum returns 1 SVG for Num.A", () => {
  const mock = createMockSVG();
  const result = renderNum(Num.A, [mock as unknown as SVGSVGElement]);

  assertEquals(result.length, 1);
});

Deno.test("renderNum returns 2 SVGs for Num.B", () => {
  const mock = createMockSVG();
  const result = renderNum(Num.B, [mock as unknown as SVGSVGElement]);

  assertEquals(result.length, 2);
});

Deno.test("renderNum returns 3 SVGs for Num.C", () => {
  const mock = createMockSVG();
  const result = renderNum(Num.C, [mock as unknown as SVGSVGElement]);

  assertEquals(result.length, 3);
});

Deno.test("renderNum first element is the original SVG", () => {
  const mock = createMockSVG();
  const result = renderNum(Num.C, [mock as unknown as SVGSVGElement]);

  assertEquals(result[0] as unknown, mock);
});
