<script>
	import { base } from '$app/paths';
	import InscriptionDate from '$lib/components/InscriptionDate.svelte';
	import BibliographyEntry from '$lib/components/BibliographyEntry.svelte';
	import EditionEntry from '$lib/components/EditionEntry.svelte';
	import * as config from '$lib/config';
	import { codeToHtml } from '$lib/shiki.bundle';
	import { Button } from 'bits-ui';
	import { LucideExternalLink } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { DefaultMarker, MapLibre, Popup } from 'svelte-maplibre';
	import { goto } from '$app/navigation';

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();

	let { slug, metadata, images, html, xml } = data;
	let curImageTitle = $state(images[0]?.desc || '');
	let highlightedXml = $state('');

	const editions = html.divs.find((div) => div.id === 'editions');
	let editionDivs = $state([]);

	const apparatus = html.divs.find((div) => div.id === 'apparatus');
	const translations = html.divs.filter((div) => div.id === 'translation');
	let translationDivs = $state([]);

	const commentary = html.divs.find((div) => div.id === 'commentary');

	let tileSources = images.map(
		(/** @type Object<String, string> */ image) =>
			`${config.imageServer}${slug}/${image.url}/info.json`
	);

	let OpenSeaDragon;

	let activeEditionTab = $state(0);
	let activeTranslationTab = $state(0);
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

		highlightedXml = await codeToHtml(xml, {
			lang: 'xml',
			themes: {
				light: 'rose-pine-dawn',
				dark: 'rose-pine-moon'
			}
		});

		if (editions) {
			editionDivs = [
				...parseEditionDivs(editions.html),
				{ id: 'epidoc', type: 'Epidoc', html: highlightedXml }
			];
			activeEditionTab = 0;
		}

		if (translations) {
			translationDivs = translations
				.map((translation) => parseTranslation(translation))
				.filter(Boolean);
		}
	});

	/**
	 * @param {string} htmlString
	 */
	function parseEditionDivs(htmlString) {
		if (typeof window === 'undefined') {
			return [];
		}
		const parser = new DOMParser();
		const doc = parser.parseFromString(htmlString, 'text/html');
		const editionDivs = Array.from(doc.querySelectorAll('[id^="edition-"]'));

		return editionDivs.map((div) => ({
			id: div.id,
			type: div.id.replace('edition-', ''),
			html: div.outerHTML
		}));
	}

	/**
	 * @param {{ html: string; }} translation
	 */
	function parseTranslation(translation) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(translation.html, 'text/html');
		const id = doc.querySelector('h2')?.textContent?.replace(/\s+translation/i, '');

		if (!id) {
			return null;
		}

		return {
			id: id?.toLowerCase(),
			type: id,
			html: translation.html.replace(/<h2.*?<\/h2>/g, '')
		};
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'k') {
				e.preventDefault();

				const direction = e.key.toLowerCase() === 'j' ? -1 : 1;
				goto(
					`${slug.split('0')[0]}${String(Number(slug.split('ISic')[1]) + direction).padStart(6, '0')}`
				);
			}
		}
	}}
/>

<svelte:head>
	<title>{metadata.file}: {metadata.title} | {config.title}</title>
	<meta name="description" content={metadata.title} />
	<meta
		name="tags"
		content="sicily, inscription, {metadata.textLang._}, {metadata.type._}, {metadata.objectType
			?._}"
	/>
</svelte:head>

