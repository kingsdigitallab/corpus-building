<script>
	import InscriptionList from '$lib/components/InscriptionList.svelte';
	import InscriptionMap from '$lib/components/InscriptionMap.svelte';
	import InscriptionPagination from '$lib/components/InscriptionPagination.svelte';
	import InscriptionTable from '$lib/components/InscriptionTable.svelte';
	import * as config from '$lib/config';
	import { downloadInscriptionsCSV, downloadInscriptionsXML } from '$lib/utils/download';
	import { Button } from 'bits-ui';
	import {
		DownloadIcon,
		FilterIcon,
		LayoutGridIcon,
		LucideArrowDown,
		LucideArrowUp,
		MapIcon,
		TableIcon,
		TextIcon
	} from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { queryParam, ssp } from 'sveltekit-search-params';
	import SearchFilters from './SearchFilters.svelte';
	import SearchSummary from './SearchSummary.svelte';
	import { searchConfig } from './search';
	import SearchWorker from './worker.js?worker';

	const searchQueryParam = queryParam('q', ssp.string(''));
	const searchPageParam = queryParam('page', ssp.number(1));
	const searchLimitParam = queryParam('limit', ssp.number(config.search.limit));
	/** @property {'cards' | 'map' | 'table' | 'text'} */
	const searchViewParam = queryParam('view', ssp.string('cards'));
	const searchFiltersParam = queryParam('filters', ssp.object({}));

	/** @type {import('./worker.js').WorkerStatus} */
	let searchStatus = $state('idle');
	let isLoading = $derived(['idle', 'load'].includes(searchStatus));
	let isDownloading = $state(false);

	let searchWorker = $state();
	let searchResults = $state({});
	let searchPagination = $derived(searchResults?.pagination ?? {});
	let searchAggregations = $derived(searchResults?.data?.aggregations ?? {});

	let total = $derived(searchPagination?.total ?? 0);
	let numberOfLocations = $derived(getNumberOfLocations());

	let inscriptions = $derived(searchResults?.data?.items ?? []);
	let inscriptionsGeo = $derived(
		$searchViewParam === 'map'
			? inscriptions?.map((inscription) => ({
					file: inscription.file,
					title: inscription.title,
					places: inscription.places,
					geo: inscription.geo[0]
				}))
			: []
	);

	let showFilters = $state(false);

	const searchOptions = $state({
		sortAggregationsBy: 'key',
		languageConjunction: true,
		sortResultsBy: 'file',
		sortResultsOrder: 'asc'
	});

	let selectedDateRange = $state(initDateRange());
	let selectedLetterHeightRange = $state(initLetterHeightRange());
	/** @type {{ [key: string]: string[] }} */
	let selectedFilters = $state(initFilters());

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
					postSearchMessage();
				}

				if (type === 'results') {
					searchResults = data;
				}
			}
		);
		searchWorker.postMessage({
			type: 'load',
			data: { sortAggregationsBy: searchOptions.sortAggregationsBy }
		});
	}

	/**
	 * @param {number | null | undefined} [page]
	 * @param {string | null | undefined} [query]
	 * @param {number | null | undefined} [limit]
	 */
	async function postSearchMessage(page, query, limit) {
		let currentPage = $searchPageParam;
		let currentQuery = $searchQueryParam;
		let currentLimit = $searchLimitParam;

		if (page) {
			currentPage = page;
		}

		if (query !== undefined && query !== null) {
			currentQuery = query;
		}

		if (limit) {
			currentLimit = limit;
		}

		if (searchStatus === 'ready') {
			const filters = Object.fromEntries(
				Object.keys(selectedFilters).map((key) => [key, [...selectedFilters[key]]])
			);

			searchWorker.postMessage({
				type: 'search',
				data: {
					limit: currentLimit,
					page: currentPage,
					query: currentQuery,
					sort: `${searchOptions.sortResultsBy}_${searchOptions.sortResultsOrder}`,
					filters,
					dateRange: [...selectedDateRange],
					letterHeightRange: [...selectedLetterHeightRange]
				}
			});
		}
	}

	function initDateRange() {
		return [config.search.minDate, config.search.maxDate];
	}

	function initLetterHeightRange() {
		return [config.search.minLetterHeight, config.search.maxLetterHeight];
	}

	function initFilters() {
		return Object.keys(searchConfig.aggregations)
			.filter((k) => k.indexOf('not') < 0)
			.filter((k) => k.indexOf('letterHeight') < 0)
			.reduce((acc, cur) => {
				acc[cur] = $searchFiltersParam[cur] ? [...$searchFiltersParam[cur]] : [];
				return acc;
			}, {});
	}

	function getNumberOfLocations() {
		if (!searchAggregations) return 0;
		if (!searchAggregations?.provenance) return 0;

		return searchAggregations.provenance.buckets.length;
	}

	async function handleSearchInput(/** @type {Event} */ e) {
		e.preventDefault();
		$searchPageParam = 1;
		$searchQueryParam = e.target?.value ?? '';
		postSearchMessage(1, e.target?.value ?? '');
	}

	async function handleSearch(/** @type {Event} */ e) {
		e.preventDefault();
		$searchPageParam = 1;
		postSearchMessage();
	}

	async function handleReset(/** @type {Event} */ e) {
		e.preventDefault();

		if (document.getElementById('q')) {
			document.getElementById('q').value = '';
		}

		$searchQueryParam = '';
		$searchPageParam = 1;
		$searchLimitParam = $searchViewParam === 'map' ? config.search.maxLimit : config.search.limit;
		$searchFiltersParam = '';
		selectedDateRange = [...initDateRange()];
		selectedLetterHeightRange = [...initLetterHeightRange()];
		selectedFilters = { ...initFilters() };

		postSearchMessage(
			1,
			'',
			$searchViewParam === 'map' ? config.search.maxLimit : config.search.limit
		);
	}

	async function handleSortAggregationsByChange() {
		if (searchOptions.sortAggregationsBy && searchWorker && searchStatus === 'ready') {
			searchWorker.postMessage({
				type: 'load',
				data: {
					sortAggregationsBy: searchOptions.sortAggregationsBy,
					languageConjunction: searchOptions.languageConjunction
				}
			});

			postSearchMessage();
		}
	}

	async function handleLanguageConjunctionToggle() {
		if (searchOptions.sortAggregationsBy && searchWorker && searchStatus === 'ready') {
			searchWorker.postMessage({
				type: 'load',
				data: {
					sortAggregationsBy: searchOptions.sortAggregationsBy,
					languageConjunction: searchOptions.languageConjunction
				}
			});

			postSearchMessage();
		}
	}

	async function handleSearchFiltersChange() {
		$searchPageParam = 1;

		const filters = Object.fromEntries(
			Object.entries(selectedFilters)
				.filter(([_, values]) => values && values.length > 0)
				.map(([key, values]) => [key, [...values]])
		);
		$searchFiltersParam = filters;

		postSearchMessage();
	}

	function hasActiveFilters() {
		const initialDateRange = initDateRange();
		const initialLetterHeightRange = initLetterHeightRange();

		return (
			$searchQueryParam !== '' ||
			selectedDateRange.some((value, index) => value !== initialDateRange[index]) ||
			selectedLetterHeightRange.some((value, index) => value !== initialLetterHeightRange[index]) ||
			Object.keys(selectedFilters).some((key) => selectedFilters[key].length > 0)
		);
	}

	/**
	 * @param {'cards' | 'map' | 'table' | 'text'} newView
	 */
	async function handleViewChange(newView) {
		let currentLimit = $searchLimitParam;

		if (newView === 'map') {
			currentLimit = config.search.maxLimit;
		} else if ($searchViewParam === 'map') {
			// clear the search results items to prevent non-map views to attempt to render all the inscriptions
			searchResults = {
				...searchResults,
				data: {
					...searchResults.data,
					items: []
				}
			};

			currentLimit = config.search.limit;
			$searchPageParam = 1;
		}

		$searchLimitParam = currentLimit;
		$searchViewParam = newView;

		postSearchMessage(1, $searchQueryParam, currentLimit);
	}

	async function handleCSVDownload() {
		isDownloading = true;

		searchWorker.postMessage({
			type: 'search',
			data: {
				limit: config.search.maxLimit,
				page: 1,
				query: $searchQueryParam,
				sort: `${searchOptions.sortResultsBy}_${searchOptions.sortResultsOrder}`,
				filters: Object.fromEntries(
					Object.entries(selectedFilters)
						.filter(([_, values]) => values && values.length > 0)
						.map(([key, values]) => [key, [...values]])
				),
				dateRange: [...selectedDateRange],
				letterHeightRange: [...selectedLetterHeightRange]
			}
		});

		const downloadHandler = (
			/** @type {{ data: { type: import('./worker.js').WorkerStatus; data: any; }}} */ event
		) => {
			const { type, data } = event.data;
			if (type === 'results') {
				const summary = getSearchSummary(data.data.items);

				downloadInscriptionsCSV(summary, data.data.items).then(() => {
					isDownloading = false;
				});

				searchWorker.removeEventListener('message', downloadHandler);

				postSearchMessage();
			}
		};

		searchWorker.addEventListener('message', downloadHandler);
	}

	function getSearchSummary(inscriptions) {
		let summary = `${inscriptions.length.toLocaleString()} Inscriptions between `;

		summary += `${selectedDateRange[0] > 0 ? `AD ${selectedDateRange[0]}` : `${Math.abs(selectedDateRange[0])} BC`} – `;
		summary += `${selectedDateRange[1] > 0 ? `AD ${selectedDateRange[1]}` : `${Math.abs(selectedDateRange[1])} BC`}`;

		summary += ` across ${numberOfLocations.toLocaleString()} locations`;

		if ($searchQueryParam) {
			summary += `, matching ${$searchQueryParam.split(' ').join(', ')}`;
		}

		const hasSelectedFilters = Object.values(selectedFilters).some((filter) => filter.length > 0);
		if (hasSelectedFilters) {
			summary += ', filtered by ';
			const filterLabels = Object.entries(selectedFilters)
				.filter(([_, values]) => values && values.length > 0)
				.map(
					([key, values]) =>
						`${key}: ${values.join(', ').replaceAll('_', ' ').replaceAll(':::', ' ')}`
				);
			summary += filterLabels.join(', ');
		}

		return summary;
	}

	async function handleXMLDownload() {
		isDownloading = true;

		searchWorker.postMessage({
			type: 'search',
			data: {
				limit: config.search.maxLimit,
				page: 1,
				query: $searchQueryParam,
				sort: `${searchOptions.sortResultsBy}_${searchOptions.sortResultsOrder}`,
				filters: Object.fromEntries(
					Object.entries(selectedFilters)
						.filter(([_, values]) => values && values.length > 0)
						.map(([key, values]) => [key, [...values]])
				),
				dateRange: [...selectedDateRange],
				letterHeightRange: [...selectedLetterHeightRange]
			}
		});

		const downloadHandler = (
			/** @type {{ data: { type: import('./worker.js').WorkerStatus; data: any; }}} */ event
		) => {
			const { type, data } = event.data;
			if (type === 'results') {
				const summary = getSearchSummary(data.data.items);

				downloadInscriptionsXML(summary, data.data.items).then(() => {
					isDownloading = false;
				});

				searchWorker.removeEventListener('message', downloadHandler);

				postSearchMessage();
			}
		};

		searchWorker.addEventListener('message', downloadHandler);
	}

	async function handleSortResultsOrderToggle() {
		searchOptions.sortResultsOrder = searchOptions.sortResultsOrder === 'asc' ? 'desc' : 'asc';

		postSearchMessage();
	}

	/**
	 * @param {number} page
	 */
	async function handlePageChange(page) {
		$searchPageParam = page;
		postSearchMessage(page);
	}

	onMount(() => {
		init();
	});
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.ctrlKey || e.metaKey) {
			if (e.key === 'k' || e.key === 'K') {
				e.preventDefault();
				showFilters = !showFilters;
			}
		}

		if (e.key === '/') {
			e.preventDefault();
			document.getElementById('q')?.focus();
		}
	}}
