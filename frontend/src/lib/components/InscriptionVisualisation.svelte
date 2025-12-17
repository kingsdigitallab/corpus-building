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
	import { BulletShape, NestedDonut, StackedBar } from '@unovis/ts';

	let { inscriptions, aggregations } = $props();

	const HIERARCHY_SEPARATOR = ':::';
	const HIERARCHY_SEPARATOR_LABEL = '>';
	const excludedCategories = ['letterHeightAtLeast', 'letterHeightAtMost', 'notBefore', 'notAfter'];

	/** @param {string | undefined} key */
	const formatKey = (key) =>
		key?.replaceAll(HIERARCHY_SEPARATOR, ` ${HIERARCHY_SEPARATOR_LABEL} `) ?? '';

	// Viz controls
	let selectedView = $state('bar-stacked');

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
	const selectedCategoryBuckets = $derived(
		[...(aggregations[selectedCategory]?.buckets || [])].sort((a, b) => b.doc_count - a.doc_count)
	);

	let selectedColourBy = $state('');
	const selectedColourByKeys = $derived(() => {
		if (!selectedColourBy) return [];
		const buckets =
			aggregations[selectedColourBy]?.buckets.filter(
				/** @param {{ key: string }} bucket */ (bucket) => !excludedCategories.includes(bucket.key)
			) || [];
		return [...buckets].sort((a, b) => b.doc_count - a.doc_count).map((b) => b.key);
	});

	// Viz settings
	let maxCategories = $state(10);
	let height = $state(400);

	// Viz data
	const data = $derived(getData());

	function getData() {
		// Get buckets, sorted by count, limited to maxCategories
		let buckets = [
			...(aggregations[selectedCategory]?.buckets.filter(
				/** @param {{ key: string }} bucket */ (bucket) => !excludedCategories.includes(bucket.key)
			) || [])
		];
		buckets = buckets.sort((a, b) => b.doc_count - a.doc_count).slice(0, maxCategories);

		// Simple case: no colour-by selected
		if (!selectedColourBy || !inscriptions?.length) {
			return buckets.map((b) => ({
				key: formatKey(b.key),
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
					key: formatKey(bucket.key),
					value: Object.values(counts).reduce((sum, c) => sum + c, 0),
					...counts
				};
			})
			.filter((d) => Object.keys(d).length > 2);

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
	const donutData = $derived(
		!selectedColourBy || selectedColourByKeys().length === 0
			? data.map((d) => ({ key: d.key, value: d.value }))
			: data.flatMap((d) =>
					selectedColourByKeys()
						.filter((k) => typeof d[k] === 'number' && d[k] > 0)
						.map((k) => ({
							group: d.key,
							subgroup: formatKey(k),
							value: /** @type {number} */ (d[k])
						}))
				)
	);

	/** @type {((d: any) => string)[]} */
	const layers = $derived(
		selectedColourBy && selectedColourByKeys().length > 0
			? [(d) => d.group, (d) => d.subgroup]
			: [(d) => d.key]
	);

	// Legend - show colour-by categories when selected, otherwise show category values
	const legendShape = BulletShape.Square;

	const legendItems = $derived(
		selectedColourBy && selectedColourByKeys().length > 0
			? selectedColourByKeys().map((key) => ({
					name: formatKey(key),
					shape: legendShape
				}))
			: data.map((d) => ({
					name: formatKey(d.key),
					shape: legendShape
				}))
	);

	// Tooltips
	const triggers = $derived({
		[StackedBar.selectors.bar]: getBarTooltip,
		[NestedDonut.selectors.segment]: getDonutTooltip
	});

	/** @param {{ key: string, value: number, _index?: number, _stacked?: [number, number] } & Record<string, unknown>} bar */
	function getBarTooltip(bar) {
		// For stacked bars, show all segment values with the hovered one highlighted
		if (selectedColourBy && bar._stacked) {
			const keys = selectedColourByKeys();
			const hoveredValue = bar._stacked[1] - bar._stacked[0];
			const lines = keys
				.filter((key) => typeof bar[key] === 'number' && bar[key] > 0)
				.map((key) => {
					const value = /** @type {number} */ (bar[key]);
					const text = `${formatKey(key)}: ${value.toLocaleString()}`;
					return value === hoveredValue ? `<strong>${text}</strong>` : text;
				});
			return `<h6 class="legend-title">${formatKey(bar.key)}</h6>${lines.join('<br>')}`;
		}
		return `<h6 class="legend-title">${formatKey(bar.key)}</h6>${bar.value.toLocaleString()} inscriptions`;
	}

	/** @param {{ data: { key: string }, value: number }} segment */
	function getDonutTooltip(segment) {
		if (selectedColourBy) {
			return `<h6 class="legend-title">${formatKey(segment.data.root)}</h6>${formatKey(segment.data.key)}: ${segment.value.toLocaleString()} inscriptions`;
		}
		return `<h6 class="legend-title">${formatKey(segment.data.key)}</h6>${segment.value.toLocaleString()} inscriptions`;
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
			<VisBulletLegend items={legendItems} labelFontSize="large" orientation="vertical" />
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
		<VisBulletLegend items={legendItems} labelFontSize="large" orientation="vertical" />
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

	:global(.legend-title) {
		font-variant: small-caps;
		padding-bottom: var(--size-2);
	}

	fieldset {
		border: none;
	}

	#viz-controls fieldset {
		display: flex;
		justify-content: space-around;
	}

	#viz-settings {
		margin-bottom: 0;
	}

	#viz-settings fieldset {
		display: flex;
		justify-content: space-between;
		width: 100%;
	}

	#viz-settings fieldset * {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-inline-size: unset;
		padding-bottom: var(--size-4);
		padding-inline: var(--size-8);
		width: 100%;
	}

	#viz-settings fieldset :first-child {
		border-right: var(--border-size-1) solid var(--border-color);
	}

	input[type='range'] {
		width: 100%;
	}

	#viz-container {
		border-bottom: var(--border-size-1) solid var(--border-color);
		border-top: var(--border-size-1) solid var(--border-color);
		display: flex;
		gap: var(--size-8);
		justify-content: space-between;
		margin-top: 0;
		padding-block: var(--size-10);
	}
</style>
