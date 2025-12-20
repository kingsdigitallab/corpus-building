<script>
	import { VisAxis, VisXYContainer, VisStackedBar, VisTooltip } from '@unovis/svelte';
	import { StackedBar } from '@unovis/ts';

	/** @type {{ inscriptions: any[], height: number, binSize: number }} */
	let { inscriptions, height, binSize } = $props();

	// Histogram data computation
	/** @type {{ key: string, value: number }[]} */
	const histogramData = $derived.by(() => {
		if (!inscriptions?.length) return [];

		// Get min/max dates from valid inscriptions only
		let minDate = Infinity;
		let maxDate = -Infinity;
		for (const item of inscriptions) {
			const nb = /** @type {number | undefined} */ (item.notBefore);
			const na = /** @type {number | undefined} */ (item.notAfter);
			// Only consider inscriptions with valid date ranges
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
			// Skip inscriptions with missing or invalid date ranges
			if (nb === undefined || na === undefined || nb > na) continue;

			// Find all bins this inscription overlaps
			for (let start = binStart; start < binEnd; start += binSize) {
				const binEndDate = start + binSize;
				// Check if [nb, na] overlaps [start, binEndDate)
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

	/** @type {(d: unknown, i: number) => number} */
	const x = (_, i) => i;
	const y = $derived((/** @type {{ value: number }} */ d) => d.value);
	const yDomain = $derived(/** @type {[number, number]} */ ([0, histogramData.length - 1]));

	// Limit tick labels to prevent overlap
	const maxTicks = $derived(Math.floor(height / 25));
	const tickStep = $derived(
		histogramData.length > maxTicks ? Math.ceil(histogramData.length / maxTicks) : 1
	);
	const numTicks = $derived(Math.ceil(histogramData.length / tickStep));
	const tickFormat = $derived((/** @type {number} */ tick) => histogramData[tick]?.key || tick);
	const tickValues = $derived(
		Array.from({ length: histogramData.length }, (_, i) => i).filter((i) => i % tickStep === 0)
	);

	// Tooltip
	const triggers = $derived({
		[StackedBar.selectors.bar]: getTooltip
	});

	/** @param {{ key: string, value: number }} bar */
	function getTooltip(bar) {
		return `<h6 class="legend-title">${bar.key}</h6>${bar.value.toLocaleString()} inscriptions`;
	}
</script>

<VisXYContainer data={histogramData} {height} yDirection="south" {yDomain}>
	<VisStackedBar {x} {y} barPadding={0.1} orientation="horizontal" />
	<VisAxis type="x" label="Inscription count" />
	<VisAxis type="y" label="Date range" gridLine={false} {numTicks} {tickFormat} {tickValues} />
	<VisTooltip {triggers} />
</VisXYContainer>
