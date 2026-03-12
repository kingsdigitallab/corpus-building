<script>
	import {
		VisAxis,
		VisXYContainer,
		VisLine,
		VisTooltip,
		VisCrosshair,
		VisBulletLegend
	} from '@unovis/svelte';
	import { BulletShape } from '@unovis/ts';

	/**
	 * @type {{
	 *   height: number,
	 *   binSize: number,
	 *   data: Array<{ key: string, value: number } & Record<string, unknown>>,
	 *   colourByKeys?: string[],
	 *   formatKey?: (key: string | undefined) => string
	 * }}
	 */
	let { height, binSize, data, colourByKeys = [], formatKey = (k) => k || '' } = $props();

	/** @type {(d: unknown, i: number) => number} */
	const x = (_, i) => i;

	let hiddenSeries = $state(new Set());

	let y = $derived.by(() => {
		if (colourByKeys.length > 0) {
			return colourByKeys.map((key) => {
				if (hiddenSeries.has(key)) return () => null;
				return (/** @type {Record<string, number>} */ d) => d[key] ?? 0;
			});
		} else {
			return [(/** @type {{ value: number }} */ d) => d.value];
		}
	});

	// Limit tick labels to prevent overlap
	const maxTicks = $derived(
		Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1000) / 100)
	);
	const tickStep = $derived(data.length > maxTicks ? Math.ceil(data.length / maxTicks) : 1);
	const numTicks = $derived(Math.ceil(data.length / tickStep));
	const tickFormat = $derived((/** @type {number} */ tick) => data[tick]?.key || tick);
	const tickValues = $derived(
		Array.from({ length: data.length }, (_, i) => i).filter((i) => i % tickStep === 0)
	);

	// Legend
	const legendShape = BulletShape.Square;
	const legendItems = $derived(
		colourByKeys.length > 0
			? colourByKeys.map((key) => ({
					name: formatKey(key),
					shape: legendShape,
					inactive: hiddenSeries.has(key)
				}))
			: []
	);

	/** @param {import('@unovis/ts').BulletLegendItemInterface} item */
	function toggleLegendItem(item) {
		const key = colourByKeys.find((k) => formatKey(k) === item.name);

		if (!key) return;

		if (hiddenSeries.has(key)) {
			hiddenSeries = new Set([...hiddenSeries].filter((k) => k !== key));
		} else {
			hiddenSeries = new Set([...hiddenSeries, key]);
		}
	}

	/** @param {any} item */
	function getTooltip(item) {
		if (Array.isArray(item)) return '';

		/** @type {any} */
		const targetPoint = item._mapped ?? item;
		if (colourByKeys.length > 0) {
			const activeCategoryLines = colourByKeys
				.filter(
					(key) =>
						typeof targetPoint[key] === 'number' &&
						typeof targetPoint.key === 'string' &&
						targetPoint[key] > 0 &&
						!hiddenSeries.has(key)
				)
				.map((key) => {
					const value = /** @type {number} */ (targetPoint[key]);
					return `${formatKey(key)}: ${value.toLocaleString()}`;
				});
			return `<h6 class="legend-title">${targetPoint.key}</h6>${activeCategoryLines.join('<br>')}`;
		}
		return `<h6 class="legend-title">${targetPoint.key}</h6>${Number(targetPoint.value).toLocaleString()} inscriptions`;
	}
</script>

<VisXYContainer {data} {height}>
	{#key colourByKeys.length + '-' + binSize + '-' + [...hiddenSeries].join(',')}
		<VisLine {x} {y} />
		<VisCrosshair template={getTooltip} {x} {y} />
	{/key}
	<VisAxis type="x" label="Date range" {numTicks} {tickFormat} {tickValues} />
	<VisAxis type="y" label="Inscription count" />
	<VisTooltip />
</VisXYContainer>

{#if colourByKeys.length > 0}
	<div>
		<hgroup>
			<h4>Legend</h4>
			<small>Click on a legend item to hide or show the corresponding line in the chart.</small>
		</hgroup>
		<div class="legend-container">
			<VisBulletLegend
				items={legendItems}
				onLegendItemClick={toggleLegendItem}
				labelFontSize="large"
				orientation="vertical"
			/>
		</div>
	</div>
{/if}

<style>
	:global(.vis-tooltip) {
		max-height: 50vh;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.legend-container {
		margin-top: var(--size-2, var(--size-4));
		max-height: 35vh;
		overflow-y: auto;
	}
</style>
