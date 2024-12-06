<script>
	let { total, yearSpan, numberOfLocations, query, filters } = $props();

	let hasSelectedFilters = $derived(Object.values(filters).some((filter) => filter.length > 0));
</script>

<h2>
	<em>{total.toLocaleString()}</em> Inscriptions over
	<em>{yearSpan.toLocaleString()}</em>
	years across
	<em>{numberOfLocations.toLocaleString()}</em>
	locations{#if query}, matching
		<em>{query.split(' ').join(', ')}</em>
	{/if}{#if hasSelectedFilters}, filtered by
		<span class="selected-filters">
			{#each Object.entries(filters).filter(([_, value]) => value.length > 0) as [key, value]}
				<span>
					{key}: <em>{value.join(', ')}</em>
				</span>
			{/each}
		</span>
	{/if}
</h2>

<style>
	h2 {
		max-inline-size: var(--header-size-6);
		margin-block: var(--size-4);
		text-align: center;
	}

	.selected-filters span:not(:first-child)::before {
		content: ', ';
	}
</style>
