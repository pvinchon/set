import type { Selection } from '$lib/game/selection/model';

export function toggleSelection(selection: Selection, index: number): Selection {
	const current = selection.indices;

	if (current.includes(index)) {
		// Deselect
		return { indices: current.filter((i) => i !== index) };
	}

	if (current.length >= 3) {
		// Already 3 selected, ignore
		return selection;
	}

	// Select
	return { indices: [...current, index] };
}

export function isComplete(selection: Selection): boolean {
	return selection.indices.length === 3;
}
