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

	<InscriptionTable
		{inscriptions}
		showCitedRange={true}
		showBulletinDate={isBulletin}
		showSearch={true}
		sortOptions={[
			{ value: 'citedRangeSort', label: 'Cited range' },
			{ value: 'file', label: 'File' },
			{ value: 'materialSort', label: 'Material' },
			{ value: 'settlement', label: 'Current location' },
			{ value: 'typeSort', label: 'Inscription type' },
			{ value: 'languageSort', label: 'Language' }
		]}
	/>
</article>

<style>
	header a {
		align-items: center;
		display: inline-flex;
		gap: var(--size-2);
	}
</style>
