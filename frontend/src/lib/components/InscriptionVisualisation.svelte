<script>
	import { VisAxis, VisXYContainer, VisStackedBar } from '@unovis/svelte';
	import InscriptionMap from './InscriptionMap.svelte';

	let { inscriptions, aggregations } = $props();

	let selectedView = $state('bar-stacked');

	const categories = $derived(
		Object.values(aggregations).map((aggregation) => ({
			value: aggregation.name,
			label: aggregation.title
		}))
	);

	let selectedCategory = $state('inscriptionType');
	const selectedCategoryBuckets = $derived(aggregations[selectedCategory]?.buckets || []);

	let selectedColourBy = $state('');

	let maxCategories = $state(10);
	let height = $state(400);

	const data = $derived(selectedCategoryBuckets.slice(0, maxCategories));
	const domain = $derived([0, data.length - 1]);

	const xLabel = 'Inscription count';
	const yLabel = $derived(aggregations[selectedCategory]?.title || 'No title');
	const numTicks = $derived(data.length);
	const tickFormat = $derived((tick) => data[tick]?.key || tick);
	const tickValues = $derived(Array.from({ length: numTicks }, (_, i) => i));
</script>

<section id="viz-controls">
	<fieldset>
		<label>
			View
			<select name="view" bind:value={selectedView}>
				<option value="bar-stacked">Bar</option>
				<option value="donut">Donut</option>
				<option value="map" selected>Map</option>
			</select>
		</label>
		<label>
			Category
			<select name="category" bind:value={selectedCategory} disabled={selectedView === 'map'}>
				{#each categories as category (category.value)}
					<option value={category.value}>{category.label}</option>
				{/each}
			</select>
		</label>
		<label>
			Colour by
			<select name="colourBy" bind:value={selectedColourBy} disabled={selectedView === 'map'}>
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

<section id="viz-settings">
	{#if selectedView !== 'map'}
		<fieldset>
			<label>
				Max categories ({maxCategories})
				<input
					type="range"
					min={Math.min(2, selectedCategoryBuckets.length)}
					max={Math.min(selectedCategoryBuckets.length, 50)}
					step="1"
					bind:value={maxCategories}
					aria-label="Adjust max categories"
				/>
				<small>Move the slider to adjust the maximum number of categories</small>
			</label>
			<label>
				Chart height ({height}px)
				<input
					type="range"
					min="200"
					max="2000"
					step="10"
					bind:value={height}
					aria-label="Adjust chart height"
				/>
				<small>Move the slider to adjust the chart height</small>
			</label>
		</fieldset>
	{/if}
</section>

<section id="viz-container">
	{#if selectedView === 'map'}
		<InscriptionMap {inscriptions} />
	{:else if selectedView === 'bar-stacked'}
		<VisXYContainer {data} {height} yDirection="south" yDomain={domain}>
			<VisStackedBar
				x={(_, i) => i}
				y={(d) => d.doc_count}
				barPadding={0.1}
				orientation="horizontal"
			/>
			<VisAxis type="x" label={xLabel} />
			<VisAxis type="y" label={yLabel} gridLine={false} {numTicks} {tickFormat} {tickValues} />
		</VisXYContainer>
	{:else if selectedView === 'donut'}
		<p>🍩</p>
	{:else}
		<code>If you are seeing this, something went wrong!</code>
	{/if}
</section>

<style>
	:global(body, html) {
		--vis-color-main: var(--surface-3);
		--vis-color0: var(--vis-color-main);

		--vis-font-family: var(--font-family);

		--vis-nested-donut-segment-label-font-size: 0.875em;
	}

	fieldset {
		border: none;
	}

	#viz-controls fieldset {
		display: flex;
		justify-content: space-around;
	}

	#viz-settings fieldset {
		display: flex;
		justify-content: space-between;
		padding-inline: var(--size-4);
		width: 100%;
	}

	#viz-settings fieldset * {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-inline-size: unset;
		padding-bottom: var(--size-4);
	}
</style>
