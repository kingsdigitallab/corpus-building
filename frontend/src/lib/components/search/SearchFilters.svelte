<script>
	import { Button } from 'bits-ui';
	import { slide } from 'svelte/transition';
	import RangeSlider from './RangeSlider.svelte';

	let {
		show = false,
		aggregations = {},
		total = 0,
		sortAggregationsBy = $bindable('key'),
		selectedDateRange = $bindable([0, 0]),
		selectedLetterHeightRange = $bindable([0, 0]),
		selectedFilters = $bindable({})
	} = $props();

	let hasSelectedFilters = $derived(
		Object.values(selectedFilters).some((filter) => filter.length > 0)
	);

	const sortAggregationsOptions = [
		{ label: 'Name', value: 'key' },
		{ label: 'Count', value: 'count' }
	];

	/** @type {Record<string, string>} */
	let filterContains = $state({});

	/** @type {HTMLElement | null} */
	let previousFocusElement = $state(null);

	/**
	 * @param {{ currentTarget: { focus: () => void; }; }} e
	 */
	function handleIntroEnd(e) {
		previousFocusElement = /** @type {HTMLElement} */ (document.activeElement);
		e.currentTarget?.focus();
	}

	function handleClose() {
		show = false;
	}

	function handleOutroEnd() {
		if (previousFocusElement) {
			previousFocusElement.focus();
		}
	}

	function handleClearFilters() {
		selectedFilters = Object.fromEntries(Object.keys(selectedFilters).map((key) => [key, []]));
	}

	/**
	 * @param {string} key
	 */
	function handleRemoveFilter(key) {
		selectedFilters[key] = [];
	}

	/**
	 * @param {import('itemsjs').Bucket[]} buckets
	 * @param {string} key
	 */
	function filterBuckets(buckets, key) {
		const filter = filterContains[key]?.toLowerCase() || '';
		return filter ? buckets.filter((b) => b.key.toLowerCase().includes(filter)) : buckets;
	}

	/**
	 * @param {string} bucket
	 * @returns {string}
	 */
	function getBucketDisplayValue(bucket) {
		if (bucket.indexOf(':::') == -1) return bucket;
		const parts = bucket.split(':::');
		const levels = parts.length;

		if (sortAggregationsBy === 'count') {
			return parts.pop() || '';
		}

		return `${'+'.repeat(levels - 1)} ${parts.pop()}`;
	}
</script>

