<script>
	import pluralize from 'pluralize-esm';
	import VizWrapper from '../VizWrapper.svelte';
	import DonutChart from '../charts/DonutChart.svelte';
	import { formatKey, getLeaves } from '../utils.js';
	import { computeCategoryData, computeActiveColourByKeys } from '../data.js';

	/** @type {string[]} */
	const excludedCategories = [];

	/** 
	 * @type {{ 
	 *   inscriptions: any[],
	 *   aggregations: Record<string, any>,
	 *   selectedCategory: string,
	 *   selectedCategoryTitle: string,
	 *   selectedColourBy: string
	 * }} 
	 */
	let { 
		inscriptions, 
		aggregations, 
		selectedCategory,
		selectedCategoryTitle,
		selectedColourBy
	} = $props();

	let maxCategories = $state(6);

	const data = $derived(
		computeCategoryData({ 
			inscriptions, 
			aggregations, 
			selectedCategory, 
			selectedColourBy, 
			maxCategories, 
			excludedCategories 
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
		if (!data?.length) return 'No data available.';

		const totalItems = inscriptions?.length || 0;
		const categoryCount = data.length;
		const categoryLabel = 
			['notAfter', 'notBefore', 'letterHeightAtLeast', 'letterHeightAtMost'].includes(selectedCategory) 
				? selectedCategoryTitle.toLowerCase() 
				: pluralize(selectedCategoryTitle.toLowerCase(), categoryCount);

		const maxCategory = data.reduce((max, curr) => (curr.value > max.value ? curr : max), data[0]);
		const minCategory = data.reduce((min, curr) => (curr.value < min.value ? curr : min), data[0]);
		const maxPercent = ((maxCategory.value / totalItems) * 100).toFixed(1);
		const minPercent = ((minCategory.value / totalItems) * 100).toFixed(1);
		const average = Math.round(totalItems / categoryCount);

		const parts = [];
		parts.push(
			`<strong>${totalItems.toLocaleString()}</strong> inscriptions across <strong>${categoryCount}</strong> ${categoryLabel}`
		);

		if (categoryCount > 1) {
			parts.push(
				`<em>${maxCategory.key.charAt(0).toUpperCase() + maxCategory.key.slice(1)}</em> has the most with ${maxCategory.value.toLocaleString()} (${maxPercent}%)`
			);
			if (minCategory.key !== maxCategory.key) {
				parts.push(
					`<em>${minCategory.key.charAt(0).toUpperCase() + minCategory.key.slice(1)}</em> has the fewest with ${minCategory.value.toLocaleString()} (${minPercent}%)`
				);
			}
			parts.push(
				`Average is <strong>${average.toLocaleString()}</strong> per ${selectedCategoryTitle.toLowerCase()}`
			);
		}

		if (selectedColourBy) {
			parts.push(`Split by <strong>${selectedColourBy}</strong>`);
		}

		return parts.join('. ') + '.';
	});

	const selectedCategoryBuckets = $derived(
		getLeaves([...(aggregations[selectedCategory]?.buckets || [])]).sort((a, b) => b.doc_count - a.doc_count)
	);
</script>

<VizWrapper 
	title={selectedCategoryTitle} 
	{summary} 
	{data}
	columns={activeColourByKeys}
	{formatKey}
>
	{#snippet settingsSlot()}
		<label>
			Max categories ({maxCategories})
			<input
				type="range"
				min={Math.min(2, selectedCategoryBuckets.length)}
				max={Math.min(selectedCategoryBuckets.length, 18)}
				step="1"
				bind:value={maxCategories}
				aria-label="Adjust max categories"
			/>
			<small>Move the slider to adjust the maximum number of categories</small>
		</label>
	{/snippet}

	{#snippet children(height)}
		<DonutChart 
			{data} 
			{height}
			colourByKeys={activeColourByKeys}
			{formatKey}
		/>
	{/snippet}
</VizWrapper>
