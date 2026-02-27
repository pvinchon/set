<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<main
	id="app"
	class="flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-gray-100 p-4"
>
	{@render children()}
</main>
