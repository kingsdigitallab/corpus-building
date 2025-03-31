<script>
	import { Button } from 'bits-ui';
	import { LucideDownload } from 'lucide-svelte';
	import * as config from '$lib/config';
	import { codeToHtml } from '$lib/shiki.bundle';

	const { slug, metadata, xml, editions } = $props();

	const highlightedXml = $derived(highlightXml());

	async function highlightXml() {
		return await codeToHtml(xml, {
			lang: 'xml',
			themes: {
				light: 'rose-pine-dawn',
				dark: 'rose-pine-moon'
			}
		});
	}

	const editionDivs = $derived([
		...parseEditionDivs(editions.html),
		{ id: 'epidoc', type: 'Epidoc', html: highlightXml() }
	]);

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
			type: div.id.replace('edition-', '').split('-').join(' '),
			html: div.outerHTML
		}));
	}

	let activeEditionTab = $state(0);
</script>

<section id="edition">
	<h2>Edition</h2>
	{#if metadata.editionAuthor}
		<div class="edition-author">
			{#if metadata.editionAuthor.citation}
				{@html metadata.editionAuthor.citation}
				<a href={metadata.editionAuthor.ref}>Zotero</a>
			{:else}
				<a href={metadata.editionAuthor.ref}>{metadata.editionAuthor.name}</a>
			{/if}
		</div>
	{/if}
	<div class="tabs">
		{#each editionDivs as div, index}
			<Button.Root
				class={activeEditionTab === index ? 'active' : ''}
				onclick={() => (activeEditionTab = index)}
			>
				{div.type}
			</Button.Root>
		{/each}
		<a
			href={`${config.xmlServerPath}${slug}.xml`}
			role="button"
			aria-label="Download Epidoc XML for {slug}"
			download
			target="download_epidoc"
			rel="noopener noreferrer"
		>
			<LucideDownload />
		</a>
	</div>
	<div class="surface-4 edition-content {editionDivs[activeEditionTab]?.type.toLowerCase()}">
		{#await editionDivs[activeEditionTab]?.html then html}
			{@html html}
		{/await}
	</div>
</section>

<style>
	#edition {
		font-weight: 500;
		grid-column: 2;
		grid-row: 1;
		margin-bottom: var(--size-4);
	}

	.edition-author {
		margin-bottom: var(--size-4);
	}

	.edition-content {
		border-radius: var(--radius-2);
		font-family: var(--font-family-greek);
		overflow-x: scroll;
		padding-block: var(--size-4);
		padding-left: var(--size-8);
		padding-right: var(--size-3);
	}

	.edition-content :global(pre) {
		white-space: pre-wrap;
	}

	.edition-content.epidoc {
		padding-block: unset;
		padding-left: unset;
		max-height: 75vh;
		overflow-y: auto;
	}

	.edition-content.epidoc :global(pre) {
		padding-block: var(--size-4);
		padding-inline: var(--size-3);
	}

	/* Epidoc styles */
	:global(.textpartnumber) {
		display: block;
		font-weight: 600;
		margin-left: calc(-1 * var(--size-6));
	}

	:global(.textpartnumber:not(:first-of-type)) {
		margin-top: var(--size-4);
	}

	:global(.textpartnumber:not(:has(+ br))) {
		margin-bottom: var(--size-4);
	}

	:global(.textpart .linenumber) {
		display: inline-block;
		margin-left: calc(-1 * var(--size-9));
		margin-right: var(--size-3);
		text-align: right;
		width: var(--size-8);
	}
</style>
