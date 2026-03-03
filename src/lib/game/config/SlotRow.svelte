<script lang="ts">
	import { type PaletteItem, isColor, isShape, isPattern, SWATCH_COLOR } from './model';
	import PickerModal from './PickerModal.svelte';
	import PatternSwatch from './PatternSwatch.svelte';

	let {
		label,
		palette,
		type,
		selected,
		onchange
	}: {
		label: string;
		palette: readonly PaletteItem[];
		type: 'color' | 'shape' | 'pattern';
		selected: [string, string, string];
		onchange: (newSelected: [string, string, string]) => void;
	} = $props();

	let openSlot = $state<number | null>(null);

	function getOption(id: string): PaletteItem | undefined {
		return palette.find((o) => o.id === id);
	}

	function otherIds(index: number): Set<string> {
		return new Set(selected.filter((_, i) => i !== index));
	}

	function handleClose(index: number, picked: string | null) {
		openSlot = null;
		if (picked !== null) {
			const next = [...selected] as [string, string, string];
			next[index] = picked;
			onchange(next);
		}
	}
</script>

<div class="flex items-center justify-between gap-3">
	<span class="w-20 shrink-0 text-sm font-semibold text-gray-600">{label}</span>
	<div class="flex gap-2">
		{#each selected as id, i (i)}
			{@const option = getOption(id)}
			<button
				class="flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl bg-gray-100 shadow-sm ring-1 ring-gray-200 transition-all duration-150 hover:scale-105 hover:bg-gray-200"
				onclick={() => (openSlot = i)}
				title="Change {label.toLowerCase()} slot {i + 1}"
				type="button"
			>
				{#if option && isColor(option)}
					<div class="h-8 w-8 rounded-full" style:background-color={option.hex}></div>
				{:else if option && isShape(option)}
					<svg viewBox="-2 -2 84 84" class="h-8 w-8">
						<path d={option.pathFn(80, 80)} fill={SWATCH_COLOR} stroke="#374151" stroke-width="3" />
					</svg>
				{:else if option && isPattern(option)}
					<PatternSwatch
						patternDef={option.patternDef}
						color={SWATCH_COLOR}
						swatchId={`swatch-row-${i}-${option.id}`}
					/>
				{:else}
					<span class="text-xs text-gray-400">?</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

{#if openSlot !== null}
	{@const slotIndex = openSlot}
	<PickerModal
		{palette}
		{type}
		currentId={selected[slotIndex]}
		unavailableIds={otherIds(slotIndex)}
		onclose={(id) => handleClose(slotIndex, id)}
	/>
{/if}
