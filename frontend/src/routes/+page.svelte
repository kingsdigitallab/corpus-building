<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import BaseLink from '$lib/components/BaseLink.svelte';
	import * as config from '$lib/config';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	let inscriptions = data.corpus;

	let finishedSearch = false;
	let keywords = '';

	let loadMoreCount = 50;
	let loadMoreIncrement = loadMoreCount;

	function handleReset() {
		inscriptions = data.corpus;

		finishedSearch = false;
		keywords = '';

		goto(`?keywords=${encodeURIComponent(keywords)}`, { replaceState: true });

		loadMoreCount = 50;
		loadMoreIncrement = loadMoreCount;
	}

	function handleSearch() {
		goto(`?keywords=${encodeURIComponent(keywords)}`, { replaceState: true });

		finishedSearch = true;

		loadMoreCount = 50;
		loadMoreIncrement = loadMoreCount;

		if (!keywords) {
			inscriptions = data.corpus;
			return;
		}

		inscriptions = data.corpus.filter((inscription) => {
			return (
				!keywords ||
				keywords
					.split(' ')
					.map((keyword) => keyword.toLowerCase())
					.every((keyword) =>
						inscription.keywords.some((/** @type string */ k) => k.includes(keyword))
					)
			);
		});
	}

	function loadMore() {
		loadMoreCount = Math.min(inscriptions.length, loadMoreCount + loadMoreIncrement);
	}

	$: displayedInscriptions = inscriptions.slice(0, loadMoreCount);
	$: hasMoreToLoad = inscriptions.length > loadMoreCount;
	$: numberOfLocations = new Set(inscriptions.map((inscription) => inscription.settlement)).size;

	onMount(() => {
		keywords = $page.url.searchParams.get('keywords') || '';

		if (keywords) {
			handleSearch();
		}
	});
</script>

<article>
	<section class="hero">
		<h1>
			{config.description}
		</h1>
	</section>

	<section>
		<form on:submit={handleSearch} on:reset={handleReset}>
			<input
				type="text"
				name="keywords"
				id="keywords"
				placeholder="Search inscriptions metadata"
				bind:value={keywords}
			/>
			<button type="submit" value="Search" disabled={!keywords}>Search</button>
			<button type="reset" value="Reset" disabled={!keywords}>Reset</button>
		</form>
	</section>

	<section class="inscriptions">
		<h2>
			<em>{inscriptions.length.toLocaleString()}</em> Inscriptions over x years across
			<em>{numberOfLocations.toLocaleString()}</em>
			locations{#if keywords && finishedSearch}, matching
				<em>{keywords.split(' ').join(', ')}</em>
			{/if}
		</h2>
		<ol>
			{#each displayedInscriptions as inscription}
				<li>
					<p class="title">
						<BaseLink href="inscription/{inscription.file}">
							<span>{inscription.title}</span>
							<small>{inscription.file}</small>
							<small>{inscription.status}</small>
						</BaseLink>
					</p>
					<dl>
						<dt>Settlement</dt>
						<dd>{inscription.repository?._ || 'N/A'}</dd>
						<dt>Language</dt>
						<dd>{inscription.textLang?._ || 'N/A'}</dd>
					</dl>
				</li>
			{/each}
		</ol>
	</section>
	<section>
		{#if hasMoreToLoad}
			<button on:click={loadMore}>Load More Inscriptions</button>
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

	ol {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--size-8);

		& li {
			flex-basis: 30%;
		}
	}

	.title {
		font-weight: bolder;
	}

	dt {
		margin-block-start: unset;
	}
</style>
