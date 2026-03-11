<script>
	import VizWrapper from '../VizWrapper.svelte';
	import LineChart from '../charts/LineChart.svelte';
	import { formatKey } from '../utils.js';
	import { computeHistogramData, computeActiveColourByKeys } from '../data.js';

	/** 
	 * @type {{ 
	 *   inscriptions: any[],
	 *   aggregations: Record<string, any>,
	 *   selectedCategoryTitle: string,
	 *   selectedColourBy: string
	 * }} 
	 */
	let { inscriptions, aggregations, selectedCategoryTitle, selectedColourBy } = $props();

	let binSize = $state(50);

	/** @type {string[]} */
	const excludedCategories = [];

	const data = $derived(
		computeHistogramData({
			inscriptions,
			aggregations,
			binSize,
			selectedColourBy
		})
	);

	const activeColourByKeys = $derived(
		computeActiveColourByKeys({
			data,
			aggregations,
			selectedColourBy,
			excludedCategories
		})
	);

	const summary = $derived.by(() => {
		const label = `${inscriptions?.length.toLocaleString() || 0} inscriptions by date in ${binSize}-year intervals.`;
		const helpText = `<br/><small>Inscriptions with uncertain dates may appear in multiple bins.</small>`;

		if (selectedColourBy) return `${label} Split by <strong>${selectedColourBy}</strong>.${helpText}`;
		return `${label}${helpText}`;
	});
</script>

<VizWrapper 
	title="{selectedCategoryTitle}"
	{summary}
	{data}
	columns={activeColourByKeys}
	{formatKey}
>
	{#snippet settingsSlot()}
		<label>
			Bin size ({binSize} years)
			<input
				type="range"
				min="5"
				max="100"
				step="5"
				bind:value={binSize}
				aria-label="Adjust bin size"
			/>
			<small>Move the slider to adjust the date bin size</small>
		</label>
	{/snippet}

	{#snippet children(height)}
		<LineChart 
			{data}
			{height} 
			{binSize} 
			colourByKeys={activeColourByKeys}
			{formatKey}
		/>
	{/snippet}
</VizWrapper>
