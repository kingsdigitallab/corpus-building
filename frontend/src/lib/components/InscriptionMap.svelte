<script>
	import maplibregl from 'maplibre-gl';
	import { onDestroy, onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';

	const { Map, Marker, NavigationControl, Popup } = maplibregl;

	/**
	 * @typedef {Object} Props
	 * @property {any} inscriptions
	 * @property {boolean} [show]
	 */

	/** @type {Props} */
	let { inscriptions, show = true } = $props();

	let map = $state();

	/** @type {HTMLDivElement | undefined} */
	let mapContainer = $state();

	let activeMarkers = $state([]);

	let inscriptionsByGeo = $derived(
		inscriptions
			.filter((inscription) => inscription.geo)
			.reduce((acc, curr) => {
				if (!curr.geo || curr.geo.length !== 2) return acc;

				const key = curr.geo.join('_');
				if (!acc[key]) {
					acc[key] = [];
				}

				acc[key].push(curr);

				return acc;
			}, {})
	);
	let markers = $derived(
		Object.entries(inscriptionsByGeo).map(([_, inscriptions]) => {
			const geo = inscriptions[0].geo;

			const numberInscriptions = inscriptions.length;
			let markerSize = 'single';

			if (numberInscriptions > 100) {
				markerSize = 'lg';
			} else if (numberInscriptions > 25) {
				markerSize = 'md';
			} else if (numberInscriptions > 1) {
				markerSize = 'sm';
			}

			return {
				coords: [geo[1], geo[0]],
				markerSize,
				numberInscriptions,
				inscriptions
			};
		})
	);

	function addMarkerAction(node, { coords, inscriptions }) {
		const popup = new Popup();

		const updatePopupContent = () => {
			const content = createPopupContent(inscriptions);
			popup.setHTML(content);
		};

		updatePopupContent();

		const marker = new Marker({ element: node }).setLngLat(coords).setPopup(popup).addTo(map);

		activeMarkers.push(marker);

		return {
			destroy() {
				marker?.remove();
				activeMarkers = activeMarkers.filter((m) => m !== marker);
			},
			update({ coords: newCoords, inscriptions: newInscriptions }) {
				inscriptions = newInscriptions;
				updatePopupContent();
				marker.setLngLat(newCoords);
			}
		};
	}

	function createPopupContent(inscriptions) {
		const inscriptionsByPlace = inscriptions.reduce((acc, curr) => {
			if (!curr.places[0]) {
				return acc;
			}

			if (!acc[curr.places[0]._]) {
				acc[curr.places[0]._] = [];
			}
			acc[curr.places[0]._].push(curr);

			return acc;
		}, {});

		let html = `<div class="tooltip">`;
		const items = Object.entries(inscriptionsByPlace)
			.map(([place, inscriptions]) => {
				let dt = `<dt>${place}</dt>`;
				let dd = inscriptions
					.map(
						(inscription) =>
							`<dd><a href="inscription/${inscription.file}">${inscription.title}</a></dd>`
					)
					.join('');

				return `${dt}${dd}`;
			})
			.join('');

		return `${html}<dl>${items}</dl></div>`;
	}

	onMount(async () => {
		map = new Map({
			container: mapContainer,
			style: 'https://api.maptiler.com/maps/positron/style.json?key=brTBbnRxuiKp6PgjwFPr',
			center: [14.01535, 37.59999],
			zoom: 7
		});

		map.addControl(new NavigationControl({ showCompass: true, showZoom: true }));
	});

	onDestroy(async () => {
		if (map) {
			map.remove();
			map = undefined;
			mapContainer = undefined;
		}
	});
</script>

{#if show}
	<div class="inscription-map" bind:this={mapContainer}>
		{#if map && markers}
			{#each markers as marker}
				<div
					use:addMarkerAction={{ coords: marker.coords, inscriptions: marker.inscriptions }}
					class="marker"
					class:single={marker.markerSize === 'single'}
					class:sm={marker.markerSize === 'sm'}
					class:md={marker.markerSize === 'md'}
					class:lg={marker.markerSize === 'lg'}
					role="img"
					aria-label={`Map marker for ${marker.inscriptions[0].title}`}
				>
					{#if marker.numberInscriptions > 1}
						<span>{marker.numberInscriptions}</span>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
{/if}

<style>
	.inscription-map {
		border: var(--border-size-1) solid var(--text-1);
		font-family: var(--font-family);
		height: 600px;
		width: 100%;

		:global(.maplibregl-popup-content) {
			height: 200px;
			overflow: scroll;
		}

		:global(button) {
			box-shadow: none;
			text-shadow: none;
		}

		:global(ul) {
			font-size: var(--font-size-1);
			list-style: none;
			padding-inline: 0;

			:global(li) {
				padding-inline: 0;
			}
		}
	}

	.marker {
		--marker-size: 12px;

		background-color: var(--blue-4);
		border-radius: var(--radius-4);
		border: none;
		box-shadow: var(--shadow-1);
		color: var(--gray-12);
		cursor: pointer;
		display: block;
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-6);
		height: var(--marker-size);
		line-height: var(--marker-size);
		padding: 0;
		text-align: center;
		width: var(--marker-size);
	}

	.marker:hover {
		filter: brightness(90%);
		box-shadow: var(--shadow-4);
	}

	.sm {
		--marker-size: 24px;

		background-color: var(--blue-6);
	}

	.md {
		--marker-size: 36px;

		background-color: var(--blue-8);
		color: white;
	}

	.lg {
		--marker-size: 50px;

		background-color: var(--blue-10);
		color: white;
	}
</style>
