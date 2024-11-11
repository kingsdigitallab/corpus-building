<script>
	import { base } from '$app/paths';
	import InscriptionDate from '$lib/components/InscriptionDate.svelte';
	import * as config from '$lib/config';
	import { onMount } from 'svelte';
	import { DefaultMarker, MapLibre, Popup } from 'svelte-maplibre';

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();

	let { slug, metadata, images, html } = data;
	let curImageTitle = $state(images[0].desc);

	const edition = html.divs.find((div) => div.id === 'edition');
	const apparatus = html.divs.find((div) => div.id === 'apparatus');
	const translations = html.divs.filter((div) => div.id === 'translation');
	const commentary = html.divs.find((div) => div.id === 'commentary');
	const bibliography = html.divs.filter((div) => div.id === 'bibliography');

	let tileSources = images.map(
		(/** @type Object<String, string> */ image) =>
			`${config.imageServer}${slug}/${image.url}/info.json`
	);

	let OpenSeaDragon;

	onMount(async () => {
		OpenSeaDragon = (await import('openseadragon')).default;

		const viewer = OpenSeaDragon({
			id: 'image-viewer',
			prefixUrl: `${base}/openseadragon/images/`,
			tileSources,
			sequenceMode: true,
			showReferenceStrip: true,
			preserveViewport: true
		});

		viewer.addHandler('page', function (/** @type {{ page: number; }} */ event) {
			const image = images[event.page];
			curImageTitle = `${image.surfaceType}, ${image.desc}`;
		});
	});
</script>

