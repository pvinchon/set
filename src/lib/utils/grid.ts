/** Read the actual column count from a grid container element. */
function getColumnCountFromContainer(container: HTMLElement): number {
	const cols = globalThis.getComputedStyle(container).gridTemplateColumns.split(' ').length;
	return cols > 0 ? cols : 3;
}

/** Walk up the DOM to find the nearest grid container. */
function findGridContainer(el: HTMLElement): HTMLElement | undefined {
	let node: HTMLElement | null = el.parentElement;
	while (node) {
		if (globalThis.getComputedStyle(node).display === 'grid') return node;
		node = node.parentElement;
	}
	return undefined;
}

/**
 * Normalized horizontal position in [-1, 1] for the card at `index`.
 * -1 = leftmost column, 0 = center, 1 = rightmost column.
 *
 * When called with a card element, reads the actual column count from
 * the grid container so it works correctly for any board size.
 */
export function getPositionFactor(index: number, el?: HTMLElement): number {
	const container = el ? findGridContainer(el) : undefined;
	const cols = container ? getColumnCountFromContainer(container) : 3;
	const col = index % cols;
	const center = (cols - 1) / 2;
	return center === 0 ? 0 : (col - center) / center;
}
