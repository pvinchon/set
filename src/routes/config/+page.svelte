<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		buildActiveConfig,
		COLOR_PALETTE,
		DEFAULT_PREFERENCES,
		PATTERN_PALETTE,
		SHAPE_PALETTE,
		loadPreferences,
		savePreferences,
		setActiveConfig
	} from '$lib/game/config';
	import {
		SHAPE_HEIGHT,
		SHAPE_STROKE_WIDTH,
		SHAPE_WIDTH,
		SHAPE_VIEWBOX
	} from '$lib/game/attributes/shape';
	import SlotRow from '$lib/game/config/SlotRow.svelte';
	import PageShell from '$lib/components/PageShell.svelte';

	// Draft preferences — mutated locally until the user saves
	const prefs = loadPreferences();
	let draftColors = $state<[string, string, string]>(
		prefs.colors.slice() as [string, string, string]
	);
	let draftShapes = $state<[string, string, string]>(
		prefs.shapes.slice() as [string, string, string]
	);
	let draftPatterns = $state<[string, string, string]>(
		prefs.patterns.slice() as [string, string, string]
	);

	let draftPrefs = $derived({
		colors: draftColors,
		shapes: draftShapes,
		patterns: draftPatterns
	});
	let draftConfig = $derived(buildActiveConfig(draftPrefs));

	let previewCards = $derived(
		[0, 1, 2].map((i) => ({
			color: draftColors[i],
			shape: draftShapes[i],
			pattern: draftPatterns[i],
			colorHex: draftConfig.colorHexMap[i as 0 | 1 | 2],
			pathFn: draftConfig.shapePathMap[i as 0 | 1 | 2],
			patternDef: draftConfig.shadingMap[i as 0 | 1 | 2],
			patternId: `preview-card-${i}`
		}))
	);

	function resetToDefaults() {
		draftColors = [...DEFAULT_PREFERENCES.colors];
		draftShapes = [...DEFAULT_PREFERENCES.shapes];
		draftPatterns = [...DEFAULT_PREFERENCES.patterns];
	}

	function saveAndGoBack() {
		savePreferences(draftPrefs);
		setActiveConfig(buildActiveConfig(draftPrefs));
		goto(resolve('/'));
	}
</script>

<PageShell title="Settings">
	<div class="flex w-full flex-1 flex-col gap-6">
		<!-- Preview -->
		<div class="flex flex-1 items-center justify-center gap-5">
			{#each previewCards as card, i (i)}
				{@const defsHtml = card.patternDef.svgDefs(card.patternId, card.colorHex)}
				{@const fillVal = card.patternDef.fill(card.patternId, card.colorHex)}
				<div
					class="flex w-28 flex-col items-center gap-2 rounded-2xl bg-white px-5 py-6 shadow-lg ring-1 ring-gray-200"
				>
					<svg viewBox={SHAPE_VIEWBOX} class="h-16 w-16">
						{#if defsHtml}
							<!-- eslint-disable-next-line svelte/no-at-html-tags -- safe: defs come from hardcoded PatternDef, not user input -->
							{@html `<defs>${defsHtml}</defs>`}
						{/if}
						<path
							d={card.pathFn(SHAPE_WIDTH, SHAPE_HEIGHT)}
							fill={fillVal}
							stroke={card.colorHex}
							stroke-width={SHAPE_STROKE_WIDTH}
						/>
					</svg>
				</div>
			{/each}
		</div>

		<!-- Slot rows -->
		<div class="flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200">
			<SlotRow
				label="Colors"
				palette={COLOR_PALETTE}
				type="color"
				selected={draftColors}
				onchange={(v) => (draftColors = v)}
			/>
			<SlotRow
				label="Shapes"
				palette={SHAPE_PALETTE}
				type="shape"
				selected={draftShapes}
				onchange={(v) => (draftShapes = v)}
			/>
			<SlotRow
				label="Patterns"
				palette={PATTERN_PALETTE}
				type="pattern"
				selected={draftPatterns}
				onchange={(v) => (draftPatterns = v)}
			/>
		</div>

		<!-- Actions -->
		<div class="mt-auto flex flex-col gap-3 sm:flex-row sm:justify-center">
			<button
				class="cursor-pointer rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-700 active:bg-blue-800"
				onclick={saveAndGoBack}
				type="button"
			>
				Save
			</button>
			<button
				class="cursor-pointer rounded-lg bg-gray-200 px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-300 active:bg-gray-400"
				onclick={resetToDefaults}
				type="button"
			>
				Reset
			</button>
		</div>
	</div>
</PageShell>
