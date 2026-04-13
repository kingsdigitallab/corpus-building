<script>
	import * as config from '$lib/config';
	import InscriptionPagination from '$lib/components/InscriptionPagination.svelte';
	import { downloadCSV } from '$lib/utils/download';
	import { Button } from 'bits-ui';
	import { DownloadIcon, LucideArrowUp, LucideArrowDown } from 'lucide-svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	const { bibliography } = data;

	let q = $state('');
	let sortBy = $state('author');
	let sortDir = $state(1);
	let page = $state(1);
	let pageSize = $state(50);
	const pageSizeOptions = [25, 50, 100];

	const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFKD');

	const filtered = $derived(
		bibliography.filter((e) => {
			if (!q) return true;
			const hay = `${e.title} ${e.author} ${e.date}`.toLowerCase();
			return normalize(hay).includes(normalize(q));
		})
	);

	const sorted = $derived(
		[...filtered].sort((a, b) => {
			const fields = {
				author: (x) => normalize(x.author),
				title: (x) => normalize(x.title),
				year: (x) => x.year
			};

			const va = fields[sortBy](a);
			const vb = fields[sortBy](b);

			if (va < vb) return -1 * sortDir;
			if (va > vb) return sortDir;

			return 0;
		})
	);

	const total = $derived(sorted.length);
	const totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

	$effect(() => {
		if (page > totalPages) page = totalPages;
	});

	const start = $derived((page - 1) * pageSize);
	const end = $derived(start + pageSize);
	const pageItems = $derived(sorted.slice(start, end));

	function countInscriptions(e) {
		return Array.isArray(e.inscriptions) ? e.inscriptions.length : 0;
	}

	function handleCSVDownload() {
		const headers = [
			'Key',
			'Author',
			'Title',
			'Year',
			'Inscriptions',
			'Zotero URL',
			'Reference URL'
		];

		const rows = sorted.map((e) => [
			e.key,
			e.author || '',
			e.title || '',
			e.date || '',
			countInscriptions(e),
			e.ptr?.target || '',
			e.ref?.target || ''
		]);

		const filename = q ? `bibliography_${q.replaceAll(/\s+/g, '_')}.csv` : 'bibliography.csv';

		downloadCSV(headers, rows, filename);
	}
</script>

<svelte:head>
	<title>Bibliography | {config.title}</title>
	<meta name="description" content="Publications cited across the inscriptions in ISicily corpus" />
	<meta name="tags" content="bibliography, publications, {config.title}" />
</svelte:head>

