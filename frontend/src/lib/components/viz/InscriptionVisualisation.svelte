<script>
	import pluralize from 'pluralize-esm';
	import InscriptionMap from './InscriptionMap.svelte';
	import HistogramChart from './HistogramChart.svelte';
	import BarChart from './BarChart.svelte';
	import DonutChart from './DonutChart.svelte';
	import { DownloadIcon, TableIcon } from 'lucide-svelte';

	let { inscriptions, aggregations } = $props();

	const HIERARCHY_SEPARATOR = ':::';
	const HIERARCHY_SEPARATOR_LABEL = '>';

	/** @type {string[]} */
	const excludedCategories = [];

	/** @param {string | undefined} key */
	const formatKey = (key) =>
		key?.replaceAll(HIERARCHY_SEPARATOR, ` ${HIERARCHY_SEPARATOR_LABEL} `) ?? '';

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
	const selectedCategoryBuckets = $derived(
		[...(aggregations[selectedCategory]?.buckets || [])].sort((a, b) => b.doc_count - a.doc_count)
	);

	let selectedColourBy = $state('');
	const selectedColourByKeys = $derived.by(() => {
		if (!selectedColourBy) return [];
		const buckets =
			aggregations[selectedColourBy]?.buckets.filter(
				/** @param {{ key: string }} bucket */ (bucket) => !excludedCategories.includes(bucket.key)
			) || [];
		return [...buckets].sort((a, b) => b.doc_count - a.doc_count).map((b) => b.key);
	});

	// Viz settings
	let maxCategories = $state(6);
	let histogramBinSize = $state(50);
	let height = $state(550);

	let showDataTable = $state(false);

	// Viz data
	const data = $derived.by(() => {
		// Helper to get values as array (handles both array and string fields)
		/** @param {Record<string, unknown>} item @param {string} field @returns {unknown[]} */
		const getValuesAsArray = (item, field) => {
			const value = item[field];
			if (Array.isArray(value)) return value;
			if (value !== undefined && value !== null) return [value];
			return [];
		};

		// If no inscriptions, fall back to aggregation buckets (for initial load)
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

		// Build counts from inscriptions (filtered search results)
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

		// Sort by count and limit to maxCategories
		const sortedKeys = [...categoryMap.entries()]
			.sort((a, b) => b[1].count - a[1].count)
			.slice(0, maxCategories)
			.map(([key]) => key);

		// Simple case: no split-by selected
		if (!selectedColourBy) {
			return sortedKeys.map((key) => ({
				key: formatKey(key),
				value: categoryMap.get(key)?.count || 0
			}));
		}

		// Get valid colourBy keys from aggregations
		const colourByBuckets = aggregations[selectedColourBy]?.buckets || [];
		const validColourByKeys = new Set(
			colourByBuckets.map((/** @type {{ key: string }} */ b) => b.key)
		);

		// For each category, count items by colourBy value
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

	const summary = $derived.by(() => {
		if (!data || data.length === 0) {
			return 'No data available.';
		}

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
			const colourByTitle =
				categories.find((c) => c.value === selectedColourBy)?.label || selectedColourBy;
			parts.push(`Split by <strong>${colourByTitle}</strong>`);
		}

		return parts.join('. ') + '.';
	});

	// Colour-by keys that have at least one count > 0 in the current data
	const activeColourByKeys = $derived.by(() => {
		if (!selectedColourBy || !data.length) return [];
		return selectedColourByKeys.filter((key) =>
			data.some((d) => {
				const item = /** @type {Record<string, unknown>} */ (d);
				return typeof item[key] === 'number' && /** @type {number} */ (item[key]) > 0;
			})
		);
	});

	// Data download
	let isDownloading = $state(false);

	async function downloadData() {
		isDownloading = true;

		const csv = dataToCSV(data);
		await downloadFile(
			csv,
			`${selectedCategory.toLowerCase()}${selectedColourBy ? `-${selectedColourBy}` : ''}.csv`
		);

		isDownloading = false;
	}

	/**
	 * @param {Record<string, unknown>[]} data
	 * @returns {string}
	 */
	function dataToCSV(data) {
		const headers = ['Category', 'Count', ...activeColourByKeys];
		const rows = data.map((d) => [
			d.key,
			d.value,
			...activeColourByKeys.map((key) => d[key] || '-')
		]);

		return [headers, ...rows].map((row) => row.join(',')).join('\n');
	}

	/**
	 * @param {string} content
	 * @param {string} filename
	 */
	async function downloadFile(content, filename) {
		const blob = new Blob([content], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}
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

<section id="viz-settings">
	{#if selectedView !== 'map' && selectedView !== 'histogram'}
		<fieldset>
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
	{:else if selectedView === 'histogram'}
		<fieldset>
			<label>
				Bin size ({histogramBinSize} years)
				<input
					type="range"
					min="5"
					max="100"
					step="5"
					bind:value={histogramBinSize}
					aria-label="Adjust bin size"
				/>
				<small>Move the slider to adjust the date bin size</small>
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

<section id="viz-summary">
	<hgroup>
		<h3>
			{#if selectedView === 'map'}
				Map
			{:else if selectedView === 'histogram'}
				Date Distribution
			{:else}
				{selectedCategoryTitle}
			{/if}
		</h3>
		{#if selectedView === 'map'}
			<p>Geographical distribution of inscriptions.</p>
		{:else if selectedView === 'histogram'}
			<p>
				{inscriptions?.length.toLocaleString() || 0} inscriptions by date in {histogramBinSize}-year
				intervals.
			</p>
			<p><small>Inscriptions with uncertain dates may appear in multiple bins.</small></p>
		{:else}
			<p>{@html summary}</p>
		{/if}
	</hgroup>
</section>

<section id="viz-container">
	{#if selectedView === 'map'}
		<InscriptionMap {inscriptions} />
	{:else if selectedView === 'bar-stacked'}
		<BarChart
			{data}
			{height}
			categoryTitle={selectedCategoryTitle}
			colourByKeys={activeColourByKeys}
			{formatKey}
		/>
	{:else if selectedView === 'donut'}
		<DonutChart {data} {height} colourByKeys={activeColourByKeys} {formatKey} />
	{:else if selectedView === 'histogram'}
		<HistogramChart {inscriptions} {height} binSize={histogramBinSize} />
	{:else}
		<code>If you are seeing this, something went wrong!</code>
	{/if}
</section>

{#if selectedView !== 'map'}
	<section id="viz-data">
		<p>
			<button class="surface-2" onclick={() => (showDataTable = !showDataTable)}>
				<TableIcon />{showDataTable ? 'Hide' : 'Show'} data
			</button>
		</p>
		{#if showDataTable}
			<table>
				<thead class="surface-1">
					<tr>
						<th class="surface-4">{selectedCategoryTitle}</th>
						<th class="surface-4">Count</th>
						{#each activeColourByKeys as key (key)}
							<th class="surface-4">{formatKey(key)}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each data as d (d.key)}
						<tr>
							<td>{d.key}</td>
							<td class="number">{d.value.toLocaleString()}</td>
							{#each activeColourByKeys as key (key)}
								<td class="number">{d[key]?.toLocaleString() || '-'}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
			<p>
				<button onclick={() => downloadData()} aria-busy={isDownloading} disabled={isDownloading}
					><DownloadIcon />{isDownloading ? 'Downloading...' : 'Download data'}</button
				>
			</p>
		{/if}
	</section>
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

	select:disabled {
		cursor: not-allowed;
	}

	#viz-settings {
		margin-bottom: 0;
		margin-top: var(--size-2);
	}

	#viz-settings fieldset {
		display: flex;
		justify-content: space-between;
	}

	#viz-settings fieldset > * {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-inline-size: unset;
		padding-bottom: var(--size-4);
		padding-inline: var(--size-8);
		width: 100%;
	}

	small {
		max-inline-size: unset;
	}

	#viz-settings fieldset :first-child {
		border-right: var(--border-size-1) solid var(--gray-4);
	}

	input[type='range'] {
		width: 100%;
	}

	#viz-summary {
		border-top: var(--border-size-1) solid var(--gray-4);
		padding-top: var(--size-4);
		margin-bottom: 0;
		margin-top: var(--size-4);
	}

	#viz-summary hgroup p {
		max-inline-size: unset;
	}

	#viz-container {
		display: flex;
		gap: var(--size-8);
		justify-content: space-between;
		margin-top: 0;
		max-width: 100%;
		padding-top: var(--size-10);
	}

	#viz-data {
		align-items: center;
		border-top: var(--border-size-1) solid var(--gray-4);
		display: flex;
		flex-direction: column;
		margin-bottom: 0;
		max-width: 100%;
		overflow: scroll;
		padding-top: var(--size-6);
	}

	table {
		--nice-inner-radius: 0;

		background: unset;
		border: unset;
		border-radius: unset;
		border-spacing: 0;
		border-top: var(--border-size-1) solid var(--border-color);
		margin-bottom: var(--size-6);
		margin-top: var(--size-4);
	}

	thead th {
		border-bottom: var(--border-size-2) solid var(--border-color);
		border-start-start-radius: unset;
	}

	tr {
		font-size: var(--font-size-0);
	}

	tr th {
		vertical-align: top;
	}

	tr :not(th) {
		padding-block: var(--size-1);
	}

	th {
		white-space: wrap;
		text-align: left;
	}

	td {
		padding-block: var(--size-4);
		text-align: left;
	}

	td.number {
		text-align: right;
	}
</style>