<article>
	<hgroup>
		<h1 class="inscription-title">{metadata.file}: {metadata.title}</h1>
		<p>
			{metadata.textLang._},
			<a href={metadata.type.ref}>{metadata.type._}</a>{#if metadata.objectType},
				<a href={metadata.objectType.ref}>{metadata.objectType._}</a>{/if}
		</p>
		<p>
			{metadata.status},
			<a href="{config.publicUrl}inscription/{slug}" target="inscription">View in current site</a>
		</p>
	</hgroup>
	<div class="sections">
		<figure id="facsimile-images">
			<section id="image-viewer" style="height: 50vh; width: 100%;"></section>
			<figcaption>{curImageTitle}</figcaption>
		</figure>

		<section id="edition">{@html edition.html}</section>

		<section id="apparatus">{@html apparatus.html}</section>

		{#if translations.length}
			<section id="translations">
				{#each translations as translation}
					{@html translation.html}
				{/each}
			</section>
		{/if}

		<section id="physical-description">
			<h2>Physical description</h2>
			<section>
				<h3>Support</h3>
				<dl>
					<dt>Description</dt>
					<dd>{metadata.support}</dd>
					{#if metadata.objectType}
						<dt>Object type</dt>
						<dd><a href={metadata.objectType.ref}>{metadata.objectType._}</a></dd>
					{/if}
					<dt>Material</dt>
					<dd><a href={metadata.material.ref}>{metadata.material._}</a></dd>
					<dt>Condition</dt>
					<dd>TODO: add condition</dd>
					<dt>Dimensions</dt>
					<dd>
						{#each metadata.dimensions as dimension, index}
							{dimension.dimension}: {dimension._}
							{dimension.unit}{#if index < metadata.dimensions.length - 1},&#160;{/if}
						{/each}
					</dd>
				</dl>
			</section>
			<section>
				<h3>Inscription</h3>
				<dl>
					<dt>Layout</dt>
					<dd>{metadata.layoutDesc.layout.p}</dd>
					<dt>Text condition</dt>
					<dd>{metadata.layoutDesc.layout.damage || config.EMPTY_PLACEHOLDER}</dd>
					<dt>Lettering</dt>
					<dd>{metadata.handNote.lettering}</dd>
					<dt>Letter heights</dt>
					{#each metadata.handNote.dimensions.filter((dim) => dim.type === 'letterHeight') as dimension}
						<dd>{dimension.l}: {dimension.h}{dimension.unit}</dd>
					{/each}
					<dt>Interlinear heights</dt>
					{#each metadata.handNote.dimensions.filter((dim) => dim.type === 'interlinear') as dimension}
						<dd>
							{dimension.l}: {dimension.h}{dimension.h !== 'not measured' ? dimension.unit : ''}
						</dd>
					{/each}
				</dl>
			</section>
		</section>

		<section id="provenance">
			<h2>Provenance</h2>
			<dl>
				<dt>Place of origin</dt>
				<dd>
					{metadata.places[0].offset || ''}
					<a href={metadata.places[0].ref}>{metadata.places[0]._}</a>
				</dd>
				<dt>Provenance found</dt>
				<dd>{metadata.provenanceFound._}</dd>
				{#if metadata.provenanceFound.geo}
					{@const lngLat = [metadata.provenanceFound.geo[1], metadata.provenanceFound.geo[0]]}
					<dt>Map</dt>
					<dd>
						<MapLibre
							center={lngLat}
							zoom={7}
							class="map"
							standardControls
							style="https://api.maptiler.com/maps/positron/style.json?key=brTBbnRxuiKp6PgjwFPr"
						>
							<DefaultMarker {lngLat}>
								<Popup offset={[0, -10]}>
									<div class="popup">
										{metadata.provenanceFound._}
									</div>
								</Popup>
							</DefaultMarker>
						</MapLibre>
					</dd>
				{/if}
			</dl>
		</section>

		<section id="current-location">
			<h2>Current location</h2>
			{#if metadata.provenanceLost}
				<p>{metadata.provenanceLost._}</p>
			{:else}
				<dl>
					<dt>Place</dt>
					<dd>{metadata.settlement}, {metadata.country}</dd>
					<dt>Repository</dt>
					<dd>
						<a href={metadata.repository.ref}>{metadata.repository._}</a>{#if metadata.idno},
							{metadata.idno._}{/if}
					</dd>
					<dt>Autopsy</dt>
					<dd>{metadata.provenanceObserved._}</dd>
					<dt>Map</dt>
					<dd>TODO: use the geo information in the museums dataset</dd>
				</dl>
			{/if}
		</section>

		<section id="date">
			<h2>Date</h2>
			<InscriptionDate inscription={metadata} />
			<dl>
				<dt>Evidence</dt>
				<dd>{metadata.evidence}</dd>
			</dl>
		</section>

		<section id="text-type">
			<h2>Text type</h2>
			<p><a href={metadata.type.ref}>{metadata.type._}</a></p>
		</section>

		<section id="commentary">
			{@html commentary.html}
		</section>

		{#if bibliography.length}
			<section id="bibliography">
				{#each bibliography as bib}
					{@html bib.html}
				{/each}
			</section>
		{/if}

		<section id="citation-and-status">
			<h2>Citation and editorial status</h2>
			<dl>
				<dt>Citation</dt>
				<dd>{metadata.citation}</dd>
			</dl>
		</section>
	</div>
</article>

<style>
	h1 {
		font-size: var(--font-size-fluid-1);
		max-inline-size: none;
	}

	div.sections {
		display: grid;
		gap: var(--size-8);
		grid-template-columns: 2fr 1fr;

		:global(h2::first-letter),
		:global(h3::first-letter),
		:global(h4::first-letter),
		:global(h5::first-letter),
		:global(h6::first-letter) {
			text-transform: uppercase;
		}
	}

	#facsimile-images {
		border: var(--border-size-1) solid var(--gray-2);
		grid-column: 1;
		grid-row: 1;
	}

	#edition {
		font-family: var(--font-antique);
		grid-column: 2;
		grid-row: 1;
	}

	div.sections > *:not(#facsimile-images):not(#edition) {
		grid-column: 1 / -1;
	}

	section {
		margin-block: var(--size-4);
	}

	figcaption {
		max-inline-size: none;
	}

	:global(.map) {
		border: var(--border-size-1) solid var(--text-1);
		font-family: var(--font-family);
		height: 300px;
		width: 100%;

		:global(.maplibregl-popup-content .popup) {
			max-height: 200px;
			max-width: 200px;
			overflow: scroll;
		}
	}

	@media (max-width: 768px) {
		div.sections {
			grid-template-columns: 1fr;
		}

		#facsimile-images,
		#edition {
			grid-column: 1;
		}

		#edition {
			grid-row: 2;
		}

		section {
			margin-block: var(--size-2);
		}
	}

	/* Epidoc styles */
	:global(.linenumber) {
		margin-right: var(--size-4);
	}
</style>
