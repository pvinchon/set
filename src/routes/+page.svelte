<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { DifficultyLevel } from '$lib/game/difficulty/model';
	import { DIFFICULTY_BUTTONS } from '$lib/game/controller';

	function selectDifficulty(level: DifficultyLevel) {
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- query params require concatenation
		goto(`${resolve('/play')}?difficulty=${level}`);
	}
</script>

<div class="flex animate-screen-in flex-col items-center gap-8">
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
</div>
