// Shading style on a card (solid, striped, open)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Shading {
  A = 0,
  B = 1,
  C = 2,
}

export interface ShadingStyle {
  fill: string;
  stroke: string;
  defs?: string;
}

export function getShadingStyle(
  shading: Shading,
  color: string,
  patternId: string,
): ShadingStyle {
  switch (shading) {
    case Shading.A: // solid
      return { fill: color, stroke: color };
    case Shading.B: // striped
      return {
        fill: `url(#${patternId})`,
        stroke: color,
        defs: `<defs>
          <pattern id="${patternId}" patternUnits="userSpaceOnUse" width="4" height="4">
            <line x1="0" y1="0" x2="0" y2="4" stroke="${color}" stroke-width="2"/>
          </pattern>
        </defs>`,
      };
    case Shading.C: // open
      return { fill: "none", stroke: color };
  }
}
