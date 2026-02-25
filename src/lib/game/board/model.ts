import type { Card } from '$lib/game/card';

export interface Board {
	readonly cards: readonly Card[];
}
