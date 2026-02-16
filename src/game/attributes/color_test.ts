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

// renderColor tests

function createMockSVG(): {
  style: {
    setProperty: (name: string, value: string) => void;
    props: Record<string, string>;
  };
} {
  const props: Record<string, string> = {};
  return {
    style: {
      props,
      setProperty(name: string, value: string) {
        props[name] = value;
      },
    },
  };
}

Deno.test("renderColor sets --attribute-color to red for Color.A", () => {
  const mock = createMockSVG();
  const result = renderColor(Color.A, [mock as unknown as SVGSVGElement]);

  assertEquals(result.length, 1);
  assertEquals(mock.style.props["--attribute-color"], "#ff0000");
});

Deno.test("renderColor sets --attribute-color to green for Color.B", () => {
  const mock = createMockSVG();
  renderColor(Color.B, [mock as unknown as SVGSVGElement]);

  assertEquals(mock.style.props["--attribute-color"], "#00ff00");
});

Deno.test("renderColor sets --attribute-color to blue for Color.C", () => {
  const mock = createMockSVG();
  renderColor(Color.C, [mock as unknown as SVGSVGElement]);

  assertEquals(mock.style.props["--attribute-color"], "#0000ff");
});

Deno.test("renderColor applies to all SVGs in array", () => {
  const mock1 = createMockSVG();
  const mock2 = createMockSVG();
  const result = renderColor(Color.A, [
    mock1 as unknown as SVGSVGElement,
    mock2 as unknown as SVGSVGElement,
  ]);

  assertEquals(result.length, 2);
  assertEquals(mock1.style.props["--attribute-color"], "#ff0000");
  assertEquals(mock2.style.props["--attribute-color"], "#ff0000");
});
