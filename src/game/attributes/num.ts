// Number of shapes on a card (1, 2, or 3)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Num {
  A = 0,
  B = 1,
  C = 2,
}

export function renderNum(
  num: Num,
  svgs: SVGSVGElement[],
): SVGSVGElement[] {
  const count = num + 1;
  const result: SVGSVGElement[] = [];

  for (const svg of svgs) {
    result.push(svg);
    for (let i = 1; i < count; i++) {
      const clone = svg.cloneNode(true) as SVGSVGElement;
      result.push(clone);
    }
  }
  return result;
}
