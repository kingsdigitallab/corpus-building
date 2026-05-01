<script>
	import * as config from '$lib/config';
	import InscriptionPagination from '$lib/components/InscriptionPagination.svelte';
	import { downloadCSV } from '$lib/utils/download';
	import { Button } from 'bits-ui';
	import { DownloadIcon, LucideArrowUp, LucideArrowDown } from 'lucide-svelte';

	/** @type {{ data: import('./$types').PageData }} */
	let { data } = $props();
	const { museums } = data;

	let q = $state('');
	let withInscriptions = $state(true);
	let sortBy = $state('name');
	let sortDir = $state(1);
	let page = $state(1);
	let pageSize = $state(50);
	const pageSizeOptions = [25, 50, 100];

	const normalize = (s) => (s || '').toString().toLowerCase().normalize('NFKD');

	const filtered = $derived(
		museums.filter((e) => {
			if (withInscriptions && e.inscriptionCount === 0) return false;
			if (!q) return true;
			const hay =
				`${e.name} ${e.location?.settlement} ${e.location?.region} ${e.location?.country} ${e.type}`.toLowerCase();
			return normalize(hay).includes(normalize(q));
		})
	);

	const sorted = $derived(
		[...filtered].sort((a, b) => {
			const fields = {
				name: (x) => normalize(x.name),
				settlement: (x) => normalize(x.location?.settlement),
				region: (x) => normalize(x.location?.region),
				type: (x) => normalize(x.type)
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

	function handleCSVDownload() {
		const headers = [
			'Slug',
			'Name',
			'Type',
			'Settlement',
			'Region',
			'Country',
			'Inscriptions',
			'URI'
		];
		const rows = sorted.map((e) => [
			e.slug,
			e.name || '',
			e.type || '',
			e.location?.settlement || '',
			e.location?.region || '',
			e.location?.country || '',
			e.inscriptionCount,
			e.uri || ''
		]);

		const filename = q ? `museums_${q.replaceAll(/\s+/g, '_')}.csv` : 'museums.csv';

		downloadCSV(headers, rows, filename);
	}
</script>

<svelte:head>
	<title>Museums | {config.title}</title>
	<meta
		name="description"
		content="Museums and repositories holding the inscriptions in ISicily corpus"
	/>
	<meta name="keywords" content="museums, repositories, {config.title}" />
</svelte:head>

<article>
	<header>
		<hgroup>
			<h1>Museums</h1>
			<p>Museums and repositories holding the inscriptions in this corpus</p>
		</hgroup>
	</header>

	<section class="controls">
		<input
			class="search"
			type="search"
			placeholder="Search name, location, type…"
			value={q}
			oninput={(e) => {
				q = e.currentTarget.value;
				page = 1;
			}}
			aria-label="Search museums"
		/>
		<p class="meta">{total.toLocaleString()} result{total === 1 ? '' : 's'}</p>
		<div class="sort">
			<label class="checkbox-label">
				<input type="checkbox" bind:checked={withInscriptions} onchange={() => (page = 1)} />
				<span>With inscriptions only</span>
			</label>
			<label>
				<span>Sort by</span>
				<select
					value={sortBy}
					onchange={(e) => {
						sortBy = e.currentTarget.value;
						page = 1;
					}}
				>
					<option value="name">Name</option>
					<option value="settlement">Settlement</option>
					<option value="region">Region</option>
					<option value="type">Type</option>
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
				aria-label="Download museums as CSV"
				onclick={handleCSVDownload}
			>
				<DownloadIcon />CSV
			</Button.Root>
		</div>
	</section>

	<section>
		<ul class="museum-list" role="list">
			{#each pageItems as entry (entry.slug)}
				<li class="museum-item">
					<a class="title" href={`museum/${entry.slug}`}>
						{entry.name}
					</a>
					<div class="meta-line">
						<span class="byline">
							{entry.location?.settlement || '—'}{entry.location?.region
								? ` • ${entry.location.region}`
								: ''}{entry.location?.country ? ` • ${entry.location.country}` : ''}
						</span>
						{#if entry.inscriptionCount > 0}
							<span class="badge" title="Linked inscriptions">
								{entry.inscriptionCount} inscription{entry.inscriptionCount === 1 ? '' : 's'}
							</span>
						{/if}
					</div>
					{#if entry.description}
						<p class="description">{entry.description}</p>
					{/if}
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
		margin-top: var(--size-6);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		row-gap: var(--size-3);
		column-gap: var(--size-4);

		border-block: var(--border-size-1) solid var(--border-color);
		padding-block: var(--size-3);
		margin-bottom: var(--size-4);
		border-top: none;
	}

	.controls .search {
		flex: 1 1 100%;
	}

	.controls .meta {
		order: 1;
		font-size: var(--font-size-1);
		margin-right: auto;
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

	.museum-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: var(--size-3);
		grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
		justify-content: center;
	}
	@media (min-width: 900px) {
		.museum-list {
			gap: var(--size-4);
		}
	}

	.museum-item {
		border: 1px solid var(--border-color);
		border-radius: var(--radius-2);
		padding: var(--size-3) var(--size-4);
		background: var(--surface-1);

		display: grid;
		grid-template-rows: minmax(2.6em, auto) auto minmax(3.2em, auto);
		row-gap: var(--size-2);
		align-content: start;

		min-height: 200px;
	}

	.title {
		color: inherit;
		text-decoration: none;
		font-weight: 600;
		line-height: 1.3;
		word-break: break-word;

		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;

		min-height: 2.8em;
	}
	.title:hover,
	.title:focus {
		text-decoration: underline;
	}

	.meta-line {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--size-2);
		align-items: left;
		font-size: var(--font-size-1);
		margin-top: var(--size-2);
	}

	.description {
		margin-top: var(--size-6);
		font-size: 0.9rem;
		font-weight: 300;
		color: color-mix(in oklab, var(--text-1) 75%, transparent);
		line-height: 1.4;
		height: calc(1.4em * 2);
		max-height: calc(1.4em * 2);

		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
