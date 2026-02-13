// Shape type on a card (circle, square, triangle)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Shape {
  A = 0,
  B = 1,
  C = 2,
}

// Shape paths (viewBox 0 0 40 80)
export const SHAPE_PATH: Record<Shape, string> = {
  [Shape.A]: "M20 40 A20 20 0 1 1 20 40.1", // circle
  [Shape.B]: "M6 12 L34 12 L34 68 L6 68 Z", // square
  [Shape.C]: "M20 8 L36 72 L4 72 Z", // triangle
};
