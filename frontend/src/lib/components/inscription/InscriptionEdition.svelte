<script>
	import { Button } from 'bits-ui';
	import { LucideDownload, LucideX, LucidePlus } from 'lucide-svelte';
	import * as config from '$lib/config';
	import { codeToHtml } from '$lib/shiki.bundle';

	const { slug, metadata, xml, editions } = $props();

	/**
	 * @param {string} htmlString
	 * @returns {Array<{id: string, type: string, html: string, isExpandable: boolean}>}
	 */
	function parseEditionDivs(htmlString) {
		try {
			if (!htmlString) return [];

			const div = document.createElement('div');
			div.innerHTML = htmlString;
			const editionDivs = Array.from(div.querySelectorAll('[id^="edition-"]'));

			return editionDivs.map((div) => ({
				id: div.id,
				type: div.id.replace('edition-', '').split('-').join(' '),
				html: div.outerHTML,
				isExpandable: (div.outerHTML.match(/<span/g) || []).length > 10
			}));
		} catch (e) {
			console.error('Error parsing edition divs:', e);
			return [];
		}
	}

	/**
	 * @type {Array<{id: string, type: string, html: Promise<string> | string, isExpandable: boolean}>}
	 */
	let editionDivs = $state([]);

	$effect(() => {
		editionDivs = [
			...parseEditionDivs(editions.html),
			{ id: 'epidoc', type: 'Epidoc', html: highlightXml(), isExpandable: true }
		];
	});

	async function highlightXml() {
		return await codeToHtml(xml, {
			lang: 'xml',
			themes: {
				light: 'rose-pine-dawn',
				dark: 'rose-pine-moon'
			}
		});
	}

	let activeEditionTab = $state(0);
	let isExpanded = $state(false);
</script>

<section id="edition">
	<h2>Edition</h2>
	{#if metadata.editionAuthor}
		<div class="edition-author">
			{#if metadata.editionAuthor.citation}
				{@html metadata.editionAuthor.citation}
				<a href={metadata.editionAuthor.ref}>Zotero</a>
			{:else}
				<a href={metadata.editionAuthor.name.ref}>{metadata.editionAuthor.name._}</a>
			{/if}
		</div>
	{/if}
	{#if editionDivs.length > 0}
		{#await editionDivs[activeEditionTab]?.html}
			<div aria-busy="true" aria-live="polite">Loading...</div>
		{:then html}
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
			<div
				class="surface-4 edition-content {editionDivs[activeEditionTab]?.type.toLowerCase()}"
				class:expanded={isExpanded}
			>
				{@html html}
			</div>
			<div style="display: {editionDivs[activeEditionTab]?.isExpandable ? 'block' : 'none'}">
				<Button.Root
					class="edition-expand-button {isExpanded ? 'expanded' : ''}"
					onclick={() => (isExpanded = !isExpanded)}
				>
					{#if isExpanded}
						<LucideX />
						Collapse and show less
					{:else}
						<LucidePlus />
						Expand to view all content
					{/if}
				</Button.Root>
			</div>
		{/await}
	{:else}
		<div aria-busy="true" aria-live="polite">Loading...</div>
	{/if}
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
		max-height: 50vh;
		overflow-x: scroll;
		overflow-y: scroll;
		padding-block: var(--size-4);
		padding-left: var(--size-8);
		padding-right: var(--size-3);
		position: relative;
		transition: max-height 0.3s ease-in-out;
	}

	.edition-content :global(pre) {
		white-space: pre-wrap;
	}

	.edition-content.epidoc {
		padding-block: unset;
		padding-left: unset;
		overflow-y: auto;
	}

	.edition-content.epidoc :global(pre) {
		padding-block: var(--size-4);
		padding-inline: var(--size-3);
	}

	.edition-content.expanded {
		max-height: none;
	}

	:global(.edition-expand-button) {
		background-color: var(--surface-4);
		margin-block: var(--size-4);
		text-transform: unset;
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

	:global(.miniapp:not(:empty)) {
		margin-block-start: var(--size-6);
		position: relative;
	}

	:global(.miniapp:empty) {
		display: none;
	}

	:global(.miniapp:not(:empty)::before) {
		/* or '†' or '※' */
		content: '¶';
		left: calc(-1 * var(--size-9));
		margin-right: var(--size-3);
		position: absolute;
		text-align: right;
		width: var(--size-8);
	}
</style>
