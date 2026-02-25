// Shape type on a card (circle, square, triangle)
// Uses A=0, B=1, C=2 to enable modular arithmetic for set validation

export enum Shape {
	A = 0,
	B = 1,
	C = 2
}

// Shape path generator - shapes fill square viewport
export function shapePath(shape: Shape, width: number, height: number): string {
	const cx = width / 2;
	const cy = height / 2;
	const size = Math.min(width, height);

	switch (shape) {
		case Shape.A: {
			// Circle: center at viewport center, diameter = viewport size
			const r = size / 2;
			return [
				`M ${cx} ${cy - r}`,
				`A ${r} ${r} 0 1 1 ${cx} ${cy + r}`,
				`A ${r} ${r} 0 1 1 ${cx} ${cy - r}`
			].join(' ');
		}
		case Shape.B:
			// Square: fills entire viewport
			return `M 0 0 L ${width} 0 L ${width} ${height} L 0 ${height} Z`;
		case Shape.C: {
			// Equilateral triangle: bounding box centered in viewport, base = size
			const h = (size * Math.sqrt(3)) / 2;
			const top = cy - h / 2;
			const bottom = cy + h / 2;
			const left = cx - size / 2;
			const right = cx + size / 2;
			return `M ${cx} ${top} L ${right} ${bottom} L ${left} ${bottom} Z`;
		}
	}
}

/** SVG viewport dimensions for card shapes. */
export const SHAPE_WIDTH = 80;
export const SHAPE_HEIGHT = 80;
export const SHAPE_STROKE_WIDTH = 4;
