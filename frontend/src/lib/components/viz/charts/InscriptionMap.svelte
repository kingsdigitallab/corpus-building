<script>
	import * as config from '$lib/config';
	import { VisLeafletMap } from '@unovis/svelte';
	import { LeafletMap, Tooltip } from '@unovis/ts';
	import { goto } from '$app/navigation';

	/**
	 * @typedef {Object} Props
	 * @property {any} inscriptions
	 * @property {boolean} [show]
	 */

	/** @type {Props} */
	let { inscriptions, mapStyle = config.mapStyle, show = true } = $props();

	/** @type {{ latitude: number, longitude: number, title: string, file: string, places: any[] }[]} */
	const data = $derived(
		inscriptions
			.filter((/** @type {any} */ inscription) => inscription.geo && inscription.geo.length === 2)
			.map((/** @type {any} */ inscription) => ({
				latitude: inscription.geo[0],
				longitude: inscription.geo[1],
				title: inscription.title,
				file: inscription.file,
				places: inscription.places
			}))
	);

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

		return `<strong>${inscription.title}</strong><br/>${place}<br/><br/>Click to view inscription`;
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

{#if show}
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
			{tooltip}
			{events}
		/>
	</div>
{/if}

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
