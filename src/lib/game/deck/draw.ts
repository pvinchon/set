import type { Deck } from '$lib/game/deck/model';
import type { Card } from '$lib/game/card';
import { cardEquals } from '$lib/game/card';

export function drawCards(deck: Deck, count: number, exclude: readonly Card[]): Card[] {
	const available = deck.cards.filter((c) => !exclude.some((e) => cardEquals(c, e)));
	const shuffled = [...available].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}
