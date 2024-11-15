<script>
	import InscriptionList from '$lib/components/InscriptionList.svelte';
	import InscriptionMap from '$lib/components/InscriptionMap.svelte';
	import InscriptionPagination from '$lib/components/InscriptionPagination.svelte';
	import InscriptionTable from '$lib/components/InscriptionTable.svelte';
	import * as config from '$lib/config';
	import { getInscriptions } from '$lib/inscriptions';
	import { Button } from 'bits-ui';
	import { LayoutGridIcon, LoaderCircleIcon, MapIcon, TableIcon } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { queryParam, ssp } from 'sveltekit-search-params';

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();

	let { query, limit, total, results } = $state(data);

	let isLoading = $state(false);
	/** @type {'cards' | 'map' | 'table'} */
	let view = $state('cards');

	const searchQuery = queryParam('q', ssp.string(''));
	const searchPage = queryParam('page', ssp.number(1));
	const searchLimit = queryParam('limit', ssp.number(config.search.limit));

	async function search() {
		isLoading = true;

		({ query, limit, total, results } = await getInscriptions(
			$searchQuery,
			$searchPage,
			$searchLimit
		));

		isLoading = false;
	}

	async function reset() {
		$searchQuery = '';
		$searchPage = 1;
		$searchLimit = config.search.limit;

		search();
	}

	/**
	 * @param {number | null} page
	 */
	async function handlePageChange(page) {
		$searchPage = page;
		search();
	}

	onMount(() => {
		isLoading = true;

		if ($searchQuery || $searchPage || $searchLimit) {
			search();
		}

		isLoading = false;
	});
</script>

<article>
	<section class="hero">
		<h1>{config.description}</h1>
	</section>

	<section>
		<form onsubmit={search} onreset={reset}>
			<label class="visually-hidden" for="q">Search query:</label>
			<input
				type="text"
				name="q"
				id="q"
				placeholder="Search inscriptions metadata"
				bind:value={$searchQuery}
			/>
			<Button.Root class="surface-4" type="submit" disabled={!$searchQuery}>Search</Button.Root>
			<Button.Root class="surface-1" type="reset" disabled={!$searchQuery}>Reset</Button.Root>
		</form>
	</section>

	<section class="inscriptions">
		<h2>
			<em>{total.toLocaleString()}</em> Inscriptions over
			<em>{results.yearSpan.toLocaleString()}</em>
			years across
			<em>{results.numberOfLocations.toLocaleString()}</em>
			locations{#if query}, matching
				<em>{query.split(' ').join(', ')}</em>
			{/if}
		</h2>
		<section class="controls">
			<div class="toggles">
				<Button.Root
					class={`${view === 'cards' ? 'surface-4' : 'surface-1'}`}
					onclick={() => (view = 'cards')}
				>
					<LayoutGridIcon />View cards
				</Button.Root>
				<Button.Root
					class={`${view === 'map' ? 'surface-4' : 'surface-1'}`}
					onclick={() => (view = 'map')}
				>
					<MapIcon />View map
				</Button.Root>
				<Button.Root
					class={`${view === 'table' ? 'surface-4' : 'surface-1'}`}
					onclick={() => (view = 'table')}
				>
					<TableIcon />View table
				</Button.Root>
			</div>
		</section>
		{#if isLoading}
			<LoaderCircleIcon />
		{:else if view === 'map'}
			<InscriptionMap inscriptions={results.geo} />
		{:else}
			<InscriptionPagination
				page={$searchPage}
				count={total}
				perPage={limit}
				onPageChange={handlePageChange}
			/>
			{#if view === 'table'}
				<InscriptionTable inscriptions={results.inscriptions} />
			{:else}
				<InscriptionList inscriptions={results.inscriptions} />
			{/if}
			<InscriptionPagination
				page={$searchPage}
				count={total}
				perPage={limit}
				onPageChange={handlePageChange}
			/>
		{/if}
	</section>
</article>

<style>
	.hero,
	.inscriptions {
		display: grid;
		place-items: center;
	}

	.hero h1 {
		font-size: var(--font-size-4);
		max-inline-size: var(--header-size-4);
		text-align: center;
	}
	.inscriptions h2 {
		max-inline-size: var(--header-size-6);
		margin-block: var(--size-4);
		text-align: center;
	}

	form {
		display: flex;
		gap: var(--size-2);
		margin-inline: var(--size-12);

		& input {
			flex-grow: 1;

			&::placeholder {
				color: var(--text-1);
				font-style: italic;
			}
		}
	}

	.controls {
		border-bottom: var(--border-size-1) solid var(--gray-4);
		display: flex;
		margin-block: var(--size-4);
		width: 100%;

		& .toggles {
			margin-block-end: var(--size-2);
		}
	}
</style>
