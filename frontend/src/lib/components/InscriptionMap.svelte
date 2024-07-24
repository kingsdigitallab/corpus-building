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
			const geo = inscriptions[0].geo;
			if (geo && geo.length === 2) {
				const numberInscriptions = inscriptions.length;
				let markerSize = '8px';
				let groupSize = 'single';

				if (numberInscriptions > 100) {
					markerSize = '48px';
					groupSize = 'lg';
				} else if (numberInscriptions > 25) {
					markerSize = '32px';
					groupSize = 'md';
				} else if (numberInscriptions > 1) {
					markerSize = '16px';
					groupSize = 'sm';
				}

				const el = createMarkerElement(markerSize, groupSize, numberInscriptions);
				const popupContent = createPopupContent(inscriptions);

				const marker = new Marker({ element: el })
					.setLngLat([geo[1], geo[0]])
					.setPopup(new Popup().setHTML(popupContent))
					.addTo(map);

				markers.push(marker);
			}
		});
	}

	function createMarkerElement(size, groupSize, numberInscriptions) {
		const el = document.createElement('div');
		el.className = `marker ${groupSize}`;
		el.style.width = size;
		el.style.height = size;
		el.style.lineHeight = size;

		if (numberInscriptions > 1) {
			el.innerHTML = numberInscriptions.toString();
		}

		return el;
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
			background-color: var(--teal-4);
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

			&.sm {
				background-color: var(--blue-4);
			}

			&.md {
				background-color: var(--yellow-4);
			}

			&.lg {
				background-color: var(--red-4);
			}

			& :hover {
				filter: brightness(90%);
				box-shadow: var(--shadow-4);
			}
		}

		& .maplibregl-popup-content {
			height: 200px;
			overflow: scroll;
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
