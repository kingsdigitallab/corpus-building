<script>
	import { fade } from 'svelte/transition';

	let { url, children } = $props();

	const children_render = $derived(children);
</script>

{#key url}
	<div in:fade={{ duration: 500 }}>
		{@render children_render?.()}
	</div>
{/key}

<style>
	div {
		height: 100%;
	}
</style>