{#if show}
	<aside
		class="filters"
		tabindex="-1"
		transition:slide={{ axis: 'x', duration: 300 }}
		onintroend={handleIntroEnd}
		onoutroend={handleOutroEnd}
	>
		<section class="filters-header">
			<h2>Filters</h2>
			<Button.Root class="close-button" onclick={handleClose} aria-label="Close filters"
				>×</Button.Root
			>
		</section>

		<section class="filters-sort">
			<h3>Sort by</h3>
			<div>
				{#each sortAggregationsOptions as option}
					<label>
						<input
							type="radio"
							name="sort-aggregations"
							value={option.value}
							bind:group={sortAggregationsBy}
						/>
						{option.label}
					</label>
				{/each}
			</div>
		</section>

		<section class="filters-by">
			<div>
				<hgroup>
					<h3>Filter by</h3>
					<small>({total.toLocaleString()} inscriptions found)</small>
				</hgroup>
				{#if hasSelectedFilters}
					<Button.Root
						class="clear-filters-button"
						aria-label="Clear all filters"
						onclick={handleClearFilters}
					>
						Clear all filters
					</Button.Root>
				{/if}
			</div>
			<ul>
				{#each Object.entries(selectedFilters).filter(([_, value]) => value.length > 0) as [key, value]}
					{@const displayValue = value.join(', ').replaceAll('_', ' ').replaceAll(':::', ' ')}
					<li>
						<Button.Root
							class="remove-filter-button"
							aria-label="Remove {key} filter with value {displayValue}"
							title="Remove {key} filter with value {displayValue}"
							onclick={() => handleRemoveFilter(key)}
						>
							{displayValue}
						</Button.Root>
					</li>
				{/each}
			</ul>
		</section>

		<section class="filters-groups">
			{#if aggregations?.notBefore}
				<section class="filters-group">
					<RangeSlider
						title="Date"
						min={-700}
						max={1830}
						step={1}
						startLabel="No earlier than"
						endLabel="No later than"
						bind:selectedRange={selectedDateRange}
					/>
				</section>
			{/if}
			{#each Object.keys(selectedFilters) as key}
				{#if key in aggregations && aggregations[key].title}
					<section class="filters-group">
						<hgroup>
							<h3>{aggregations[key].title}</h3>
							<small
								>Options: {aggregations[key].buckets.filter((b) => b.doc_count > 0).length}</small
							>
						</hgroup>
						{#if aggregations[key].buckets.length > 20}
							<input
								type="text"
								placeholder="Filter options..."
								bind:value={filterContains[key]}
								class="filter-input"
							/>
						{/if}
						<ul>
							{#each filterBuckets(aggregations[key].buckets, key) as bucket}
								<li>
									<label>
										<input
											type="checkbox"
											value={bucket.key}
											bind:group={selectedFilters[key]}
											disabled={bucket.doc_count === 0}
										/>
										<div>
											<span>{getBucketDisplayValue(bucket.key)}</span>
											<small>matches: {bucket.doc_count.toLocaleString()}</small>
										</div>
									</label>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if key == 'pigment' && aggregations?.letterHeightAtLeast}
					<section class="filters-group">
						<RangeSlider
							title="Letter height"
							min={0}
							max={100}
							step={1}
							startLabel="At least"
							endLabel="At most"
							bind:selectedRange={selectedLetterHeightRange}
						/>
					</section>
				{/if}
			{/each}
		</section>
	</aside>
{/if}

<style>
	.filters {
		background: var(--surface-1);
		border-radius: var(--radius-2);
		border: var(--border-size-1) solid var(--surface-3);
		box-shadow: var(--shadow-4);
		height: 100vh;
		left: 0;
		overflow-y: auto;
		padding: var(--size-4);
		position: fixed;
		top: 0;
		width: min(500px, 100vw);
		z-index: 10;
	}

	section {
		margin-block: var(--size-4);
	}

	.filters-header {
		align-items: baseline;
		display: flex;
		justify-content: space-between;
		margin-block-start: 0;
	}

	.filters-header h2 {
		font-size: var(--font-size-4);
		margin-block-start: 0;
		margin-block-end: var(--size-4);
	}

	:global(.filters-header .close-button) {
		background: none;
		border: none;
		box-shadow: none;
		color: var(--surface-2);
		font-size: var(--font-size-4);
		margin: 0;
		padding: 0;
	}

	.filters-sort div {
		display: flex;
		gap: var(--size-4);
	}

	h3,
	:global(.filters-groups h3) {
		font-size: var(--font-size-3);
		margin-block-end: var(--size-2);
	}

	.filters-by div {
		align-items: baseline;
		display: flex;
		justify-content: space-between;
	}

	.filters-by hgroup {
		align-items: baseline;
		display: flex;
		gap: var(--size-2);
		margin-block-end: var(--size-2);
	}

	.filters-by ul {
		display: flex;
		gap: var(--size-2);
		list-style: none;
		padding: 0;
	}

	.filters-by ul li {
		padding: 0;
	}

	:global(.filters-by .clear-filters-button) {
		background: transparent;
		border: none;
		box-shadow: none;
		color: var(--surface-2);
		font-size: var(--font-size-1);
		font-weight: normal;
		padding-inline: var(--size-4);
		text-decoration: underline;
	}

	:global(.filters-by .remove-filter-button) {
		background: var(--surface-2);
		border: none;
		box-shadow: none;
		font-size: var(--font-size-1);
		padding-inline: var(--size-4);
		position: relative;
	}

	:global(.filters-by .filter-button::after) {
		content: '×';
		position: absolute;
		right: var(--size-1);
		top: var(--size-00);
		font-weight: normal;
	}

	.filters-group {
		border-top: 1px solid var(--border-color);
		flex: 1;
		min-width: 200px;
		padding-block-start: var(--size-4);
		padding-block-end: var(--size-2);
	}

	.filters-group hgroup {
		margin-block-end: var(--size-2);
	}

	.filters-group .filter-input {
		background: transparent;
		border: 1px solid var(--border-color);
		font-size: var(--font-size-1);
		margin-block-end: var(--size-2);
		padding: var(--size-1) var(--size-2);
		width: 100%;
	}

	.filters-group ul {
		border: 1px solid var(--border-color);
		border-radius: var(--radius-2);
		list-style: none;
		max-height: calc(5 * var(--size-6));
		min-height: calc(5 * var(--size-6));
		overflow-y: auto;
		padding: 0;
		scrollbar-width: thin;

		&::-webkit-scrollbar {
			width: var(--size-1);
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			border-radius: var(--size0);
		}
	}

	.filters-group ul li {
		max-inline-size: 100%;
	}

	.filters-group ul li:hover {
		background: var(--surface-2);
	}

	.filters-group ul li:has(input:checked) {
		background: var(--surface-2);
	}

	.filters-group ul li label {
		align-items: center;
		display: flex;
		gap: var(--size-2);
	}

	.filters-group ul li label div {
		align-items: baseline;
		display: flex;
		justify-content: space-between;
		padding-inline-end: var(--size-2);
		width: 100%;
	}
</style>
