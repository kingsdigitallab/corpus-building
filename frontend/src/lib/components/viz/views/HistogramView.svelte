<script>
	import VizWrapper from '../VizWrapper.svelte';
	import HistogramChart from '../charts/HistogramChart.svelte';
	import { formatKey, getLeaves } from '../utils.js';

	/** 
	 * @type {{ 
	 *   inscriptions: any[],
	 *   aggregations: Record<string, any>,
	 *   selectedColourBy: string
	 * }} 
	 */
	let { inscriptions, aggregations, selectedColourBy } = $props();

	// Settings state
	let binSize = $state(50);

	/** @type {string[]} */
	const excludedCategories = [];

	// Helper to get values as array
	/** @param {Record<string, unknown>} item @param {string} field @returns {unknown[]} */
	const getValuesAsArray = (item, field) => {
		const value = item[field];
		if (Array.isArray(value)) return value;
		if (value !== undefined && value !== null) return [value];
		return [];
	};

	// Histogram data computation
	/** @type {Array<any>} */
	const data = $derived.by(() => {
		if (!inscriptions?.length) return [];

		// Get min/max dates from valid inscriptions only
		let minDate = Infinity;
		let maxDate = -Infinity;
		for (const item of inscriptions) {
			const nb = /** @type {number | undefined} */ (item.notBefore);
			const na = /** @type {number | undefined} */ (item.notAfter);
			if (nb === undefined || na === undefined || nb > na) continue;
			if (nb < minDate) minDate = nb;
			if (na > maxDate) maxDate = na;
		}

		if (minDate === Infinity || maxDate === -Infinity) return [];

		// Align bins to nice boundaries
		const binStart = Math.floor(minDate / binSize) * binSize;
		const binEnd = Math.ceil(maxDate / binSize) * binSize;

		// Create bins map where values are objects tracking total count, and individual counts per selected category
		/** @type {Map<number, Record<string, any>>} */
		const bins = new Map();
		for (let start = binStart; start < binEnd; start += binSize) {
			bins.set(start, { value: 0 });
		}

		// Calculate valid subset of category variables
		const colourByBuckets = selectedColourBy ? (aggregations[selectedColourBy]?.buckets || []) : [];
		const validColourByKeys = new Set(
			colourByBuckets.map((/** @type {{ key: string }} */ b) => b.key)
		);

		// Count inscriptions in each bin (full range approach)
		for (const item of inscriptions) {
			const nb = /** @type {number | undefined} */ (item.notBefore);
			const na = /** @type {number | undefined} */ (item.notAfter);
			if (nb === undefined || na === undefined || nb > na) continue;

			for (let start = binStart; start < binEnd; start += binSize) {
				const binEndDate = start + binSize;
				if (nb < binEndDate && na >= start) {
					const binObj = bins.get(start) || { value: 0 };
					binObj.value += 1;

					if (selectedColourBy) {
						const groupValues = getValuesAsArray(item, selectedColourBy);
						for (const gv of groupValues) {
							const k = String(gv);
							if (validColourByKeys.has(k)) {
								binObj[k] = (binObj[k] || 0) + 1;
							}
						}
					}
					bins.set(start, binObj);
				}
			}
		}

		// Convert to array with formatted labels
		/** @param {number} year @returns {string} */
		const formatYear = (year) => (year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`);

		return [...bins.entries()]
			.filter(([_, countsObj]) => countsObj.value > 0)
			.sort((a, b) => a[0] - b[0])
			.map(([start, countsObj]) => ({
				key: `${formatYear(start)} – ${formatYear(start + binSize)}`,
				...countsObj
			}));
	});

	// Colour-by keys that have counts > 0
	const selectedColourByKeys = $derived.by(() => {
		if (!selectedColourBy) return [];
		const buckets = getLeaves(
			aggregations[selectedColourBy]?.buckets.filter(
				/** @param {{ key: string }} bucket */ (bucket) => !excludedCategories.includes(bucket.key)
			) || []
		);
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
		const label = `${inscriptions?.length.toLocaleString() || 0} inscriptions by date in ${binSize}-year intervals.`;
		const helpText = `<br/><small>Inscriptions with uncertain dates may appear in multiple bins.</small>`;
		
		if (selectedColourBy) return `${label} Split by <strong>${selectedColourBy}</strong>.${helpText}`;
		return `${label}${helpText}`;
	});
</script>

<VizWrapper 
	title="Date Distribution" 
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
		<HistogramChart 
			{inscriptions} 
			{data}
			{height} 
			{binSize} 
			colourByKeys={activeColourByKeys}
			{formatKey}
		/>
	{/snippet}
</VizWrapper>
