<script lang="ts">
	import type { PatternDef } from './model';

	let {
		patternDef,
		color,
		swatchId,
		size = 'h-8 w-8'
	}: {
		patternDef: PatternDef;
		color: string;
		swatchId: string;
		size?: string;
	} = $props();

	let defsHtml = $derived(patternDef.svgDefs(swatchId, color));
	let fillVal = $derived(patternDef.fill(swatchId, color));
</script>

<svg viewBox="-2 -2 84 84" class={size}>
	{#if defsHtml}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- safe: defs come from hardcoded PatternDef, not user input -->
		{@html `<defs>${defsHtml}</defs>`}
	{/if}
	<path
		d="M 40 0 A 40 40 0 1 1 40 80 A 40 40 0 1 1 40 0"
		fill={fillVal}
		stroke={color}
		stroke-width="3"
	/>
</svg>
