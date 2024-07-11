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

		inscriptions = data.corpus.filter((inscription) =>
			keywords
				.split(' ')
				.map((keyword) => keyword.toLowerCase())
				.every((keyword) =>
					inscription.keywords.some((/** @type string */ k) => k.includes(keyword))
				)
		);
	}

	function loadMore() {
		loadMoreCount = Math.min(inscriptions.length, loadMoreCount + loadMoreIncrement);
	}

	$: displayedInscriptions = inscriptions.slice(0, loadMoreCount);
	$: hasMoreToLoad = inscriptions.length > loadMoreCount;
	$: yearSpan = (() => {
		const minYear = Math.min(
			...inscriptions
				.filter((inscription) => inscription.notBefore)
				.map((inscription) => inscription.notBefore)
		);
		const maxYear = Math.max(
			...inscriptions
				.filter((inscription) => inscription.notAfter)
				.map((inscription) => inscription.notAfter)
		);
		return maxYear - minYear;
	})();
	$: numberOfLocations = new Set(inscriptions.map((inscription) => inscription.placeName)).size;

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
			<em>{inscriptions.length.toLocaleString()}</em> Inscriptions over
			<em>{yearSpan.toLocaleString()}</em>
			years across
			<em>{numberOfLocations.toLocaleString()}</em>
			locations{#if keywords && finishedSearch}, matching
				<em>{keywords.split(' ').join(', ')}</em>
			{/if}
		</h2>
		<ol>
			{#each displayedInscriptions as inscription}
				<li>
					{#if inscription.facsimile}
						<BaseLink href="inscription/{inscription.file}">
							<img
								src="{config.imageServer}{inscription.file}/{inscription.facsimile
									.url}/full/400,/0/default.jpg"
								alt={inscription.facsimile.desc}
								loading="lazy"
							/>
						</BaseLink>
					{/if}
					<p class="title">
						<BaseLink href="inscription/{inscription.file}">
							<span>{inscription.title}</span>
							<small>{inscription.file}</small>
							<small>{inscription.status}</small>
						</BaseLink>
					</p>
					<p>
						{inscription.notBefore != null
							? inscription.notBefore < 0
								? `${Math.abs(inscription.notBefore)} BC`
								: `AD ${inscription.notBefore}`
							: 'Unknown'} – {inscription.notAfter != null
							? inscription.notAfter < 0
								? `${Math.abs(inscription.notAfter)} BC`
								: `AD ${inscription.notAfter}`
							: 'Unknown'}{#if inscription.place},
							{@const place = inscription.place}
							{#if place.offset}<em>{place.offset}</em>{/if}
							{#if place.ref}
								<a href={place.ref}>{place._}</a>
							{:else}
								{place._}
							{/if}
						{/if}
					</p>
					<dl>
						<dt>Settlement</dt>
						<dd>{inscription.settlement || 'N/A'}</dd>
						<dt>Repository</dt>
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
		list-style: none;

		& li {
			border-radius: var(--radius-2);
			box-shadow: var(--shadow-2);
			flex-basis: 95%;
			padding: var(--size-fluid-3);

			&:hover {
				box-shadow: var(--shadow-3);
			}

			@media (--motionOK) {
				animation: var(--animation-fade-in);
			}

			@media (min-width: 640px) {
				flex-basis: 45%;
			}

			@media (min-width: 1024px) {
				flex-basis: 30%;
			}

			& img {
				/* the height should be 200 */
				height: 200px;
				object-fit: cover;
				width: 100%;
			}
		}
	}

	.title {
		font-weight: bolder;
		margin-block: var(--size-2);
	}

	dt {
		margin-block-start: unset;
	}
</style>
