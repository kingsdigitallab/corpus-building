<script>
	import InscriptionTable from '$lib/components/InscriptionTable.svelte';
	import * as config from '$lib/config';
	import { LucideExternalLink } from 'lucide-svelte';

	/** @type {{ data: import('./$types').PageData }} */
	const { data } = $props();
	const { zotero, inscriptions } = data;
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

	<InscriptionTable {inscriptions} />
</article>

<style>
	header a {
		align-items: center;
		display: inline-flex;
		gap: var(--size-2);
	}
</style>
