<script lang="ts">
	import { Color } from '$lib/game/attributes/color';
	import { Shading } from '$lib/game/attributes/shading';
	import { getActiveConfig } from '$lib/game/config';

	const config = getActiveConfig();
	const colors = [Color.A, Color.B, Color.C];
	const shadings = [Shading.A, Shading.B, Shading.C];
</script>

<!-- All pattern defs for every color × shading combination, defined once for the board -->
<svg aria-hidden="true" style="position: absolute; width: 0; height: 0; overflow: hidden;">
	<defs>
		{#each colors as color (color)}
			{#each shadings as shading (shading)}
				{@const patternId = `pattern-${color}-${shading}`}
				{@const colorHex = config.colorHexMap[color]}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- safe: defs come from hardcoded PatternDef, not user input -->
				{@html config.shadingMap[shading].svgDefs(patternId, colorHex)}
			{/each}
		{/each}
	</defs>
</svg>