/>

<article id="faceted-search">
	<section>
		<form onsubmit={handleSearch} onreset={handleReset}>
			<label class="visually-hidden" for="q">Search query:</label>
			<input
				type="text"
				name="q"
				id="q"
				placeholder="Search inscriptions metadata"
				oninput={handleSearchInput}
			/>
			<Button.Root class="primary" type="submit" disabled={!$searchQueryParam}>Search</Button.Root>
			<Button.Root class="secondary" type="reset" disabled={!hasActiveFilters()}>Reset</Button.Root>
		</form>
	</section>

	<section class="inscriptions">
		{#if isLoading}
			<h2 aria-busy="true">Loading inscriptions...</h2>
		{:else}
			<SearchSummary
				{total}
				dateRange={selectedDateRange}
				defaultDateRange={[config.search.minDate, config.search.maxDate]}
				letterHeightRange={selectedLetterHeightRange}
				defaultLetterHeightRange={[config.search.minLetterHeight, config.search.maxLetterHeight]}
				{numberOfLocations}
				query={$searchQueryParam}
				filters={selectedFilters}
			/>
			<section class="reduced-block-margin">
				<Button.Root
					class={`primary ${$searchViewParam !== 'cards' && 'primary-inverse'}`}
					onclick={() => handleViewChange('cards')}
				>
					<LayoutGridIcon />View cards
				</Button.Root>
				<Button.Root
					class={`primary ${$searchViewParam !== 'text' && 'primary-inverse'}`}
					onclick={() => handleViewChange('text')}
				>
					<TextIcon />View text
				</Button.Root>
				<Button.Root
					class={`primary ${$searchViewParam !== 'map' && 'primary-inverse'}`}
					onclick={() => handleViewChange('map')}
				>
					<MapIcon />View map
				</Button.Root>
				<Button.Root
					class={`primary ${$searchViewParam !== 'table' && 'primary-inverse'}`}
					onclick={() => handleViewChange('table')}
				>
					<TableIcon />View table
				</Button.Root>
				<Button.Root
					class="secondary"
					aria-label="Download inscription data as a CSV file"
					disabled={isDownloading}
					onclick={handleCSVDownload}
					aria-busy={isDownloading}
				>
					<DownloadIcon />CSV
				</Button.Root>
				<Button.Root
					class="secondary"
					aria-label="Download inscriptions as XML"
					disabled={!hasActiveFilters() || isDownloading}
					onclick={handleXMLDownload}
					aria-busy={isDownloading}
				>
					<DownloadIcon />Epidoc
				</Button.Root>
			</section>
			<section class="reduced-block-margin controls">
				<p>{total.toLocaleString()} Inscriptions</p>
				<div class="filters-toggle">
					<Button.Root
						class={showFilters ? 'secondary' : 'primary'}
						onclick={() => (showFilters = !showFilters)}
					>
						<FilterIcon />Explore filters
					</Button.Root>
				</div>
				<div class="sort-controls">
					<label for="sort-select">Sort by:</label>
					<select id="sort-select" bind:value={searchOptions.sortResultsBy}>
						<option value="file">File</option>
						<option value="notBefore">Not before</option>
						<option value="notAfter">Not after</option>
						<option value="title">Title</option>
					</select>

					<Button.Root
						class="order-toggle"
						onclick={() => handleSortResultsOrderToggle()}
						aria-label="Toggle sort order from ascending to descending to no order"
					>
						{#if searchOptions.sortResultsOrder === 'asc'}
							<LucideArrowUp aria-label="Ascending" />
						{:else}
							<LucideArrowDown aria-label="Descending" />
						{/if}
					</Button.Root>
				</div>
			</section>
			{#if $searchViewParam === 'map'}
				<div class="transition-container" in:fade={{ duration: 500 }} out:fade={{ duration: 250 }}>
					<InscriptionMap inscriptions={inscriptionsGeo} />
				</div>
			{:else}
				{#key $searchViewParam}
					<div
						class="transition-container"
						in:fade={{ duration: 500 }}
						out:fade={{ duration: 250 }}
					>
						{#if $searchViewParam === 'table'}
							<InscriptionTable {inscriptions} />
						{:else}
							<InscriptionList
								{inscriptions}
								view={$searchViewParam === 'text' ? 'text' : 'image'}
								query={$searchQueryParam}
							/>
						{/if}
					</div>
				{/key}
				<InscriptionPagination
					page={$searchPageParam}
					count={total}
					perPage={$searchLimitParam}
					onPageChange={handlePageChange}
				/>
			{/if}
		{/if}
	</section>
</article>

<SearchFilters
	show={showFilters}
	aggregations={searchAggregations}
	{total}
	bind:sortAggregationsBy={searchOptions.sortAggregationsBy}
	bind:languageConjunction={searchOptions.languageConjunction}
	bind:selectedDateRange
	bind:selectedLetterHeightRange
	bind:selectedFilters
	sortAggregationsByChange={handleSortAggregationsByChange}
	languageConjunctionChange={handleLanguageConjunctionToggle}
	searchFiltersChange={handleSearchFiltersChange}
/>

<style>
	form {
		display: flex;
		gap: var(--size-4);
		justify-content: space-between;
		width: 100%;

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

	.reduced-block-margin {
		margin-block: var(--size-3);
	}

	.controls {
		align-items: center;
		border-bottom: var(--border-size-1) solid var(--gray-4);
		border-top: var(--border-size-1) solid var(--gray-4);
		display: flex;
		justify-content: space-between;
		padding-block: var(--size-2);
		margin-block-end: var(--size-6);
		width: 100%;
	}

	.sort-controls {
		align-items: center;
		display: flex;
		gap: var(--size-2);
	}

	.transition-container {
		width: 100%;
	}
</style>