<article>
	<section id="overview">
		<div class="overview-header">
			<h1 class="inscription-title">{metadata.file}: {metadata.title}</h1>
		</div>
		<figure id="facsimile-images">
			<section id="image-viewer" style="height: 50vh; width: 100%;"></section>
			<figcaption>{curImageTitle}</figcaption>
		</figure>
		<dl>
			<dt>ID</dt>
			<dd>{metadata.file}</dd>
			<dt>Language</dt>
			<dd>{metadata.textLang._}</dd>
			<dt>Text type</dt>
			<dd><a href={metadata.type.ref}>{metadata.type._}</a></dd>
			<dt>Object type</dt>
			{#if metadata.objectType}
				<dd><a href={metadata.objectType.ref}>{metadata.objectType._}</a></dd>
			{/if}
			<dt>Status</dt>
			<dd>{metadata.status}</dd>
			<dt>Links</dt>
			<dd>
				<a href="{config.publicUrl}inscription/{slug}" target="inscription">
					View in current site <LucideExternalLink />
				</a>
			</dd>
		</dl>
	</section>
	<section id="content">
		<section id="edition">
			<h2>Edition</h2>
			<div class="tabs">
				{#each editionDivs as div, index}
					<Button.Root
						class={activeEditionTab === index ? 'active' : ''}
						onclick={() => (activeEditionTab = index)}
					>
						{div.type}
					</Button.Root>
				{/each}
			</div>
			<div class="edition-content">
				{@html editionDivs[activeEditionTab]?.html || ''}
			</div>
		</section>

		<section id="apparatus">{@html apparatus.html.replace(/h4/g, 'h3')}</section>

		{#if translationDivs.length}
			<section id="translations">
				<h2>Translations</h2>
				<div class="tabs">
					{#each translationDivs as div, index}
						<Button.Root
							class={activeTranslationTab === index ? 'active' : ''}
							onclick={() => (activeTranslationTab = index)}
						>
							{div.type}
						</Button.Root>
					{/each}
				</div>
				<div class="translation-content">
					{@html translationDivs[activeTranslationTab]?.html || ''}
				</div>
			</section>
		{/if}

		<section id="physical-description">
			<h2>Physical description</h2>
			<h3>Support</h3>
			<dl>
				<dt>Description</dt>
				<dd>{metadata.support || config.EMPTY_PLACEHOLDER}</dd>
				<dt>Object type</dt>
				{#if metadata.objectType}
					<dd><a href={metadata.objectType.ref}>{metadata.objectType._}</a></dd>
				{:else}
					<dd>{config.EMPTY_PLACEHOLDER}</dd>
				{/if}
				<dt>Material</dt>
				<dd><a href={metadata.material.ref}>{metadata.material._}</a></dd>
				<dt>Condition</dt>
				{#if metadata.condition?.ana}
					<dd>{metadata.condition.ana.split('.').slice(1).join(', ')}</dd>
				{:else}
					<dd>{metadata.condition._ || config.EMPTY_PLACEHOLDER}</dd>
				{/if}
				<dt>Dimensions</dt>
				<dd>
					{#each metadata.dimensions as dimension, index}
						{dimension.dimension}: {dimension._}
						{dimension.unit}{#if index < metadata.dimensions.length - 1},&#160;{/if}
					{/each}
				</dd>
			</dl>
			<h3>Inscription</h3>
			<dl>
				<dt>Layout</dt>
				<dd>{metadata.layoutDesc.layout.p || config.EMPTY_PLACEHOLDER}</dd>
				<dt>Text condition</dt>
				{#if metadata.layoutDesc.layout.damage.ana}
					<dd>{metadata.layoutDesc.layout.damage.ana.split('.').slice(1).join(', ')}</dd>
				{:else}
					<dd>{metadata.layoutDesc.layout.damage._ || config.EMPTY_PLACEHOLDER}</dd>
				{/if}
				<dt>Lettering</dt>
				<dd>{metadata.handNote.lettering || config.EMPTY_PLACEHOLDER}</dd>
				<dt>Letter heights</dt>
				{#each metadata.handNote.dimensions.filter((dim) => dim?.type === 'letterHeight') as dimension}
					<dd>{dimension.l}: {dimension.h}{dimension.unit}</dd>
				{/each}
				<dt>Interlinear heights</dt>
				{#each metadata.handNote.dimensions.filter((dim) => dim?.type === 'interlinear') as dimension}
					<dd>
						{dimension.l}: {dimension.h}{dimension.h !== 'not measured' ? dimension.unit : ''}
					</dd>
				{/each}
			</dl>
		</section>

		<section id="provenance">
			<h2>Provenance</h2>
			<dl>
				<dt>Place of origin</dt>
				{#if metadata.places.length}
					<dd>
						{metadata.places[0].offset || ''}
						<a href={metadata.places[0].ref}>{metadata.places[0]._}</a>
					</dd>
				{:else}
					<dd>{config.EMPTY_PLACEHOLDER}</dd>
				{/if}
				<dt>Provenance found</dt>
				<dd>{metadata.provenanceFound?._ || config.EMPTY_PLACEHOLDER}</dd>
				{#if metadata.provenanceFound?.geo}
					{@const lngLat = [metadata.provenanceFound.geo[1], metadata.provenanceFound.geo[0]]}
					<dt>Map</dt>
					<dd>
						<MapLibre center={lngLat} zoom={7} class="map" standardControls style={config.mapStyle}>
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
					<dd>{metadata.provenanceObserved?._ || config.EMPTY_PLACEHOLDER}</dd>
					{#if metadata.repository.museum?.location.geo}
						<dt>Map</dt>
						{@const lngLat = [
							metadata.repository.museum.location.geo.lon,
							metadata.repository.museum.location.geo.lat
						]}
						<dd>
							<MapLibre
								center={lngLat}
								zoom={7}
								class="map"
								standardControls
								style={config.mapStyle}
							>
								<DefaultMarker {lngLat}>
									<Popup offset={[0, -10]}>
										<div class="popup">
											{metadata.repository.museum.name}
										</div>
									</Popup>
								</DefaultMarker>
							</MapLibre>
						</dd>
					{/if}
				</dl>
			{/if}
		</section>

		<section id="date">
			<h2>Date</h2>
			{metadata.date._} (<InscriptionDate date={metadata.date} />)
			<dl>
				<dt>Evidence</dt>
				<dd>{metadata.date.evidence || config.EMPTY_PLACEHOLDER}</dd>
			</dl>
		</section>

		<section id="text-type">
			<h2>Text type</h2>
			<p><a href={metadata.type.ref}>{metadata.type._}</a></p>
		</section>

		<section id="commentary">
			{@html commentary.html}
		</section>

		<section id="bibliography">
			<h2>Bibliography</h2>
			<dl>
				<dt>Digital editions</dt>
				<dd>
					<ul>
						{#each metadata.editions as edition}
							<li><EditionEntry {edition} /></li>
						{/each}
					</ul>
				</dd>
				{#if metadata.bibliographyEdition?.bibl?.length}
					<dt>Printed editions</dt>
					<dd>
						<ul class="bibliography-list">
							{#each metadata.bibliographyEdition.bibl as entry}
								{#if entry}
									<li>
										<BibliographyEntry {entry} />
									</li>
								{/if}
							{/each}
						</ul>
					</dd>
				{/if}
			</dl>
		</section>

		<section id="citation-and-status">
			<h2>Citation and editorial status</h2>
			<dl>
				<dt>Citation</dt>
				<dd>{metadata.citation || config.EMPTY_PLACEHOLDER}</dd>
			</dl>
		</section>
	</section>
</article>

<style>
	article {
		display: grid;
		gap: var(--size-4);
		grid-template-columns: 1fr 1fr;
		height: calc(100vh - var(--size-11));
		overflow: hidden;

		:global(h2::first-letter),
		:global(h3::first-letter),
		:global(h4::first-letter),
		:global(h5::first-letter),
		:global(h6::first-letter) {
			text-transform: uppercase;
		}
	}

	#overview {
		border: var(--border-size-1) solid var(--border-color);
		height: 100%;
		overflow-y: auto;
		margin-top: 0;
		padding-inline: var(--size-4);
		padding-top: 0;
		position: sticky;
		top: 0;
	}

	#content {
		height: 100%;
		margin-top: 0;
		padding-inline: var(--size-4);
		overflow-y: auto;
	}

	.overview-header {
		border-bottom: var(--border-size-1) solid var(--border-color);
	}

	#overview h1 {
		font-size: var(--font-size-fluid-1);
		max-inline-size: none;
		padding-block: var(--size-4);
		text-align: center;
	}

	#overview #facsimile-images {
		grid-column: 1;
		grid-row: 1;
		margin: 0 auto;
		padding-inline: var(--size-2);
		width: 100%;
	}

	#overview #facsimile-images figcaption {
		border-top: var(--border-size-1) solid var(--border-color);
		border-bottom: var(--border-size-1) solid var(--border-color);
		font-size: var(--font-size-0);
		max-inline-size: none;
		padding-block: var(--size-4);
		text-align: center;
		text-wrap: balance;
		width: 100%;
	}

	#overview dl {
		column-count: 2;
		column-gap: var(--size-4);
		padding-block: var(--size-4);
	}

	#overview dl dt,
	#overview dl dd {
		display: inline;
		margin: 0;
	}

	#overview dl dt::after {
		content: ': ';
	}

	#overview dl dd::after {
		content: '';
		display: block;
		margin-bottom: var(--size-2);
	}

	#overview dl dd a {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
	}

	#content h2,
	#content h3 {
		font-family: var(--font-family);
		padding-block: var(--size-2);
	}

	#content > section {
		border-bottom: var(--border-size-1) solid var(--border-color);
		padding-bottom: var(--size-8);
	}

	#edition {
		font-family: var(--font-antique);
		grid-column: 2;
		grid-row: 1;
		margin-bottom: var(--size-4);
		margin-top: 0;
	}

	.edition-content {
		overflow-x: scroll;
	}

	.edition-content :global(pre) {
		white-space: pre-wrap;
	}

	.tabs {
		border-bottom: var(--border-size-1) solid var(--surface-4);
		display: flex;
		font-family: var(--font-family);
		gap: var(--size-2);
		margin-block: var(--size-4);
	}

	.tabs :global(button) {
		margin-block-end: var(--size-2);
		text-transform: capitalize;
	}

	.tabs :global(.active) {
		background-color: var(--surface-4);
	}

	@media (max-width: 768px) {
		article {
			display: block;
			height: auto;
			overflow: visible;
		}

		#overview {
			position: relative;
			height: auto;
			margin-bottom: var(--size-8);
		}

		#content {
			height: auto;
			overflow: visible;
		}

		#overview dl {
			column-count: 1;
		}
	}

	/* Epidoc styles */
	:global(.linenumber) {
		margin-right: var(--size-4);
	}
</style>
