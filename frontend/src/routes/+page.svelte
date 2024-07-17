<script>
	import InscriptionList from '$lib/components/InscriptionList.svelte';
	import InscriptionPagination from '$lib/components/InscriptionPagination.svelte';
	import * as config from '$lib/config';
	import { getInscriptions } from '$lib/inscriptions';
	import { LoaderCircle } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { queryParam, ssp } from 'sveltekit-search-params';

	/** @type {import('./$types').PageData} */
	export let data;

	let { query, limit, total, results } = data;

	let isLoading = false;

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
		if ($searchQuery || $searchPage || $searchLimit) {
			search();
		}
	});
</script>

<article>
	<section class="hero">
		<h1>{config.description}</h1>
	</section>

	<section>
		<form on:submit={search} on:reset={reset}>
			<label class="visually-hidden" for="q">Search query:</label>
			<input
				type="text"
				name="q"
				id="q"
				placeholder="Search inscriptions metadata"
				bind:value={$searchQuery}
			/>
			<button type="submit" value="Search" disabled={!$searchQuery}>Search</button>
			<button type="reset" value="Reset" disabled={!$searchQuery}>Reset</button>
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
		{#if isLoading}
			<LoaderCircle />
		{:else}
			<InscriptionPagination
				page={$searchPage}
				count={total}
				perPage={limit}
				onPageChange={handlePageChange}
			/>
			<InscriptionList inscriptions={results.inscriptions} />
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

	section {
		margin-block: var(--size-8);
	}

	form {
		display: flex;
		gap: var(--size-2);
		margin-inline: var(--size-12);

		& input {
			flex-grow: 1;

			&::placeholder {
				color: var(--gray-8);
				font-style: italic;
			}
		}
	}
</style>
