<script>
	import { base } from '$app/paths';
	import InscriptionDate from '$lib/components/InscriptionDate.svelte';
	import BibliographyEntry from '$lib/components/BibliographyEntry.svelte';
	import EditionEntry from '$lib/components/EditionEntry.svelte';
	import * as config from '$lib/config';
	import { Button } from 'bits-ui';
	import { onMount } from 'svelte';
	import { DefaultMarker, MapLibre, Popup } from 'svelte-maplibre';
	import { goto } from '$app/navigation';
	import InscriptionEdition from '$lib/components/inscription/InscriptionEdition.svelte';
	import InscriptionOverview from '$lib/components/inscription/InscriptionOverview.svelte';
	import ScrollSpy from '$lib/components/ScrollSpy.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();
	let { slug, metadata, images, html, xml } = data;

	const editions = $derived(html.divs.find((div) => div.id === 'editions'));
	const apparatus = $derived(html.divs.find((div) => div.id === 'apparatus'));
	const translations = $derived(html.divs.filter((div) => div.id === 'translation'));

	/**
	 * @type {{ id: string; type: string; html: string; }[]}
	 */
	let translationDivs = $state([]);

	const bibliographyEdition = $derived(
		metadata?.bibliographyEdition?.bibl
			?.filter((b) => b)
			.map((a) => ({ ...a, date: a.date ? Number.parseInt(a.date) : null }))
			.sort((a, b) => (a.date || 0) - (b.date || 0))
	);

	const bibliographyDiscussion = $derived(
		metadata.bibliographyDiscussion?.bibl
			?.filter((b) => b)
			.map((a) => ({ ...a, date: a.date ? Number.parseInt(a.date) : null }))
			.sort((a, b) => (a.date || 0) - (b.date || 0))
	);

	const commentary = $derived(html.divs.find((div) => div.id === 'commentary'));
	let activeTranslationTab = $state(0);

	onMount(async () => {
		if (translations) {
			translationDivs = translations
				.map((/** @type {{ html: string; }} */ translation) => parseTranslation(translation))
				.filter(Boolean);
		}
	});

	/**
	 * @param {{ html: string; }} translation
	 * @returns {{ id: string; type: string; html: string; }}
	 */
	function parseTranslation(translation) {
		const parser = new DOMParser();
		const doc = parser.parseFromString(translation?.html || '', 'text/html');
		const id = doc.querySelector('h2')?.textContent?.replace(/\s+translation/i, '');

		if (!id) {
			return null;
		}

		return {
			id: id?.toLowerCase(),
			type: id,
			html: translation?.html?.replace(/<h2.*?<\/h2>/g, '') || ''
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
		content="sicily, inscription, {metadata.textLang?._}, {metadata.type?._}, {metadata.objectType
			?._}"
	/>
</svelte:head>

<article>
	<InscriptionOverview {slug} {metadata} {images} />

	<section id="content">
		<InscriptionEdition {slug} {metadata} {xml} {editions} />

		{#if apparatus?.html}
			<section id="apparatus">{@html apparatus.html.replace(/h4/g, 'h3')}</section>
		{/if}

		{#if translationDivs.length}
			<section id="translations">
				<h2>Translations</h2>
				<div class="tabs">
					{#each translationDivs as div, index}
						<Button.Root
							class={activeTranslationTab === index ? 'secondary' : 'secondary-inverse'}
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
				<dd>{metadata.support?._ || metadata.support || config.EMPTY_PLACEHOLDER}</dd>
				<dt>Object type</dt>
				{#if metadata.objectType}
					<dd>
						{#if metadata.objectType?.ref}
							<a class="badge strong" href={metadata.objectType.ref}
								>{metadata.objectType?._ || config.EMPTY_PLACEHOLDER}</a
							>
						{:else}
							{metadata.objectType?._ || config.EMPTY_PLACEHOLDER}
						{/if}
					</dd>
				{:else}
					<dd>{config.EMPTY_PLACEHOLDER}</dd>
				{/if}
				<dt>Material</dt>
				<dd>
					{#if metadata.material?.ref}
						<a class="badge strong" href={metadata.material.ref}
							>{metadata.material?._ || config.EMPTY_PLACEHOLDER}</a
						>
					{:else}
						{metadata.material?._ || config.EMPTY_PLACEHOLDER}
					{/if}
				</dd>
				<dt>Condition</dt>
				{#if metadata.condition?.ana}
					<dd>{metadata.condition.ana.split('.').slice(1).join(', ')}</dd>
				{:else}
					<dd>{metadata.condition?._ || config.EMPTY_PLACEHOLDER}</dd>
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
				<dd>{metadata?.layoutDesc?.layout?.p || config.EMPTY_PLACEHOLDER}</dd>
				<dt>Text condition</dt>
				{#if metadata?.layoutDesc?.layout?.damage?.ana}
					<dd>{metadata.layoutDesc.layout.damage.ana.split('.').slice(1).join(', ')}</dd>
				{:else}
					<dd>{metadata?.layoutDesc?.layout?.damage?._ || config.EMPTY_PLACEHOLDER}</dd>
				{/if}
				{#if metadata?.handNote?.lettering}
					<dt>Lettering</dt>
					<dd>
						<p>{metadata.handNote.lettering._}</p>
						{#if metadata.handNote.lettering?.ref}
							<ul>
								{#each metadata.handNote.lettering.ref as aref}
									<li><a href={aref.target}>{aref._}</a></li>
								{/each}
							</ul>
						{/if}
					</dd>
				{/if}
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
						{#if metadata.places[0]?.ref}
							<a class="badge strong" href={metadata.places[0].ref}>{metadata.places[0]._}</a>
						{:else}
							{metadata.places[0]?._ || config.EMPTY_PLACEHOLDER}
						{/if}
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
					{#if metadata.repository}
						<dd>
							{#if metadata.repository.museum}
								<a href={`${base}/museum/${metadata.repository.museum.slug}`}>
									{metadata.repository.museum.name}
								</a>
							{:else}
								{metadata.repository._}
							{/if}
							{#if metadata.idno}
								, {metadata.idno._}
							{/if}
						</dd>
					{/if}
					<dt>Autopsy</dt>
					<dd>{metadata.provenanceObserved?._ || config.EMPTY_PLACEHOLDER}</dd>
					{#if metadata?.repository?.museum?.location?.geo}
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
			<p>
				{#if metadata.type?.ref}
					<a class="badge strong" href={metadata.type.ref}
						>{metadata.type?._ || config.EMPTY_PLACEHOLDER}</a
					>
				{:else}
					{metadata.type?._ || config.EMPTY_PLACEHOLDER}
				{/if}
			</p>
		</section>

		{#if commentary?.html}
			<section id="commentary">
				{@html commentary.html}
			</section>
		{/if}

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
				{#if bibliographyEdition && bibliographyEdition.length}
					<dt>Printed editions</dt>
					<dd>
						<ul class="bibliography-list">
							{#each bibliographyEdition as entry}
								{#if entry}
									<li>
										<BibliographyEntry {entry} />
									</li>
								{/if}
							{/each}
						</ul>
					</dd>
				{/if}
				{#if bibliographyDiscussion?.length}
					<dt>Discussion</dt>
					<dd>
						<ul class="bibliography-list">
							{#each bibliographyDiscussion as entry}
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
				<dt>Editor</dt>
				<dd>
					{metadata.citation.editor?._ || config.EMPTY_PLACEHOLDER}
				</dd>
				<dt>Principal contributor</dt>
				<dd>
					{metadata.citation.principal?._ || config.EMPTY_PLACEHOLDER}
				</dd>
				<dt>Contributors</dt>
				<dd>
					{#if metadata.citation.contributors.length}
						<ul class="contributors">
							{#each metadata.citation.contributors as contributor}
								<li>
									{#if contributor.ref}
										<a href={contributor.ref}>{contributor._}</a>
									{:else}
										<span>{contributor._}</span>
									{/if}
								</li>
							{/each}
						</ul>
					{:else}
						{config.EMPTY_PLACEHOLDER}
					{/if}
				</dd>
				<dt>Last revision</dt>
				<dd>
					{metadata.citation.change?.when
						? new Date(metadata.citation.change.when).toLocaleDateString()
						: config.EMPTY_PLACEHOLDER}
				</dd>
			</dl>
		</section>
	</section>

	<section id="page-navigation">
		<ScrollSpy
			root="#content"
			displayStyle="dots"
			excludeIds={['overview', 'image-viewer', 'content', 'page-navigation']}
			headingSelectors={['h2']}
		/>
	</section>
</article>

<style>
	article {
		display: grid;
		gap: var(--size-4);
		grid-template-columns: 4fr 4fr 0.1fr;
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

	#content {
		height: 100%;
		margin-top: 0;
		padding-inline: var(--size-4);
		overflow-y: auto;
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

	.contributors {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-1);
		padding-left: 0;
	}

	.contributors li {
		list-style: none;
		padding-left: 0;
	}

	.contributors li:not(:last-child)::after {
		content: ',';
	}

	#page-navigation {
		margin-top: var(--size-9);
		margin-bottom: var(--size-0);
	}

	@media (max-width: 768px) {
		article {
			display: block;
			height: auto;
			overflow: visible;
		}

		#content {
			height: auto;
			overflow: visible;
		}
	}
</style>
