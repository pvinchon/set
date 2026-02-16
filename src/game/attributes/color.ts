// Color of shapes on a card (red, green, blue)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Color {
  A = 0,
  B = 1,
  C = 2,
}

export const COLOR_HEX: Record<Color, string> = {
  [Color.A]: "#ff0000", // red
  [Color.B]: "#00ff00", // green
  [Color.C]: "#0000ff", // blue
};

export function renderColor(
  color: Color,
  svgs: SVGSVGElement[],
): SVGSVGElement[] {
  return svgs.map((svg) => {
    svg.style.setProperty("--attribute-color", COLOR_HEX[color]);
    return svg;
  });
}
