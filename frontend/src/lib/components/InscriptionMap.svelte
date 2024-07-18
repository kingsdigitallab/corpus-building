<script>
	import maplibregl from 'maplibre-gl';
	import { afterUpdate, onDestroy, onMount } from 'svelte';

	import 'maplibre-gl/dist/maplibre-gl.css';

	const { Map, Marker, NavigationControl, Popup } = maplibregl;

	export let inscriptions;
	export let show = true;

	let map;
	let markers = [];

	/** @type HTMLDivElement */
	let mapContainer;

	function addMarkers() {
		markers.forEach((marker) => marker.remove());
		markers = [];

		const inscriptionsByGeo = inscriptions
			.filter((inscription) => inscription.geo)
			.reduce((acc, curr) => {
				const key = curr.geo.join('_');
				if (!acc[key]) {
					acc[key] = [];
				}

				acc[key].push(curr);

				return acc;
			}, {});

		Object.entries(inscriptionsByGeo).forEach(([_, inscriptions]) => {
			const numberInscriptions = inscriptions.length;

			let markerSize = '8px';
			if (numberInscriptions > 15) {
				markerSize = '48px';
			} else if (numberInscriptions > 10) {
				markerSize = '32px';
			} else if (numberInscriptions > 1) {
				markerSize = '16px';
			}

			const el = document.createElement('div');
			el.className = 'marker';
			el.style.width = markerSize;
			el.style.height = markerSize;
			el.style.lineHeight = markerSize;

			if (numberInscriptions > 1) {
				el.innerHTML = numberInscriptions.toString();
			}

			const geo = inscriptions[0].geo;
			const place = inscriptions[0].place._;

			let html = `<div class="tooltip"><h3>${place}</h3>`;
			const linkItems = inscriptions
				.map(
					(inscription) =>
						`<li><a href="inscription/${inscription.file}">${inscription.title}</a></li>`
				)
				.join('');
			html = `${html}<ul>${linkItems}</ul></div>`;

			const marker = new Marker({ element: el })
				.setLngLat([geo[1], geo[0]])
				.setPopup(new Popup().setHTML(html))
				.addTo(map);

			markers.push(marker);
		});
	}

	onMount(() => {
		map = new Map({
			container: mapContainer,
			style: 'https://api.maptiler.com/maps/positron/style.json?key=brTBbnRxuiKp6PgjwFPr',
			center: [14.01535, 37.59999],
			zoom: 7
		});

		map.addControl(new NavigationControl({ showCompass: true, showZoom: true }));
	});

	afterUpdate(() => {
		addMarkers();
	});

	onDestroy(() => map?.remove());
</script>

<div class="inscription-map" class:hidden={!show} bind:this={mapContainer}></div>

<style>
	.inscription-map {
		border: var(--border-size-1) solid var(--text-1);
		height: 400px;
		width: 100%;

		& .marker {
			background-color: var(--blue-4);
			border-radius: 50%;
			border: none;
			box-shadow: var(--shadow-1);
			color: var(--gray-12);
			cursor: pointer;
			display: block;
			font-family: var(--font-family);
			font-size: var(--font-size-0);
			font-weight: var(--font-weight-6);
			padding: 0;
			text-align: center;

			&:hover {
				filter: brightness(90%);
				box-shadow: var(--shadow-4);
			}
		}

		& button {
			box-shadow: none;
			text-shadow: none;
		}

		& ul {
			font-size: var(--font-size-1);
			list-style: none;
			padding-inline: 0;

			& li {
				padding-inline: 0;
			}
		}
	}

	.hidden {
		display: none;
	}
</style>
