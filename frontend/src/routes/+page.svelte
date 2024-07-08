<script>
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

		loadMoreCount = 50;
		loadMoreIncrement = loadMoreCount;
	}

	function handleSearch() {
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

	onMount(() => {
		keywords = $page.url.searchParams.get('keywords') || '';
	});
</script>

<article>
	<hgroup class="hero">
		<h1>
			{data.corpus.length.toLocaleString()} Inscriptions over x years across x locations
		</h1>
		<p>{config.description}</p>
	</hgroup>

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

	<section>
		<hgroup>
			<h2>Inscriptions</h2>
			{#if finishedSearch}
				<h3>
					Displaying <em>{inscriptions.length}</em> inscriptions matching
					<em>{keywords.split(' ').join(', ')}</em>
				</h3>
			{/if}
		</hgroup>
		<ol>
			{#each displayedInscriptions as inscription}
				<li>
					<p class="title">
						<BaseLink href="inscription/{inscription.file}">
							<small>{inscription.file}</small>
							<span>{inscription.title}</span>
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
	.hero {
		display: grid;
		place-items: center;

		& h1 {
			text-align: center;
		}
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

	.title {
		font-weight: bolder;
	}

	dt {
		margin-block-start: unset;
	}
</style>
