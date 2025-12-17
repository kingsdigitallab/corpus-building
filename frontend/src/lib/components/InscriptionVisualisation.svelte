<script>
	import {
		VisAxis,
		VisBulletLegend,
		VisXYContainer,
		VisNestedDonut,
		VisSingleContainer,
		VisStackedBar,
		VisTooltip
	} from '@unovis/svelte';
	import InscriptionMap from './InscriptionMap.svelte';
	import { StackedBar } from '@unovis/ts';
	import { NestedDonut } from '@unovis/ts';

	let { inscriptions, aggregations } = $props();

	const HIERARCHY_SEPARATOR = ':::';

	// Viz controls
	let selectedView = $state('bar-stacked');

	const categories = $derived(
		Object.values(aggregations)
			.map((aggregation) => ({
				value: aggregation.name,
				label: aggregation.title
			}))
			.sort((a, b) => a.label.localeCompare(b.label))
	);

	let selectedCategory = $state('inscriptionType');
	const selectedCategoryBuckets = $derived(
		[...(aggregations[selectedCategory]?.buckets || [])].sort((a, b) => b.doc_count - a.doc_count)
	);

	let selectedColourBy = $state('');
	const selectedColourByKeys = $derived(() => {
		if (!selectedColourBy) return [];
		const buckets = aggregations[selectedColourBy]?.buckets || [];
		return [...buckets].sort((a, b) => b.doc_count - a.doc_count).map((b) => b.key);
	});

	// Viz settings
	let maxCategories = $state(10);
	let height = $state(400);

	// Viz data
	const data = $derived(getData());

	function getData() {
		// Get buckets, sorted by count, limited to maxCategories
		let buckets = [...(aggregations[selectedCategory]?.buckets || [])];
		buckets = buckets.sort((a, b) => b.doc_count - a.doc_count).slice(0, maxCategories);

		// Simple case: no colour-by selected
		if (!selectedColourBy || !inscriptions?.length) {
			return buckets.map((b) => ({
				key: b.key.replaceAll(HIERARCHY_SEPARATOR, ' > '),
				value: b.doc_count
			}));
		}

		// Helper to get values as array (handles both array and string fields)
		/** @param {Record<string, unknown>} item @param {string} field @returns {unknown[]} */
		const getValuesAsArray = (item, field) => {
			const value = item[field];
			if (Array.isArray(value)) return value;
			if (value !== undefined && value !== null) return [value];
			return [];
		};

		// Build lookup: categoryValue -> items[]
		const categoryMap = new Map();
		for (const item of inscriptions) {
			const values = getValuesAsArray(item, selectedCategory);
			for (const v of values) {
				if (!categoryMap.has(v)) categoryMap.set(v, []);
				categoryMap.get(v).push(item);
			}
		}

		// Get valid colourBy keys
		const colourByBuckets = aggregations[selectedColourBy]?.buckets || [];
		const validColourByKeys = new Set(
			colourByBuckets.map((/** @type {{ key: string }} */ b) => b.key)
		);

		// Cross-tabulate: for each category bucket, count items by aggregateBy value
		const result = buckets
			.map((bucket) => {
				const items = categoryMap.get(bucket.key) || [];
				/** @type {Record<string, number>} */
				const counts = {};

				for (const item of items) {
					const groupValues = getValuesAsArray(item, selectedColourBy);
					for (const gv of groupValues) {
						const key = /** @type {string} */ (gv);
						if (validColourByKeys.has(key)) {
							counts[key] = (counts[key] || 0) + 1;
						}
					}
				}

				return {
					key: bucket.key.replaceAll(HIERARCHY_SEPARATOR, ' > '),
					value: Object.values(counts).reduce((sum, c) => sum + c, 0),
					...counts
				};
			})
			.filter((d) => Object.keys(d).length > 1);

		return result;
	}

	// Bar
	/** @type {(d: unknown, i: number) => number} */
	const x = (_, i) => i;
	const xLabel = 'Inscription count';

	const y = $derived(
		selectedColourBy && selectedColourByKeys().length > 0
			? selectedColourByKeys().map(
					(key) => (/** @type {Record<string, number>} */ d) => d[key] ?? 0
				)
			: (/** @type {{ value: number }} */ d) => d.value
	);
	/** @type {[number, number]} */
	const yDomain = $derived([0, data.length - 1]);
	const yLabel = $derived(aggregations[selectedCategory]?.title || 'No title');

	const numTicks = $derived(data.length);
	const tickFormat = $derived((/** @type {number} */ tick) => data[tick]?.key || tick);
	const tickValues = $derived(Array.from({ length: numTicks }, (_, i) => i));

	// Donut
	/** @type {{ key?: string, group?: string, subgroup?: string, value: number }[]} */
	const donutData = $derived.by(() => {
		if (!selectedColourBy || selectedColourByKeys().length === 0) {
			// Simple case: just key and value
			return data.map((d) => ({
				key: d.key,
				value: d.value
			}));
		}

		// Colour-by case: flatten into group/subgroup/value for nested donut
		return data.flatMap((d) => {
			/** @type {Record<string, unknown>} */
			const record = d;
			return selectedColourByKeys()
				.filter((colourKey) => {
					const val = record[colourKey];
					return val !== undefined && typeof val === 'number' && val > 0;
				})
				.map((colourKey) => ({
					group: d.key,
					subgroup: colourKey.replaceAll(HIERARCHY_SEPARATOR, ' > '),
					value: /** @type {number} */ (record[colourKey])
				}));
		});
	});

	/** @type {((d: any) => string)[]} */
	const layers = $derived(
		selectedColourBy && selectedColourByKeys().length > 0
			? [(d) => d.group, (d) => d.subgroup]
			: [(d) => d.key]
	);

	// Legend - show colour-by categories when selected, otherwise show category values
	const legendItems = $derived(
		selectedColourBy && selectedColourByKeys().length > 0
			? selectedColourByKeys().map((key) => ({
					name: key.replaceAll(HIERARCHY_SEPARATOR, ' > ')
				}))
			: data.map((d) => ({ name: d.key }))
	);

	// Tooltips
	const triggers = $derived({
		[StackedBar.selectors.bar]: getBarTooltip,
		[NestedDonut.selectors.segment]: getDonutTooltip
	});

	/** @param {{ data?: Record<string, unknown> & { key?: string }, index?: number, key?: string, value?: number }} bar */
	function getBarTooltip(bar) {
		// For stacked bars, show the segment value; for simple bars, show total
		if (selectedColourBy && bar.data) {
			const keys = selectedColourByKeys();
			if (keys.length > 0 && bar.index !== undefined) {
				const segmentKey = keys[bar.index];
				const segmentValue = bar.data[segmentKey] ?? 0;
				return `${bar.data.key}\n${segmentKey.replaceAll(HIERARCHY_SEPARATOR, ' > ')}: ${segmentValue}`;
			}
		}
		return `${bar.key}: ${bar.value}`;
	}

	/** @param {{ data: { key: string }, value: number }} segment */
	function getDonutTooltip(segment) {
		return `${segment.data.key}: ${segment.value}`;
	}
</script>

<section id="viz-controls">
	<fieldset>
		<label>
			View
			<select name="view" bind:value={selectedView}>
				<option value="bar-stacked">Bar</option>
				<option value="donut">Donut</option>
				<option value="map">Map</option>
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
		<VisXYContainer {data} {height} yDirection="south" {yDomain}>
			<VisStackedBar {x} {y} barPadding={0.1} orientation="horizontal" />
			<VisAxis type="x" label={xLabel} />
			<VisAxis type="y" label={yLabel} gridLine={false} {numTicks} {tickFormat} {tickValues} />
			<VisTooltip {triggers} />
		</VisXYContainer>
		{#if selectedColourBy}
			<VisBulletLegend items={legendItems} />
		{/if}
	{:else if selectedView === 'donut'}
		<VisSingleContainer data={donutData} height={height * 1.5}>
			<VisNestedDonut
				{layers}
				value={(/** @type {{ value: number }} */ d) => d.value}
				direction="outwards"
				layerPadding={10}
			/>
			<VisTooltip {triggers} />
		</VisSingleContainer>
		<VisBulletLegend items={legendItems} />
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

	#viz-container {
		display: flex;
		justify-content: space-between;
	}

	:global(vis-bullet-legend) {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
</style>
