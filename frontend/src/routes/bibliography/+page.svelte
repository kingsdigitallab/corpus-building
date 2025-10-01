<script>
	import * as config from '$lib/config';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	const { bibliography } = data;

	// Controls (runes)
	let q = $state('');
	let sortBy = $state('author');
	let sortDir = $state('asc');
	let page = $state(1);
	let pageSize = $state(50);

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
				year: (x) => (x.date || '').toString()
			};
			const va = fields[sortBy](a);
			const vb = fields[sortBy](b);
			if (va < vb) return sortDir === 'asc' ? -1 : 1;
			if (va > vb) return sortDir === 'asc' ? 1 : -1;
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

	function goto(p) {
		page = Math.min(Math.max(1, p), totalPages);
	}

	function countInscriptions(e) {
		return Array.isArray(e.inscriptions) ? e.inscriptions.length : 0;
	}
</script>

<svelte:head>
	<title>Bibliography | {config.title}</title>
	<meta name="description" content="Bibliography of the inscriptions" />
	<meta name="tags" content="bibliography, {config.title}" />
</svelte:head>

<article>
	<header>
		<h1>Bibliography</h1>
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
			</label>
			<label>
				<span>Direction</span>
				<select
					value={sortDir}
					onchange={(e) => {
						sortDir = e.currentTarget.value;
					}}
				>
					<option value="asc">Asc</option>
					<option value="desc">Desc</option>
				</select>
			</label>
			<label>
				<span>Per page</span>
				<select
					value={pageSize}
					onchange={(e) => {
						pageSize = Number(e.currentTarget.value);
						page = 1;
					}}
				>
					<option value="25">25</option>
					<option value="50">50</option>
					<option value="100">100</option>
				</select>
			</label>
		</div>
		<p class="meta">{total} result{total === 1 ? '' : 's'}</p>
	</section>

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

	{#if totalPages > 1}
		<nav class="pager" aria-label="Pagination">
			<button onclick={() => goto(1)} disabled={page === 1}>« First</button>
			<button onclick={() => goto(page - 1)} disabled={page === 1}>‹ Prev</button>
			<span>Page {page} of {totalPages}</span>
			<button onclick={() => goto(page + 1)} disabled={page === totalPages}>Next ›</button>
			<button onclick={() => goto(totalPages)} disabled={page === totalPages}>Last »</button>
		</nav>
	{/if}
</article>

<style>
	.controls {
		display: grid;
		gap: var(--size-2);
		margin-bottom: var(--size-4);
	}
	.sort {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2) var(--size-4);
		align-items: center;
	}
	.sort label {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
	}
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
	}
	@media (min-width: 900px) {
		.bib-list {
			grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
		}
	}

	.bib-item {
		border: 1px solid var(--border-color);
		border-radius: var(--radius-2);
		padding: var(--size-3) var(--size-4);
		background: var(--surface-1);
		display: grid;
		gap: var(--size-2);
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
		text-decoration: none;
	}
	.actions a:hover,
	.actions a:focus {
		text-decoration: underline;
	}

	.pager {
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2) var(--size-3);
		align-items: center;
		justify-content: center;
		margin-top: var(--size-4);
	}
	.pager button {
		padding: var(--size-2) var(--size-3);
		border: 1px solid var(--border-color);
		background: var(--surface-1);
		border-radius: var(--radius-2);
		color: var(--text-1);
	}
	.pager button:disabled {
		opacity: 0.5;
	}
</style>
