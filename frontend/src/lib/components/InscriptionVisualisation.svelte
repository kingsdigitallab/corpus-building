<script>
	import InscriptionMap from './InscriptionMap.svelte';

	let { inscriptions, aggregations } = $props();

	let selectedView = $state('map');
	let selectedCategory = $state('inscriptionType');
	let selectedColourBy = $state('');

	const categories = Object.values(aggregations).map((aggregation) => ({
		value: aggregation.name,
		label: aggregation.title
	}));
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

<section id="viz-container">
	{#if selectedView === 'map'}
		<InscriptionMap {inscriptions} />
	{:else if selectedView === 'bar-stacked'}
		<p>The bars are stacked!</p>
	{:else if selectedView === 'donut'}
		<p>🍩</p>
	{:else}
		<code>If you are seeing this, something went wrong!</code>
	{/if}
</section>

<style>
	#viz-controls fieldset {
		display: flex;
		justify-content: space-around;
	}
</style>
