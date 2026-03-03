/**
 * Svelte action that teleports an element to document.body.
 * Useful for modals/overlays that need to escape ancestor transform
 * or overflow contexts which break `position: fixed`.
 */
export function portal(node: HTMLElement): { destroy: () => void } {
	document.body.appendChild(node);

	return {
		destroy() {
			node.remove();
		}
	};
}
