<script>
	import { onMount } from 'svelte';
	import { Button } from 'bits-ui';
	import SearchWorker from './worker.js?worker';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import * as config from '$lib/config';
	import { LayoutGridIcon, MapIcon, TableIcon } from 'lucide-svelte';
	import InscriptionTable from '../InscriptionTable.svelte';
	import InscriptionList from '../InscriptionList.svelte';
	import InscriptionMap from '../InscriptionMap.svelte';
	import InscriptionPagination from '../InscriptionPagination.svelte';

	const searchQuery = queryParam('q', ssp.string(''));
	const searchPage = queryParam('page', ssp.number(1));
	const searchLimit = queryParam('limit', ssp.number(config.search.limit));

	/** @type {'cards' | 'map' | 'table'} */
	let view = $state('cards');

	/** @type {import('./worker.js').WorkerStatus} */
	let searchStatus = $state('idle');
	let isLoading = $derived(['idle', 'load'].includes(searchStatus));

	let searchWorker = $state();
	let searchResults = $state({});
	let searchPagination = $derived(searchResults?.pagination ?? {});
	let searchAggregations = $derived(searchResults?.data?.aggregations ?? {});

	let total = $derived(searchPagination?.total ?? 0);
	let yearSpan = $derived(getYearSpan());
	let numberOfLocations = $derived(getNumberOfLocations());

	let inscriptions = $derived(searchResults?.data?.items ?? []);
	let inscriptionsGeo = $derived(
		inscriptions?.map((inscription) => ({
			file: inscription.file,
			title: inscription.title,
			places: inscription.places,
			geo: inscription.geo[0]
		}))
	);

	async function init() {
		if (searchStatus === 'ready') return;

		searchStatus = 'load';

		searchWorker = new SearchWorker();
		searchWorker.addEventListener(
			'message',
			(/** @type {{ data: { type: import('./worker.js').WorkerStatus; data: any; }}} */ event) => {
				const { type, data } = event.data;

				if (type === 'ready') {
					searchStatus = 'ready';
				}

				if (type === 'results') {
					searchResults = data;
				}
			}
		);
		searchWorker.postMessage({ type: 'load' });
	}

	function getYearSpan() {
		if (!searchAggregations) return 0;
		if (!searchAggregations?.notAfter && !searchAggregations?.notBefore) return 0;

		const notBefore = searchAggregations.notBefore.facet_stats.min ?? 0;
		const notAfter = searchAggregations.notAfter.facet_stats.max ?? 0;

		return notAfter - notBefore;
	}

	function getNumberOfLocations() {
		if (!searchAggregations) return 0;
		if (!searchAggregations?.placeName) return 0;

		return searchAggregations.placeName.buckets.length;
	}

	$effect(() => {
		postSearchMessage();
	});

	async function postSearchMessage() {
		if (searchStatus === 'ready') {
			searchWorker.postMessage({
				type: 'search',
				data: { limit: $searchLimit, page: $searchPage, query: $searchQuery }
			});
		}
	}

	async function handleSearch(/** @type {Event} */ e) {
		e.preventDefault();
	}

	async function handleReset(/** @type {Event} */ e) {
		e.preventDefault();
		$searchQuery = '';
		$searchPage = 1;
		$searchLimit = config.search.limit;
	}

	/**
	 * @param {'cards' | 'map' | 'table'} newView
	 */
	async function handleViewChange(newView) {
		if (newView === 'map') {
			$searchLimit = config.search.maxLimit;
		} else if (view === 'map') {
			// clear the search results items to prevent non-map views to attempt to render all the inscriptions
			searchResults = {
				...searchResults,
				data: {
					...searchResults.data,
					items: []
				}
			};

			$searchLimit = config.search.limit;
			$searchPage = 1;
		}

		view = newView;
	}

	/**
	 * @param {number | null} page
	 */
	async function handlePageChange(page) {
		$searchPage = page;
	}

	onMount(() => {
		init();
	});
</script>

<article>
	<section>
		<form onsubmit={handleSearch} onreset={handleReset}>
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
		{#if isLoading}
			<h2 aria-busy="true">Loading inscriptions...</h2>
		{:else}
			<h2>
				<em>{total.toLocaleString()}</em> Inscriptions over
				<em>{yearSpan.toLocaleString()}</em>
				years across
				<em>{numberOfLocations.toLocaleString()}</em>
				locations{#if $searchQuery}, matching
					<em>{$searchQuery.split(' ').join(', ')}</em>
				{/if}
			</h2>
			<section class="controls">
				<div class="toggles">
					<Button.Root
						class={`${view === 'cards' ? 'surface-4' : 'surface-1'}`}
						onclick={() => handleViewChange('cards')}
					>
						<LayoutGridIcon />View cards
					</Button.Root>
					<Button.Root
						class={`${view === 'map' ? 'surface-4' : 'surface-1'}`}
						onclick={() => handleViewChange('map')}
					>
						<MapIcon />View map
					</Button.Root>
					<Button.Root
						class={`${view === 'table' ? 'surface-4' : 'surface-1'}`}
						onclick={() => handleViewChange('table')}
					>
						<TableIcon />View table
					</Button.Root>
				</div>
			</section>
			{#if view === 'map'}
				<InscriptionMap inscriptions={inscriptionsGeo} />
			{:else}
				<InscriptionPagination
					page={$searchPage}
					count={total}
					perPage={$searchLimit}
					onPageChange={handlePageChange}
				/>
				{#if view === 'table'}
					<InscriptionTable {inscriptions} />
				{:else}
					<InscriptionList {inscriptions} />
				{/if}
				<InscriptionPagination
					page={$searchPage}
					count={total}
					perPage={$searchLimit}
					onPageChange={handlePageChange}
				/>
			{/if}
		{/if}
	</section>
</article>

<style>
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

	.inscriptions {
		display: grid;
		place-items: center;
	}

	.inscriptions h2 {
		max-inline-size: var(--header-size-6);
		margin-block: var(--size-4);
		text-align: center;
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
