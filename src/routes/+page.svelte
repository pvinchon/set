<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { DifficultyLevel } from '$lib/game/difficulty';
	import { DIFFICULTY_BUTTONS } from '$lib/game/controller';

	function selectDifficulty(level: DifficultyLevel) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- query params require concatenation
		goto(`${resolve('/play')}?difficulty=${level}`);
	}
</script>

<div class="flex min-h-[100dvh] w-full animate-screen-in flex-col items-center p-4">
	<!-- Top spacer pushes content toward center -->
	<div class="flex-1"></div>

	<h1 class="text-5xl font-bold text-gray-900">SET</h1>

	<div class="mt-7 flex w-full max-w-xs flex-col gap-3">
		{#each DIFFICULTY_BUTTONS as { level, label, classes } (level)}
			<button
				class="cursor-pointer rounded-lg px-6 py-3 text-lg font-semibold text-white shadow-md transition-colors {classes}"
				onclick={() => selectDifficulty(level)}
				type="button"
			>
				{label}
			</button>
		{/each}
	</div>

	<!-- Bottom spacer pushes settings to bottom -->
	<div class="flex-1"></div>

	<button
		class="w-full max-w-xs cursor-pointer rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-300 active:bg-gray-400"
		onclick={() => goto(resolve('/config'))}
		type="button"
	>
		Settings
	</button>
</div>
