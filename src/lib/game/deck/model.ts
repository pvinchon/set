import type { Card } from '$lib/game/card';

export interface Deck {
	readonly cards: readonly Card[];
}
