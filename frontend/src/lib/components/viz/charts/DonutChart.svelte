<script>
	import { VisBulletLegend, VisNestedDonut, VisSingleContainer, VisTooltip } from '@unovis/svelte';
	import { BulletShape, NestedDonut } from '@unovis/ts';

	/**
	 * @type {{
	 *   data: Array<{ key: string, value: number } & Record<string, unknown>>,
	 *   height: number,
	 *   colourByKeys: string[],
	 *   formatKey: (key: string | undefined) => string
	 * }}
	 */
	let { data, height, colourByKeys = [], formatKey } = $props();

	// Transform data for nested donut
	/** @type {{ key?: string, group?: string, subgroup?: string, value: number }[]} */
	const donutData = $derived(
		colourByKeys.length === 0
			? data.map((d) => ({ key: d.key, value: d.value }))
			: data.flatMap((d) =>
					colourByKeys
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
		colourByKeys.length > 0 ? [(d) => d.group, (d) => d.subgroup] : [(d) => d.key]
	);

	// Legend - always shows parent categories
	const legendShape = BulletShape.Square;
	const legendItems = $derived(
		data.map((d) => ({
			name: formatKey(d.key),
			shape: legendShape
		}))
	);

	// Tooltip
	const triggers = $derived({
		[NestedDonut.selectors.segment]: getTooltip
	});

	/** @param {{ data: { key: string, root?: string }, value: number }} segment */
	function getTooltip(segment) {
		if (colourByKeys.length > 0) {
			return `<h6 class="legend-title">${formatKey(segment.data.root)}</h6>${formatKey(segment.data.key)}: ${segment.value.toLocaleString()} inscriptions`;
		}
		return `<h6 class="legend-title">${formatKey(segment.data.key)}</h6>${segment.value.toLocaleString()} inscriptions`;
	}
</script>

<VisSingleContainer data={donutData} height={height * 1.5}>
	<VisNestedDonut
		{layers}
		value={(/** @type {{ value: number }} */ d) => d.value}
		direction="outwards"
		layerPadding={10}
	/>
	<VisTooltip {triggers} />
</VisSingleContainer>

<div>
	<h4>Legend</h4>
	<VisBulletLegend items={legendItems} labelFontSize="large" orientation="vertical" />
</div>
