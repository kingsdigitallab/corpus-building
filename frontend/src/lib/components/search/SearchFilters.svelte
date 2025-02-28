<script>
	import { Button } from 'bits-ui';
	import { slide } from 'svelte/transition';
	import RangeSlider from './RangeSlider.svelte';

	let {
		show = false,
		aggregations = {},
		sortAggregationsBy = $bindable('key'),
		selectedDateRange = $bindable([0, 0]),
		selectedLetterHeightRange = $bindable([0, 0]),
		selectedFilters = $bindable({})
	} = $props();

	const sortAggregationsOptions = [
		{ label: 'Value', value: 'key' },
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
		<Button.Root class="close-button" onclick={handleClose} aria-label="Close filters"
			>×</Button.Root
		>
		<section>
			<h2>Filters</h2>
			<section class="filters-options">
				<h3>Options</h3>
				<form>
					<fieldset>
						<legend>Sort filters by</legend>
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
					</fieldset>
				</form>
			</section>
			<section class="filters-groups">
				{#if aggregations?.notBefore}
					<section class="filter-group">
						<RangeSlider
							title="Date"
							min={-700}
							max={1830}
							step={1}
							startLabel="Not before"
							endLabel="Not after"
							bind:selectedRange={selectedDateRange}
						/>
					</section>
				{/if}
				{#each Object.keys(selectedFilters) as key}
					{#if key in aggregations && aggregations[key].title}
						<section class="filter-group">
							<h3>{aggregations[key].title} ({aggregations[key].buckets.length})</h3>
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
											{getBucketDisplayValue(bucket.key)} ({bucket.doc_count})
										</label>
									</li>
								{/each}
							</ul>
						</section>
					{/if}

					{#if key == 'pigment' && aggregations?.letterHeightAtLeast}
						<section class="filter-group">
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
		</section>
	</aside>
{/if}

<style>
	section {
		margin-block: var(--size-4);
	}

	.filters {
		background: var(--surface-4);
		border-radius: var(--radius-2);
		border: var(--border-size-1) solid var(--surface-3);
		box-shadow: var(--shadow-4);
		height: 100vh;
		left: 0;
		overflow-y: auto;
		padding: var(--size-4);
		position: fixed;
		top: 0;
		width: min(400px, 100vw);
		z-index: 10;
	}

	:global(.close-button) {
		background: transparent;
		border: none;
		box-shadow: var(--shadow-1);
		position: absolute;
		right: 1rem;
		top: 1rem;
	}

	h2 {
		font-size: var(--font-size-4);
		margin-block-end: var(--size-4);
		margin-block-start: var(--size-8);
	}

	.filters-options fieldset {
		padding: 0;
	}

	.filters-options label {
		display: block;
	}

	.filter-group {
		flex: 1;
		min-width: 200px;
	}

	:global(h3) {
		font-size: var(--font-size-2);
		margin-block-end: var(--size-2);
	}

	.filter-group .date-inputs {
		display: flex;
		gap: var(--size-2);
		justify-content: space-between;
		width: 100%;
	}

	.filter-group ul {
		background: var(--surface-2);
		border-radius: var(--radius-2);
		list-style: none;
		max-height: calc(5 * var(--size-6));
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

	.filter-input {
		font-size: var(--font-size-1);
		margin-block-end: var(--size-2);
		padding: var(--size-1) var(--size-2);
		width: 100%;
	}
</style>
