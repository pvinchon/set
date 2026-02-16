// Shading style on a card (solid, striped, open)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Shading {
  A = 0,
  B = 1,
  C = 2,
}

export function renderShading(
  shading: Shading,
  svgs: SVGSVGElement[],
): SVGSVGElement[] {
  return svgs.map((svg) => {
    switch (shading) {
      case Shading.A: // solid
        svg.style.setProperty("--attribute-fill", "var(--attribute-color)");
        break;
      case Shading.B: { // striped
        const patternId = `stripe-${crypto.randomUUID().slice(0, 8)}`;
        svg.insertAdjacentHTML(
          "afterbegin",
          `<defs>
            <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="8" height="8">
              <line x1="0" y1="0" x2="0" y2="8" stroke="var(--attribute-color)" stroke-width="4"/>
            </pattern>
          </defs>`,
        );
        svg.style.setProperty("--attribute-fill", `url(#${patternId})`);
        break;
      }
      case Shading.C: // open
        svg.style.setProperty("--attribute-fill", "none");
        break;
    }
    return svg;
  });
}
