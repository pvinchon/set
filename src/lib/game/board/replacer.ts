import type { Board } from '$lib/game/board/model';
import type { Card } from '$lib/game/card';

export function replaceCards(
	board: Board,
	selectedIndices: [number, number, number],
	newCards: [Card, Card, Card]
): Board {
	const cards = board.cards.map((card, i) => {
		const idx = selectedIndices.indexOf(i);
		return idx !== -1 ? newCards[idx] : card;
	});
	return { cards };
}
