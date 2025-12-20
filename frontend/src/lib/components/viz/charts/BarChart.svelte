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
	 *   data: Array<{ key: string, value: number } & Record<string, unknown>>,
	 *   height: number,
	 *   categoryTitle: string,
	 *   colourByKeys: string[],
	 *   formatKey: (key: string | undefined) => string
	 * }}
	 */
	let { data, height, categoryTitle, colourByKeys = [], formatKey } = $props();

	/** @type {(d: unknown, i: number) => number} */
	const x = (_, i) => i;
	const xLabel = 'Inscription count';

	const y = $derived(
		colourByKeys.length > 0
			? colourByKeys.map((key) => (/** @type {Record<string, number>} */ d) => d[key] ?? 0)
			: (/** @type {{ value: number }} */ d) => d.value
	);

	/** @type {[number, number]} */
	const yDomain = $derived([0, data.length - 1]);

	const numTicks = $derived(data.length);
	const tickFormat = $derived((/** @type {number} */ tick) => data[tick]?.key || tick);
	const tickValues = $derived(Array.from({ length: numTicks }, (_, i) => i));

	// Legend
	const legendShape = BulletShape.Square;
	const legendItems = $derived(
		colourByKeys.length > 0
			? colourByKeys.map((key) => ({
					name: formatKey(key),
					shape: legendShape
				}))
			: data.map((d) => ({
					name: formatKey(d.key),
					shape: legendShape
				}))
	);

	// Tooltip
	const triggers = $derived({
		[StackedBar.selectors.bar]: getTooltip
	});

	/** @param {{ key: string, value: number, _index?: number, _stacked?: [number, number] } & Record<string, unknown>} bar */
	function getTooltip(bar) {
		// For stacked bars, show all segment values with the hovered one highlighted
		if (colourByKeys.length > 0 && bar._stacked) {
			const hoveredValue = bar._stacked[1] - bar._stacked[0];
			const lines = colourByKeys
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
</script>

<VisXYContainer {data} {height} yDirection="south" {yDomain}>
	<VisStackedBar {x} {y} barPadding={0.1} orientation="horizontal" />
	<VisAxis type="x" label={xLabel} />
	<VisAxis type="y" label={categoryTitle} gridLine={false} {numTicks} {tickFormat} {tickValues} />
	<VisTooltip {triggers} />
</VisXYContainer>

{#if colourByKeys.length > 0}
	<div>
		<h4>Legend</h4>
		<VisBulletLegend items={legendItems} labelFontSize="large" orientation="vertical" />
	</div>
{/if}
