<script lang="ts">
	import { Color, COLOR_HEX } from '$lib/game/attributes/color';
	import { Shape } from '$lib/game/attributes/shape';

	const colors = [Color.A, Color.B, Color.C];
	const shapes = [Shape.A, Shape.B, Shape.C];
</script>

<!-- All possible stripe patterns, defined once for the whole board -->
<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
	<defs>
		{#each colors as color (color)}
			{#each shapes as shape (shape)}
				<pattern id={`stripe-${color}-${shape}`} patternUnits="userSpaceOnUse" width="8" height="8">
					<line x1="0" y1="0" x2="0" y2="8" stroke={COLOR_HEX[color]} stroke-width="4" />
				</pattern>
			{/each}
		{/each}
	</defs>
</svg>
