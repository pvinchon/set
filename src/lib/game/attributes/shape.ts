// Shape type on a card (circle, square, triangle)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Shape {
	A = 0,
	B = 1,
	C = 2
}

/** SVG viewport dimensions for card shapes. */
export const SHAPE_WIDTH = 80;
export const SHAPE_HEIGHT = 80;
export const SHAPE_STROKE_WIDTH = 4;

/** Pre-computed SVG viewBox string with stroke padding for card shapes. */
export const SHAPE_VIEWBOX = `${-SHAPE_STROKE_WIDTH / 2} ${-SHAPE_STROKE_WIDTH / 2} ${SHAPE_WIDTH + SHAPE_STROKE_WIDTH} ${SHAPE_HEIGHT + SHAPE_STROKE_WIDTH}`;
