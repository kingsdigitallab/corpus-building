<script>
	import BarView from './views/BarView.svelte';
	import DonutView from './views/DonutView.svelte';
	import HistogramView from './views/HistogramView.svelte';
	import MapView from './views/MapView.svelte';

	let { inscriptions, aggregations } = $props();

	/** @type {string[]} */
	const excludedCategories = [];

	// Viz controls
	let selectedView = $state('map');

	const categories = $derived(
		Object.values(aggregations)
			.filter((aggregation) => !excludedCategories.includes(aggregation.name))
			.map((aggregation) => ({
				value: aggregation.name,
				label: aggregation.title
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	let selectedCategory = $state('inscriptionType');
	const selectedCategoryTitle = $derived(
		categories.find((c) => c.value === selectedCategory)?.label || 'No title'
	);

	let selectedColourBy = $state('');
</script>

<section id="viz-controls">
	<fieldset>
		<label>
			View
			<select name="view" bind:value={selectedView}>
				<option value="bar-stacked">Bar</option>
				<option value="donut">Donut</option>
				<option value="histogram">Histogram</option>
				<option value="map">Map</option>
			</select>
		</label>
		<label>
			Category
			<select
				name="category"
				bind:value={selectedCategory}
				disabled={selectedView === 'map' || selectedView === 'histogram'}
				onchange={() => (selectedColourBy = '')}
			>
				{#each categories as category (category.value)}
					<option value={category.value}>{category.label}</option>
				{/each}
			</select>
		</label>
		<label>
			Split by
			<select
				name="colourBy"
				bind:value={selectedColourBy}
				disabled={selectedView === 'map' || selectedView === 'histogram'}
			>
				<option value="">None</option>
				{#each categories as category (category.value)}
					{#if category.value === selectedCategory}
						<option value={category.value} disabled>{category.label}</option>
					{:else}
						<option value={category.value}>{category.label}</option>
					{/if}
				{/each}
			</select>
		</label>
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
		justify-content: center;
	}

	label:has(select:disabled) {
		opacity: 0.5;
	}

	select:disabled {
		cursor: not-allowed;
	}
</style>
