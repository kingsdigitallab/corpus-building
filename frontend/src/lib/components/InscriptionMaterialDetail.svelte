<script>
	import * as config from '$lib/config';
	import { DefaultMarker, MapLibre, Marker, Popup } from 'svelte-maplibre';

	let { material, mapZoom = 7 } = $props();
</script>

<dl>
	<dt>Description</dt>
	<dd>{material?._ || config.EMPTY_PLACEHOLDER}</dd>
	<dt>Type > subtype</dt>
	<dd>
		{#if material.type}
			{#if material?.ref}
				<a class="badge strong" href={material.ref}>
					{material.type}
					{#if material.subtype}
						> {material.subtype}
					{/if}
				</a>
			{:else}
				{material.type}
				{#if material.subtype}
					> {material.subtype}
				{/if}
			{/if}
		{:else}
			{config.EMPTY_PLACEHOLDER}
		{/if}
	</dd>
	{#if material.placeName?.location?.geo}
		{@const location = material.placeName.location}
		{@const ref = material.placeName.ref}
		{@const locationName = ref._}
		{@const geo = location.geo.split(',')}
		{@const lngLat = [geo[1], geo[0]]}
		{@const radius = Number(location?.precision?.radius || null) || null}
		{@const markerScale = radius
			? Math.min(2, Math.max(0.5, 1.8 - 0.3 * Math.log10(Number(radius) || 1)))
			: Math.min(2, Math.max(0.5, mapZoom / 7))}
		{@const markerClass = radius ? (radius > 5000 ? 'lg' : radius > 1000 ? 'md' : 'sm') : 'sm'}
		<dt>Place</dt>
		<dd><a href={ref.target}>{locationName}</a></dd>
		<dt>Map</dt>
		<dd style="--marker-scale: {markerScale}">
			<MapLibre
				center={lngLat}
				bind:zoom={mapZoom}
				class="map"
				standardControls
				style={config.mapStyle}
			>
				{#if radius}
					<Marker {lngLat} class="marker {markerClass}">
						<Popup>
							<div class="popup">
								<a href={ref.target}>{locationName}</a>
							</div>
						</Popup>
					</Marker>
				{:else}
					<DefaultMarker {lngLat} class="marker {markerClass}">
						<Popup>
							<div class="popup">
								<a href={ref.target}>{locationName}</a>
							</div>
						</Popup>
					</DefaultMarker>
				{/if}
			</MapLibre>
		</dd>
	{/if}
</dl>
