<script>
	import {
		VisAxis,
		VisBulletLegend,
		VisXYContainer,
		VisStackedBar,
		VisTooltip
	} from '@unovis/svelte';
	import { BulletShape, StackedBar } from '@unovis/ts';

	/**
	 * @type {{
	 *   inscriptions: any[],
	 *   height: number,
	 *   binSize: number,
	 *   data: Array<{ key: string, value: number } & Record<string, unknown>>,
	 *   colourByKeys?: string[],
	 *   formatKey?: (key: string | undefined) => string
	 * }}
	 */
	let {
		inscriptions,
		height,
		binSize,
		data,
		colourByKeys = [],
		formatKey = (k) => k || ''
	} = $props();

	/** @type {(d: unknown, i: number) => number} */
	const x = (_, i) => i;
	const y = $derived(
		colourByKeys.length > 0
			? colourByKeys.map((key) => (/** @type {Record<string, number>} */ d) => d[key] ?? 0)
			: (/** @type {{ value: number }} */ d) => d.value
	);
	const yDomain = $derived(/** @type {[number, number]} */ ([0, data.length - 1]));

	// Limit tick labels to prevent overlap
	const maxTicks = $derived(Math.floor(height / 25));
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
					shape: legendShape
				}))
			: []
	);

	// Tooltip
	const triggers = $derived({
		[StackedBar.selectors.bar]: getTooltip
	});

	/** @param {{ key: string, value: number, _stacked?: [number, number] } & Record<string, unknown>} bar */
	function getTooltip(bar) {
		if (colourByKeys.length > 0 && bar._stacked) {
			const hoveredValue = bar._stacked[1] - bar._stacked[0];
			const lines = colourByKeys
				.filter((key) => typeof bar[key] === 'number' && bar[key] > 0)
				.map((key) => {
					const value = /** @type {number} */ (bar[key]);
					const text = `${formatKey(key)}: ${value.toLocaleString()}`;
					return value === hoveredValue ? `<strong>${text}</strong>` : text;
				});
			return `<h6 class="legend-title">${bar.key}</h6>${lines.join('<br>')}`;
		}
		return `<h6 class="legend-title">${bar.key}</h6>${bar.value.toLocaleString()} inscriptions`;
	}
</script>

<VisXYContainer {data} {height} yDirection="south" {yDomain}>
	<VisStackedBar {x} {y} barPadding={0.1} orientation="horizontal" />
	<VisAxis type="x" label="Inscription count" />
	<VisAxis type="y" label="Date range" gridLine={false} {numTicks} {tickFormat} {tickValues} />
	<VisTooltip {triggers} />
</VisXYContainer>

{#if colourByKeys.length > 0}
	<div>
		<h4>Legend</h4>
		<VisBulletLegend items={legendItems} labelFontSize="large" orientation="vertical" />
	</div>
{/if}
