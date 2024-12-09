<script>
	import * as config from '$lib/config';
	import FacetedSearch from '$lib/components/search/FacetedSearch.svelte';
</script>

<section class="hero">
	<h1>{config.description}</h1>
</section>

<FacetedSearch />

<style>
	.hero {
		display: grid;
		place-items: center;
	}

	.hero h1 {
		font-size: var(--font-size-4);
		max-inline-size: var(--header-size-4);
		text-align: center;
	}
</style>
