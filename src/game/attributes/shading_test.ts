import { assertEquals, assertStringIncludes } from "jsr:@std/assert@1";
import { renderShading, Shading } from "@/game/attributes/shading.ts";

Deno.test("Shading enum has values 0, 1, 2", () => {
  assertEquals(Shading.A, 0);
  assertEquals(Shading.B, 1);
  assertEquals(Shading.C, 2);
});

// renderShading tests

function createMockSVG(): {
  style: {
    setProperty: (name: string, value: string) => void;
    props: Record<string, string>;
  };
  innerHTML: string;
  insertAdjacentHTML: (position: string, html: string) => void;
} {
  const props: Record<string, string> = {};
  let innerHTML = "";
  return {
    style: {
      props,
      setProperty(name: string, value: string) {
        props[name] = value;
      },
    },
    get innerHTML() {
      return innerHTML;
    },
    insertAdjacentHTML(_position: string, html: string) {
      innerHTML = html + innerHTML;
    },
  };
}

Deno.test("renderShading solid sets --attribute-fill to var(--attribute-color)", () => {
  const mock = createMockSVG();
  renderShading(Shading.A, [mock as unknown as SVGSVGElement]);

  assertEquals(mock.style.props["--attribute-fill"], "var(--attribute-color)");
});

Deno.test("renderShading open sets --attribute-fill to none", () => {
  const mock = createMockSVG();
  renderShading(Shading.C, [mock as unknown as SVGSVGElement]);

  assertEquals(mock.style.props["--attribute-fill"], "none");
});

Deno.test("renderShading striped sets --attribute-fill to url pattern", () => {
  const mock = createMockSVG();
  renderShading(Shading.B, [mock as unknown as SVGSVGElement]);

  const fillValue = mock.style.props["--attribute-fill"]!;
  assertStringIncludes(fillValue, "url(#stripe-");
  assertStringIncludes(mock.innerHTML, "<defs>");
  assertStringIncludes(mock.innerHTML, "pattern");
});

Deno.test("renderShading applies to all SVGs in array", () => {
  const mock1 = createMockSVG();
  const mock2 = createMockSVG();
  const result = renderShading(Shading.A, [
    mock1 as unknown as SVGSVGElement,
    mock2 as unknown as SVGSVGElement,
  ]);

  assertEquals(result.length, 2);
  assertEquals(mock1.style.props["--attribute-fill"], "var(--attribute-color)");
  assertEquals(mock2.style.props["--attribute-fill"], "var(--attribute-color)");
});
