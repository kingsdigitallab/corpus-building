<script>
	import { fade } from 'svelte/transition';

	export let url;
</script>

{#key url}
	<div in:fade={{ duration: 500 }}>
		<slot />
	</div>
{/key}

<style>
	div {
		height: 100%;
	}
</style>
