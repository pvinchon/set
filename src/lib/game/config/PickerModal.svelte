<script lang="ts">
	import {
		type PaletteItem,
		type ColorOption,
		isColor,
		isShape,
		isPattern,
		SWATCH_COLOR
	} from './model';
	import { portal } from '$lib/utils/portal';
	import PatternSwatch from './PatternSwatch.svelte';

	let {
		palette,
		type,
		currentId,
		unavailableIds = new Set<string>(),
		onclose
	}: {
		palette: readonly PaletteItem[];
		type: 'color' | 'shape' | 'pattern';
		currentId: string;
		unavailableIds?: Set<string>;
		onclose: (selectedId: string | null) => void;
	} = $props();

	/** Group colors by their hue family, preserving palette order. */
	const colorGroups = $derived.by(() => {
		const groups: ColorOption[][] = [];
		let currentGroup: ColorOption[] = [];
		let currentGroupName = '';

		for (const item of palette) {
			if (!isColor(item)) continue;
			if (item.group !== currentGroupName) {
				if (currentGroup.length > 0) groups.push(currentGroup);
				currentGroup = [item];
				currentGroupName = item.group;
			} else {
				currentGroup.push(item);
			}
		}
		if (currentGroup.length > 0) groups.push(currentGroup);
		return groups;
	});

	function handleSelect(id: string) {
		if (unavailableIds.has(id)) return;
		onclose(id === currentId ? null : id);
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose(null);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose(null);
	}

	function focusDialog(node: HTMLElement) {
		node.focus();
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
	onclick={handleBackdropClick}
	onkeydown={handleKeydown}
	use:portal
>
	<div
		class="max-h-[80vh] w-full max-w-[90vw] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl sm:max-w-md"
		role="dialog"
		aria-modal="true"
		aria-label="Pick option"
		tabindex="-1"
		use:focusDialog
	>
		{#if type === 'color'}
			<div class="flex flex-col gap-1">
				{#each colorGroups as group, gi (gi)}
					<div class="flex justify-center gap-1">
						{#each group as option (option.id)}
							{@const isCurrent = option.id === currentId}
							{@const isUnavailable = unavailableIds.has(option.id)}
							<button
								class={[
									'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all duration-150 hover:scale-110',
									isCurrent && 'ring-2 ring-offset-1',
									isUnavailable && 'cursor-not-allowed opacity-30'
								]}
								style:--tw-ring-color={isCurrent ? option.hex : undefined}
								onclick={() => handleSelect(option.id)}
								title={option.label}
								type="button"
								aria-pressed={isCurrent}
								disabled={isUnavailable}
							>
								<div class="h-6 w-6 rounded-full" style:background-color={option.hex}></div>
							</button>
						{/each}
					</div>
				{/each}
			</div>
		{:else if type === 'shape'}
			<div class="grid grid-cols-4 gap-2">
				{#each palette as option (option.id)}
					{#if isShape(option)}
						{@const isCurrent = option.id === currentId}
						{@const isUnavailable = unavailableIds.has(option.id)}
						<button
							class={[
								'flex h-14 w-full cursor-pointer items-center justify-center rounded-xl transition-all duration-150 hover:scale-105',
								isCurrent ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100',
								isUnavailable && 'cursor-not-allowed opacity-30'
							]}
							onclick={() => handleSelect(option.id)}
							title={option.label}
							type="button"
							aria-pressed={isCurrent}
							disabled={isUnavailable}
						>
							<svg viewBox="-2 -2 84 84" class="h-8 w-8">
								<path
									d={option.pathFn(80, 80)}
									fill={SWATCH_COLOR}
									stroke="#374151"
									stroke-width="3"
								/>
							</svg>
						</button>
					{/if}
				{/each}
			</div>
		{:else if type === 'pattern'}
			<div class="grid grid-cols-4 gap-3">
				{#each palette as option (option.id)}
					{#if isPattern(option)}
						{@const isCurrent = option.id === currentId}
						{@const isUnavailable = unavailableIds.has(option.id)}
						<button
							class={[
								'flex h-16 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 hover:scale-105',
								isCurrent ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100',
								isUnavailable && 'cursor-not-allowed opacity-30'
							]}
							onclick={() => handleSelect(option.id)}
							title={option.label}
							type="button"
							aria-pressed={isCurrent}
							disabled={isUnavailable}
						>
							<PatternSwatch
								patternDef={option.patternDef}
								color={SWATCH_COLOR}
								swatchId={`swatch-picker-${option.id}`}
							/>
						</button>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</div>
