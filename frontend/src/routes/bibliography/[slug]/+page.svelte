<script>
	import InscriptionTable from '$lib/components/InscriptionTable.svelte';
	import * as config from '$lib/config';
	import { LucideExternalLink } from 'lucide-svelte';

	/** @type {{ data: import('./$types').PageData }} */
	const { data } = $props();
	const { zotero, inscriptions, isBulletin } = data;
</script>

<svelte:head>
	<title>{zotero.title} | {config.title}</title>
	<meta name="description" content={zotero.title} />
	<meta name="tags" content="bibliography, {zotero.title}" />
</svelte:head>

<article>
	<header>
		<hgroup>
			<h1>{zotero.title}</h1>
			<p class="description">{@html zotero.citation}</p>
			<a href={zotero.uri} target="zotero">
				View in Zotero <LucideExternalLink />
			</a>
		</hgroup>
	</header>

	<section class="inscriptions">
		<h2>Inscriptions</h2>
		<InscriptionTable
			{inscriptions}
			showCitedRange={true}
			showBulletinDate={isBulletin}
			showSearch={true}
			downloadFilename={zotero.title}
			sortOptions={[
				{ value: 'citedRangeSort', label: 'Cited range' },
				{ value: 'bulletinDateSort', label: 'Bulletin date' },
				{ value: 'file', label: 'File' },
				{ value: 'materialSort', label: 'Material' },
				{ value: 'settlement', label: 'Current location' },
				{ value: 'typeSort', label: 'Inscription type' },
				{ value: 'languageSort', label: 'Language' }
			]}
		/>
	</section>
</article>

<style>
	header a {
		align-items: center;
		display: inline-flex;
		gap: var(--size-2);
	}

	/* Zihao added: bibliography page header section layout */

	/* ZL: Give the whole header more breathing room from the top */
	header {
		margin-block-start: var(--size-6);
		margin-block-end: var(--size-5);
	}

	/* Space under the main title */
	header h1 {
		margin-block-end: var(--size-3);
	}

	/* Space between citation text and links */
	header .description {
		margin-block-end: var(--size-3);
		line-height: 1.6;
	}

	/* Slightly separate the Zotero link from text */
	header a {
		margin-block-start: var(--size-1);
	}

	/* Zihao Changed: Bibliography entry – inscriptions table view hover */

	/* Light mode */
	:global([data-color-scheme='light'] table tbody tr:hover),
	:global([data-color-scheme='light'] table tbody tr:hover td) {
		background-color: var(--brown-0); /* same colour as inscription table view */
		color: var(--text-1);
	}

	/* Dark mode */
	:global([data-color-scheme='dark'] table tbody tr:hover),
	:global([data-color-scheme='dark'] table tbody tr:hover td) {
		background-color: #50514f; /* same colour as inscription table view */
		color: var(--text-1);
	}
</style>
