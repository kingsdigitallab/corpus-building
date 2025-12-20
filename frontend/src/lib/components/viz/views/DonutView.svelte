<script>
	import pluralize from 'pluralize-esm';
	import VizWrapper from '../VizWrapper.svelte';
	import DonutChart from '../charts/DonutChart.svelte';

	const HIERARCHY_SEPARATOR = ':::';
	const HIERARCHY_SEPARATOR_LABEL = '>';

	/** @type {string[]} */
	const excludedCategories = [];

	/** @param {string | undefined} key */
	const formatKey = (key) =>
		key?.replaceAll(HIERARCHY_SEPARATOR, ` ${HIERARCHY_SEPARATOR_LABEL} `) ?? '';

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

	// Settings state
	let maxCategories = $state(6);

	// Helper to get values as array
	/** @param {Record<string, unknown>} item @param {string} field @returns {unknown[]} */
	const getValuesAsArray = (item, field) => {
		const value = item[field];
		if (Array.isArray(value)) return value;
		if (value !== undefined && value !== null) return [value];
		return [];
	};

	// Data computation (same as BarView)
	const data = $derived.by(() => {
		if (!inscriptions?.length) {
			const buckets = [
				...(aggregations[selectedCategory]?.buckets.filter(
					/** @param {{ key: string }} bucket */ (bucket) =>
						!excludedCategories.includes(bucket.key)
				) || [])
			];
			return buckets
				.sort((a, b) => b.doc_count - a.doc_count)
				.slice(0, maxCategories)
				.map((b) => ({
					key: formatKey(b.key),
					value: b.doc_count
				}));
		}

		/** @type {Map<string, { count: number, items: any[] }>} */
		const categoryMap = new Map();
		for (const item of inscriptions) {
			const values = getValuesAsArray(item, selectedCategory);
			for (const v of values) {
				const key = String(v);
				if (excludedCategories.includes(key)) continue;
				if (!categoryMap.has(key)) categoryMap.set(key, { count: 0, items: [] });
				const entry = /** @type {{ count: number, items: any[] }} */ (categoryMap.get(key));
				entry.count++;
				entry.items.push(item);
			}
		}

		const sortedKeys = [...categoryMap.entries()]
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, maxCategories)
			.map(([key]) => key);

		if (!selectedColourBy) {
			return sortedKeys.map((key) => ({
				key: formatKey(key),
				value: categoryMap.get(key)?.count || 0
			}));
		}

		const colourByBuckets = aggregations[selectedColourBy]?.buckets || [];
		const validColourByKeys = new Set(
			colourByBuckets.map((/** @type {{ key: string }} */ b) => b.key)
		);

		const result = sortedKeys
			.map((categoryKey) => {
				const items = categoryMap.get(categoryKey)?.items || [];
				/** @type {Record<string, number>} */
				const counts = {};
				for (const item of items) {
					const groupValues = getValuesAsArray(item, selectedColourBy);
					for (const gv of groupValues) {
						const key = String(gv);
						if (validColourByKeys.has(key)) {
							counts[key] = (counts[key] || 0) + 1;
						}
					}
				}
				return {
					key: formatKey(categoryKey),
					value: Object.values(counts).reduce((sum, c) => sum + c, 0),
					...counts
				};
			})
			.filter((d) => Object.keys(d).length > 2);

		return result;
	});

	// Colour-by keys
	const selectedColourByKeys = $derived.by(() => {
		if (!selectedColourBy) return [];
		const buckets =
			aggregations[selectedColourBy]?.buckets.filter(
				/** @param {{ key: string }} bucket */ (bucket) => !excludedCategories.includes(bucket.key)
			) || [];
		return [...buckets].sort((a, b) => b.doc_count - a.doc_count).map((b) => b.key);
	});

	const activeColourByKeys = $derived.by(() => {
		if (!selectedColourBy || !data.length) return [];
		return selectedColourByKeys.filter((key) =>
			data.some((d) => {
				const item = /** @type {Record<string, unknown>} */ (d);
				return typeof item[key] === 'number' && /** @type {number} */ (item[key]) > 0;
			})
		);
	});

	// Summary
	const summary = $derived.by(() => {
		if (!data?.length) return 'No data available.';

		const totalItems = inscriptions?.length || 0;
		const categoryCount = data.length;
		const categoryLabel = pluralize(selectedCategoryTitle.toLowerCase(), categoryCount);

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
		[...(aggregations[selectedCategory]?.buckets || [])].sort((a, b) => b.doc_count - a.doc_count)
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
				max={Math.min(selectedCategoryBuckets.length, 12)}
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
