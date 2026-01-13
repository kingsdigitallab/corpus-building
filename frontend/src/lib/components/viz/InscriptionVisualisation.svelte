<script>
	import BarView from './views/BarView.svelte';
	import DonutView from './views/DonutView.svelte';
	import HistogramView from './views/HistogramView.svelte';
	import MapView from './views/MapView.svelte';

	let { inscriptions, aggregations } = $props();

	/** @type {string[]} */
	const excludedCategories = [];

	// Viz controls
	let selectedCategory = $state('provenance');
	const selectedCategoryTitle = $derived(
		categories.find((c) => c.value === selectedCategory)?.label || 'No title'
	);

	function handleCategoryChange() {
		selectedColourBy = '';
		selectedView = 'bar-stacked';
	}

	let selectedColourBy = $state('');

	let selectedView = $state(selectedCategory === 'provenance' ? 'map' : 'bar-stacked');

	const categories = $derived(
		Object.values(aggregations)
			.filter((aggregation) => !excludedCategories.includes(aggregation.name))
			.map((aggregation) => ({
				value: aggregation.name,
				label: aggregation.title,
				count: aggregation.buckets.length,
				disabledColourBy:
					aggregation.name === selectedCategory ||
					aggregation.buckets.length === 0 ||
					aggregation.buckets.length >= 12
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	const isColourByDisabled = $derived(['histogram', 'map'].includes(selectedView));
	const isHistogramDisabled = $derived(!['notAfter', 'notBefore'].includes(selectedCategory));
	const isMapDisabled = $derived(selectedCategory !== 'provenance');
</script>

<section id="viz-controls">
	<fieldset>
		<div class="control">
			<label for="category">Category</label>
			<select
				id="category"
				name="category"
				bind:value={selectedCategory}
				onchange={() => handleCategoryChange()}
				aria-describedby="category-help"
			>
				{#each categories as category (category.value)}
					<option value={category.value}>{category.label}</option>
				{/each}
			</select>
			<p id="category-help">
				<small>Choose a category to group inscriptions by in the chart.</small>
			</p>
		</div>
		<div class="control">
			<label for="chartType">Chart type</label>
			<select
				id="chartType"
				name="chartType"
				bind:value={selectedView}
				aria-describedby="chartType-help"
			>
				<option value="bar-stacked">Bar</option>
				<option value="donut">Donut</option>
				<option value="histogram" disabled={isHistogramDisabled}>Histogram</option>
				<option value="map" disabled={isMapDisabled}>Map</option>
			</select>
			<p id="chartType-help">
				<small
					>Switch between chart types; some are disabled depending on the selected category.</small
				>
			</p>
		</div>
		<div class="control">
			<label for="colourBy">Split by</label>
			<select
				id="colourBy"
				name="colourBy"
				bind:value={selectedColourBy}
				disabled={isColourByDisabled}
				aria-describedby="colourBy-help"
			>
				<option value="">None</option>
				{#each categories as category (category.value)}
					<option
						value={category.value}
						disabled={category.disabledColourBy}
						title={category.disabledColourBy
							? 'Too many values, filter results to enable option'
							: ''}>{category.label}</option
					>
				{/each}
			</select>
			<p id="colourBy-help">
				<small
					>Select a category to segment the data. Options with too many values are disabled; filter
					your results further to enable them.</small
				>
			</p>
		</div>
	</fieldset>
</section>

{#if selectedView === 'bar-stacked'}
	<BarView
		{inscriptions}
		{aggregations}
		{selectedCategory}
		{selectedCategoryTitle}
		{selectedColourBy}
	/>
{:else if selectedView === 'donut'}
	<DonutView
		{inscriptions}
		{aggregations}
		{selectedCategory}
		{selectedCategoryTitle}
		{selectedColourBy}
	/>
{:else if selectedView === 'histogram'}
	<HistogramView {inscriptions} />
{:else if selectedView === 'map'}
	<MapView {inscriptions} />
{/if}

<style>
	:global(body, html) {
		--vis-font-family: var(--font-family);

		--vis-color-main: var(--surface-3);

		--vis-color0: var(--vis-color-main);
		--vis-color1: #c7956d;
		--vis-color2: #d4a574;
		--vis-color3: #8b9e6b;
		--vis-color4: #5d8a83;
		--vis-color5: #7a6b8a;

		--vis-dark-color0: var(--vis-color-main);
		--vis-dark-color1: #e88a96;
		--vis-dark-color2: #e8c088;
		--vis-dark-color3: #a3c085;
		--vis-dark-color4: #4db8a6;
		--vis-dark-color5: #8b96cc;

		--vis-axis-label-color: var(--text-1);
		--vis-axis-tick-label-color: var(--text-1);
		--vis-legend-label-color: var(--text-1);

		--vis-nested-donut-segment-label-font-size: 0.875em;
	}

	:global(.legend-title) {
		font-variant: small-caps;
		padding-bottom: var(--size-2);
	}

	fieldset {
		border: none;
	}

	#viz-controls {
		margin-block: var(--size-4);
	}

	#viz-controls fieldset {
		display: flex;
		gap: var(--size-10);
		justify-content: space-between;
	}

	.control p {
		max-inline-size: var(--size-content-2);
	}

	.control:has(select:disabled) {
		opacity: 0.5;
	}

	select:disabled {
		cursor: not-allowed;
	}
</style>
