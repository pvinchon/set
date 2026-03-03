<script lang="ts">
	import './layout.css';
	import { browser } from '$app/environment';
	import { buildActiveConfig, loadPreferences, setActiveConfig } from '$lib/game/config';

	// Initialize the active config from saved preferences on app start.
	if (browser) {
		setActiveConfig(buildActiveConfig(loadPreferences()));
	}

	let { children } = $props();
</script>

<main id="app" class="flex min-h-[100dvh] flex-col items-center overflow-x-hidden bg-gray-100">
	{@render children()}
</main>