<article>
	<header>
		<hgroup>
			<h1>Bibliography</h1>
			<p>Publications cited across the inscriptions in this corpus</p>
		</hgroup>
	</header>

	<section class="controls">
		<input
			class="search"
			type="search"
			placeholder="Search title, author, year…"
			value={q}
			oninput={(e) => {
				q = e.currentTarget.value;
				page = 1;
			}}
			aria-label="Search bibliography"
		/>
		<p class="meta">{total.toLocaleString()} result{total === 1 ? '' : 's'}</p>
		<div class="sort">
			<label>
				<span>Sort by</span>
				<select
					value={sortBy}
					onchange={(e) => {
						sortBy = e.currentTarget.value;
						page = 1;
					}}
				>
					<option value="author">Author</option>
					<option value="year">Year</option>
					<option value="title">Title</option>
				</select>
				<Button.Root
					class="order-toggle"
					onclick={() => (sortDir = sortDir * -1)}
					aria-label="Toggle sort order from ascending to descending"
				>
					{#if sortDir === 1}
						<LucideArrowUp aria-label="Ascending" />
					{:else}
						<LucideArrowDown aria-label="Descending" />
					{/if}
				</Button.Root>
			</label>
			<label>
				<span>Per page</span>
				<select bind:value={pageSize} onchange={() => (page = 1)}>
					{#each pageSizeOptions as pso}
						<option value={pso}>{pso}</option>
					{/each}
				</select>
			</label>
			<Button.Root
				class="secondary"
				aria-label="Download bibliography as CSV"
				onclick={handleCSVDownload}
			>
				<DownloadIcon />CSV
			</Button.Root>
		</div>
	</section>

	<section>
		<ul class="bib-list" role="list">
			{#each pageItems as entry (entry.key)}
				<li class="bib-item">
					<a class="title" href={`bibliography/${entry.key}`}>
						{entry.title}
					</a>
					<div class="meta-line">
						<span class="byline">
							{entry.author || '—'}{entry.date ? ` • ${entry.date}` : ''}
						</span>
						{#if countInscriptions(entry) > 0}
							<span class="badge" title="Linked inscriptions">
								{countInscriptions(entry)} inscription{countInscriptions(entry) === 1 ? '' : 's'}
							</span>
						{/if}
					</div>
					<div class="actions">
						{#if entry.ptr?.target}
							<a href={entry.ptr.target} rel="noopener noreferrer" target="_blank">Zotero</a>
						{/if}
						{#if entry.ref?.target}
							<a href={entry.ref.target} rel="noopener noreferrer" target="_blank">Reference</a>
						{/if}
					</div>
				</li>
			{/each}
		</ul>
	</section>

	{#if totalPages > 1}
		<section>
			<InscriptionPagination
				{page}
				count={total}
				perPage={pageSize}
				onPageChange={(p) => (page = p)}
			/>
		</section>
	{/if}
</article>

<style>
	h1 {
		margin-top: var(--size-6); /**ZL added this to make the header having a bit more space*/
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		row-gap: var(--size-3);
		column-gap: var(--size-4);

		/* top + bottom lines, like home page */
		border-block: var(--border-size-1) solid var(--border-color);
		padding-block: var(--size-3);
		margin-bottom: var(--size-4);
		border-top: none; /* remove current top line */
	}

	.controls .search {
		flex: 1 1 100%;
	}

	.controls .meta {
		order: 1;
		font-size: var(--font-size-1);
		margin-right: auto; /* push sort group to the right */
	}

	.controls .sort {
		order: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--size-2) var(--size-4);
		margin-left: auto;
	}

	.sort label {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
	}

	/* .sort {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2) var(--size-4);
		align-items: center;
	} */

	.search {
		padding: var(--size-2) var(--size-3);
		border: 1px solid var(--border-color);
		border-radius: var(--radius-2);
		width: 100%;
		background: var(--surface-1);
		color: var(--text-1);
	}
	.meta {
		font-size: var(--font-size-1);
	}

	.bib-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--size-3);
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); /**ZL added */
		justify-content: center; /**ZL added */
	}
	@media (min-width: 900px) {
		.bib-list {
			gap: var(
				--size-4
			); /* ZL changed grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));*/
		}
	}

	.bib-item {
		border: 1px solid var(--border-color);
		border-radius: var(--radius-2);
		padding: var(--size-3) var(--size-4);
		background: var(--surface-1);
		display: flex; /** ZL changed from grid to flex */
		flex-direction: column; /**ZL added */
		justify-content: space-between; /**ZL added*/
		gap: var(--size-2);
		min-height: 200px; /**ZL added*/
	}

	.title {
		color: inherit;
		text-decoration: none;
		font-weight: 600;
		line-height: 1.3;
		word-break: break-word;
	}
	.title:hover,
	.title:focus {
		text-decoration: underline;
	}

	.meta-line {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2);
		align-items: center;
		/* color: var(--text-2); */
		font-size: var(--font-size-1);
	}

	.actions {
		display: flex;
		gap: var(--size-3);
		flex-wrap: wrap;
	}
	.actions a {
		align-items: center;
		display: inline-flex;
		min-block-size: 44px;
		min-inline-size: 44px;
		text-decoration: none;
	}
	.actions a:hover,
	.actions a:focus {
		text-decoration: underline;
	}
</style>
