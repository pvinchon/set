import type { Card } from '$lib/game/card/model';

export function cardEquals(a: Card, b: Card): boolean {
	return a.num === b.num && a.shape === b.shape && a.shading === b.shading && a.color === b.color;
}
