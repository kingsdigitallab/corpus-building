<script>
	import VizWrapper from '../VizWrapper.svelte';
	import HistogramChart from '../charts/HistogramChart.svelte';

	/** 
	 * @type {{ 
	 *   inscriptions: any[]
	 * }} 
	 */
	let { inscriptions } = $props();

	// Settings state
	let binSize = $state(50);

	// Histogram data computation
	/** @type {{ key: string, value: number }[]} */
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

		// Create bins
		/** @type {Map<number, number>} */
		const bins = new Map();
		for (let start = binStart; start < binEnd; start += binSize) {
			bins.set(start, 0);
		}

		// Count inscriptions in each bin (full range approach)
		for (const item of inscriptions) {
			const nb = /** @type {number | undefined} */ (item.notBefore);
			const na = /** @type {number | undefined} */ (item.notAfter);
			if (nb === undefined || na === undefined || nb > na) continue;

			for (let start = binStart; start < binEnd; start += binSize) {
				const binEndDate = start + binSize;
				if (nb < binEndDate && na >= start) {
					bins.set(start, (bins.get(start) || 0) + 1);
				}
			}
		}

		// Convert to array with formatted labels
		/** @param {number} year @returns {string} */
		const formatYear = (year) => (year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`);

		return [...bins.entries()]
			.filter(([_, count]) => count > 0)
			.sort((a, b) => a[0] - b[0])
			.map(([start, count]) => ({
				key: `${formatYear(start)} – ${formatYear(start + binSize)}`,
				value: count
			}));
	});

	// Summary
	const summary = $derived(
		`${inscriptions?.length.toLocaleString() || 0} inscriptions by date in ${binSize}-year intervals.
		<br/><small>Inscriptions with uncertain dates may appear in multiple bins.</small>`
	);
</script>

<VizWrapper 
	title="Date Distribution" 
	{summary} 
	{data}
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
		<HistogramChart {inscriptions} {height} {binSize} />
	{/snippet}
</VizWrapper>
