<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Button } from 'bits-ui';
	import SearchWorker from './worker.js?worker';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import * as config from '$lib/config';
	import { FilterIcon, LayoutGridIcon, MapIcon, TableIcon } from 'lucide-svelte';
	import InscriptionTable from '$lib/components/InscriptionTable.svelte';
	import InscriptionList from '$lib/components/InscriptionList.svelte';
	import InscriptionMap from '$lib/components/InscriptionMap.svelte';
	import InscriptionPagination from '$lib/components/InscriptionPagination.svelte';
	import SearchSummary from './SearchSummary.svelte';
	import SearchFilters from './SearchFilters.svelte';
	import { searchConfig } from './search';

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

	let showFilters = $state(true);

	let filterOptions = $state({
		sortAggregationsBy: 'key'
	});

	let selectedDateRange = $state([-700, 1830]);

	/** @type {{ [key: string]: string[] }} */
	let selectedFilters = $state(
		Object.keys(searchConfig.aggregations)
			.filter((k) => k.indexOf('not') < 0)
			.reduce((acc, cur) => {
				acc[cur] = [];
				return acc;
			}, {})
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
		searchWorker.postMessage({
			type: 'load',
			data: { sortAggregationsBy: filterOptions.sortAggregationsBy }
		});
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
			const filters = Object.fromEntries(
				Object.keys(selectedFilters).map((key) => [key, [...selectedFilters[key]]])
			);

			searchWorker.postMessage({
				type: 'search',
				data: {
					limit: $searchLimit,
					page: $searchPage,
					query: $searchQuery,
					filters,
					dateRange: [...selectedDateRange]
				}
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

	$effect(() => {
		if (filterOptions.sortAggregationsBy && searchWorker && searchStatus === 'ready') {
			searchWorker.postMessage({
				type: 'load',
				data: { sortAggregationsBy: filterOptions.sortAggregationsBy }
			});

			postSearchMessage();
		}
	});

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
		<div class="filters-toggle">
			<Button.Root
				class={showFilters ? 'surface-4' : 'surface-1'}
				onclick={() => (showFilters = !showFilters)}
			>
				<FilterIcon />Filters
			</Button.Root>
		</div>
	</section>

	<section class="inscriptions">
		{#if isLoading}
			<h2 aria-busy="true">Loading inscriptions...</h2>
		{:else}
			<SearchSummary
				{total}
				dateRange={selectedDateRange}
				{numberOfLocations}
				query={$searchQuery}
				filters={selectedFilters}
			/>
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
				<div class="transition-container" in:fade={{ duration: 500 }} out:fade={{ duration: 250 }}>
					<InscriptionMap inscriptions={inscriptionsGeo} />
				</div>
			{:else}
				<InscriptionPagination
					page={$searchPage}
					count={total}
					perPage={$searchLimit}
					onPageChange={handlePageChange}
				/>
				{#key view}
					<div
						class="transition-container"
						in:fade={{ duration: 500 }}
						out:fade={{ duration: 250 }}
					>
						{#if view === 'table'}
							<InscriptionTable {inscriptions} />
						{:else}
							<InscriptionList {inscriptions} />
						{/if}
					</div>
				{/key}
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

<SearchFilters
	show={showFilters}
	aggregations={searchAggregations}
	bind:sortAggregationsBy={filterOptions.sortAggregationsBy}
	bind:selectedDateRange
	bind:selectedFilters
/>

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

	.filters-toggle {
		display: flex;
		justify-content: center;
		margin-block: var(--size-4);
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

	.transition-container {
		width: 100%;
	}

	.filters {
		background: var(--surface-2);
		border: var(--border-size-1) solid var(--surface-3);
		border-radius: var(--radius-3);
		padding: var(--size-4);
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: min(400px, 100vw);
		overflow-y: auto;
		z-index: 10;
		box-shadow: var(--shadow-4);

		& h2 {
			font-size: var(--font-size-4);
			margin-block-end: var(--size-4);
			margin-block-start: var(--size-8);
		}

		& .filter-groups {
			display: flex;
			flex-wrap: wrap;
			gap: var(--size-4);
		}

		& .filter-group {
			flex: 1;
			min-width: 200px;

			& h3 {
				font-size: var(--font-size-2);
				margin-block-end: var(--size-2);
			}

			& ul {
				list-style: none;
				padding: 0;
			}

			& .slider {
				width: 100%;
			}
		}
	}
</style>
