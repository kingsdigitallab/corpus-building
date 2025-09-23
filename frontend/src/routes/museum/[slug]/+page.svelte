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
		<h1>
			{museum.name}
		</h1>

		<section class="description">
			{#if museum.description}
				<p>
					{museum.description}
				</p>
			{/if}

			<ul class="links">
				<li>
					<a href={museum.uri} target="museum">
						View in current site <LucideExternalLink />
					</a>
				</li>
				{#if museum.url}
					<li>
						<a href={museum.url} target="museum">{museum.url} <LucideExternalLink /></a>
					</li>
				{/if}
			</ul>
		</section>

		<section class="location">
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
	</header>

	<section class="inscriptions">
		<h2>Inscriptions</h2>
		<InscriptionTable {inscriptions} />
	</section>
</article>

<style>
	article header {
		border-left: var(--border-size-1) solid var(--border-color);
		border-right: var(--border-size-1) solid var(--border-color);
		height: 100%;
		overflow-y: auto;
		margin-top: 0;
		padding-inline: var(--size-4);
		padding-top: 0;
		top: 0;
	}

	header h1,
	section.location h2 {
		border-bottom: var(--border-size-1) solid var(--border-color);
		max-inline-size: none;
		padding-block: var(--size-4);
		text-align: center;
	}

	h1 {
		font-size: var(--font-size-fluid-1);
	}

	h2 {
		text-align: left !important;
	}

	p {
		max-inline-size: none;
	}

	ul.links {
		list-style: none;
		padding-inline-start: 0;
		padding-top: var(--size-4);
	}

	ul.links li {
		padding-inline-start: 0;
	}

	ul.links a {
		align-items: center;
		display: inline-flex;
		font-size: var(--font-size-1);
		gap: var(--size-2);
	}

	address {
		padding-block: var(--size-4);
	}

	section.inscriptions h2 {
		padding-block: var(--size-4);
	}
</style>
