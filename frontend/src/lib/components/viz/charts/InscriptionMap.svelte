<script>
	import * as config from '$lib/config';
	import { VisLeafletMap, VisTooltip } from '@unovis/svelte';
	import { LeafletMap } from '@unovis/ts';

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

	const tooltipTriggers = {
		[LeafletMap.selectors.point]: tooltipContent,
		[LeafletMap.selectors.cluster]: clusterTooltipContent
	};

	/** @param {{ data: any }} d */
	function tooltipContent(d) {
		const point = d.data;
		const place = point.places?.[0]?._ ?? 'Unknown';
		return `<div class="tooltip"><strong>${place}</strong><br/><a href="inscription/${point.file}">${point.title}</a></div>`;
	}

	/** @param {{ data: any }} d */
	function clusterTooltipContent(d) {
		const cluster = d.data;
		const count = cluster.clusterPoints?.length ?? 0;
		return `<div class="tooltip"><strong>${count} inscriptions</strong><br/>Click to expand</div>`;
	}
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
			clusterRadius={undefined}
		/>
		<VisTooltip triggers={tooltipTriggers} />
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
