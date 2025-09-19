<script>
	import InscriptionTable from '$lib/components/InscriptionTable.svelte';
	import * as config from '$lib/config';
	import { LucideExternalLink } from 'lucide-svelte';
	import { DefaultMarker, MapLibre, Popup } from 'svelte-maplibre';

	/** @type {{ data: import('./$types').PageData }} */
	const { data } = $props();
	const { museum, inscriptions } = data;
</script>

<svelte:head>
	<title>{museum.name} | {config.title}</title>
	<meta name="description" content={museum.name} />
	<meta name="tags" content="museum, inscriptions, {museum.name}" />
</svelte:head>

{#snippet address(/** @type {import('./$types').PageData['museum']['location']} */ location)}
	<address>
		<p>{location.address}</p>
		<p>{location.settlement}, {location.region}, {location.country}</p>
	</address>
{/snippet}

<article>
	<header>
		<hgroup>
			<h1>
				{museum.name}
				<small class="badge">{museum.type}</small>
			</h1>
			<p class="description">
				{museum.description}
			</p>
			<a href={museum.uri} target="museum">
				View in current site <LucideExternalLink />
			</a>
			{#if museum.url}
			<a href={museum.url} target="museum">{museum.url} <LucideExternalLink /></a>
			{/if}
		</hgroup>
	</header>

	<section>
		<h2>Location</h2>
		{@render address(museum.location)}
		{#if museum.location.geo}
			{@const geo = museum.location.geo}
			{@const lngLat = [geo.lon, geo.lat]}
			<MapLibre center={lngLat} zoom={7} class="map" standardControls style={config.mapStyle}>
				<DefaultMarker {lngLat}>
					<Popup offset={[0, -10]}>
						<div class="popup">
							<h3>{museum.name}</h3>
							{@render address(museum.location)}
						</div>
					</Popup>
				</DefaultMarker>
			</MapLibre>
		{/if}
	</section>

	<section>
		<h2>Inscriptions</h2>
		<InscriptionTable {inscriptions} />
	</section>
</article>

<style>
	header a {
		align-items: center;
		display: inline-flex;
		gap: var(--size-2);
	}
</style>
