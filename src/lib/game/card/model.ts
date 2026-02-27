import { Color, Num, Shading, Shape } from '$lib/game/attributes';

export interface Card {
	readonly num: Num;
	readonly shape: Shape;
	readonly shading: Shading;
	readonly color: Color;
}

export function createCard(num: Num, shape: Shape, shading: Shading, color: Color): Card {
	return { num, shape, shading, color };
}
