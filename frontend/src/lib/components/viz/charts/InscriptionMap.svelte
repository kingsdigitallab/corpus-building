<script>
	import * as config from '$lib/config';
	import { VisBulletLegend, VisLeafletMap } from '@unovis/svelte';
	import { BulletShape, LeafletMap, Tooltip } from '@unovis/ts';
	import { goto } from '$app/navigation';
	import { formatKey, getLeaves } from '../utils.js';

	/**
	 * @typedef {Object} Props
	 * @property {any[]} inscriptions
	 * @property {Record<string, any>} aggregations
	 * @property {string} selectedColourBy
	 * @property {string} mapStyle
	 */

	/** @type {Props} */
	let { inscriptions, aggregations, selectedColourBy, mapStyle = config.mapStyle } = $props();

	/** @type {string[]} */
	const PALETTE = ['#825b3a', '#c7956d', '#d4a574', '#8b9e6b', '#5d8a83', '#7a6b8a'];

	// Get active colour-by keys from aggregation buckets
	const colourByKeys = $derived.by(() => {
		if (!selectedColourBy || !aggregations[selectedColourBy]) return [];
		const buckets = getLeaves(aggregations[selectedColourBy]?.buckets || []);
		return buckets
			.sort((/** @type {any} */ a, /** @type {any} */ b) => b.doc_count - a.doc_count)
			.map((/** @type {{ key: string }} */ b) => b.key);
	});

	// Build the Unovis colorMap from colour-by keys
	const colorMap = $derived.by(() => {
		if (!colourByKeys.length) return {};
		/** @type {Record<string, { color: string }>} */
		const map = {};
		for (let i = 0; i < colourByKeys.length; i++) {
			map[colourByKeys[i]] = { color: PALETTE[i % PALETTE.length] };
		}
		return map;
	});

	// Legend items for VisBulletLegend
	const legendItems = $derived(
		colourByKeys.map((key, i) => ({
			name: formatKey(key),
			color: PALETTE[i % PALETTE.length],
			shape: BulletShape.Square
		}))
	);

	// Transform inscription data — include numeric counts per colour-by value
	const data = $derived.by(() => {
		const points = inscriptions
			.filter((/** @type {any} */ inscription) => inscription.geo && inscription.geo.length === 2)
			.map((/** @type {any} */ inscription) => {
				/** @type {Record<string, any>} */
				const point = {
					latitude: inscription.geo[0],
					longitude: inscription.geo[1],
					title: inscription.title,
					file: inscription.file,
					places: inscription.places
				};

				// Add numeric properties for each colour-by key
				if (selectedColourBy && colourByKeys.length) {
					const rawValues = Array.isArray(inscription[selectedColourBy])
						? inscription[selectedColourBy]
						: inscription[selectedColourBy] !== undefined
							? [inscription[selectedColourBy]]
							: [];
					const stringValues = rawValues.map((/** @type {any} */ v) => String(v));

					for (const key of colourByKeys) {
						point[key] = stringValues.includes(key) ? 1 : 0;
					}
				}

				return point;
			});

		return points;
	});

	const pointLatitude = (/** @type {any} */ d) => d.latitude;
	const pointLongitude = (/** @type {any} */ d) => d.longitude;
	const pointBottomLabel = (/** @type {any} */ d) => d.places?.[0]?._ ?? '';

	const tooltip = new Tooltip({
		triggers: {
			[LeafletMap.selectors.point]: tooltipContent
		}
	});

	/** @param {any} d */
	function tooltipContent(d) {
		const point = d?.data ?? d;
		if (!point) return '';

		if (point.clusterPoints) {
			const place = point.clusterPoints[0].places[0]._;
			const count = point.clusterPoints.length;

			return `<strong>${place}</strong><br/>${count} inscriptions<br/><br/>Click to expand`;
		}

		const inscription = point.properties;
		const place = inscription.places?.[0]?._ ?? 'Unknown';

		let colourInfo = '';
		if (selectedColourBy && colourByKeys.length) {
			const matched = colourByKeys.filter((key) => inscription[key] === 1);
			if (matched.length) colourInfo = `<br/>${matched.map(formatKey).join(', ')}`;
		}

		return `<strong>${inscription.file}: ${inscription.title}</strong><br/>${place}${colourInfo}<br/><br/>Click to view inscription`;
	}

	const events = {
		[LeafletMap.selectors.point]: {
			/** @param {any} d */
			click: (d) => {
				const point = d?.data ?? d;
				if (!point || point.clusterPoints) return;
				const file = point.properties?.file;
				if (file) goto(`inscription/${file}`);
			}
		}
	};
</script>

{#key selectedColourBy}
	<div class="inscription-map">
		<VisLeafletMap
			style={mapStyle}
			{data}
			{pointLatitude}
			{pointLongitude}
			{pointBottomLabel}
			fitViewPadding={[60, 60]}
			clusterExpandOnClick={true}
			pointRadius={6}
			pointColor="var(--blue-6)"
			clusterColor="var(--blue-8)"
			clusterRingWidth={6}
			{colorMap}
			{tooltip}
			{events}
		/>
	</div>

	{#if colourByKeys.length > 0}
		<div class="legend">
			<h4>Legend</h4>
			<VisBulletLegend items={legendItems} labelFontSize="large" orientation="vertical" />
		</div>
	{/if}
{/key}

<style>
	.inscription-map {
		border: var(--border-size-1) solid var(--text-1);
		font-family: var(--font-family);
		height: 600px;
		width: 100%;
		position: relative;
	}

	.inscription-map :global(.tooltip) {
		font-size: var(--font-size-1);
	}

	.inscription-map :global(.tooltip a) {
		color: var(--link);
	}
</style>
