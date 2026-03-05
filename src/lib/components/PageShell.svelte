<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Snippet } from 'svelte';

	let {
		title,
		children
	}: {
		title?: string;
		children: Snippet;
	} = $props();

	function goBack() {
		goto(resolve('/'));
	}
</script>

<div class="flex h-[100dvh] w-full animate-screen-in flex-col items-center">
	<div class="flex w-full max-w-screen-sm shrink-0 items-center px-4 pt-4">
		<button
			class="cursor-pointer font-medium text-gray-500 transition-colors hover:text-gray-700"
			onclick={goBack}
			type="button"
		>
			&larr; Back
		</button>
		{#if title}
			<h1 class="ml-3 text-xl font-bold text-gray-900">{title}</h1>
		{/if}
	</div>

	<div
		class="flex w-full max-w-screen-sm flex-1 flex-col items-center justify-center overflow-y-auto p-4"
	>
		{@render children()}
	</div>
</div>
