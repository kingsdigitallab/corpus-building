<script>
	let {
		total,
		dateRange,
		defaultDateRange,
		letterHeightRange,
		defaultLetterHeightRange,
		numberOfLocations,
		query,
		filters
	} = $props();

	let hasSelectedFilters = $derived(Object.values(filters).some((filter) => filter.length > 0));
</script>

<h2>
	<em>{total.toLocaleString()}</em> Inscriptions between
	<em>{dateRange[0] > 0 ? `AD ${dateRange[0]}` : `${Math.abs(dateRange[0])} BC`}</em>
	–
	<em>{dateRange[1] > 0 ? `AD ${dateRange[1]}` : `${Math.abs(dateRange[1])} BC`}</em>
	across
	<em>{numberOfLocations.toLocaleString()}</em>
	locations{#if query}, matching
		<em>{query.split(' ').join(', ')}</em>
	{/if}{#if hasSelectedFilters || letterHeightRange[0] !== defaultLetterHeightRange[0] || letterHeightRange[1] !== defaultLetterHeightRange[1]},
		filtered by
		<span class="selected-filters">
			{#each Object.entries(filters).filter(([_, value]) => value.length > 0) as [key, value]}
				<span>
					{key}: <em>{value.join(', ').replaceAll('_', ' ').replaceAll(':::', ' ')}</em>
				</span>
			{/each}
			{#if letterHeightRange}
				<span>
					letter height: <em>{letterHeightRange[0]}–{letterHeightRange[1]}mm</em>
				</span>
			{/if}
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
