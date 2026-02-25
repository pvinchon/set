export interface Selection {
	readonly indices: readonly number[];
}

export const EMPTY_SELECTION: Selection = { indices: [] };
