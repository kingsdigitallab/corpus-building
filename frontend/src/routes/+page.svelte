<script>
	import BaseLink from '$lib/components/BaseLink.svelte';
	import InscriptionPagination from '$lib/components/InscriptionPagination.svelte';
	import * as config from '$lib/config';
	import { getInscriptions } from '$lib/inscriptions';
	import { Image } from '@unpic/svelte';
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
		<h1>
			{config.description}
		</h1>
	</section>

	<section>
		<form on:submit={search} on:reset={reset}>
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
		{#if isLoading}Loading...{/if}
		<InscriptionPagination
			page={$searchPage}
			count={total}
			perPage={limit}
			onPageChange={handlePageChange}
		/>
		<ol>
			{#each results.inscriptions as inscription}
				<li>
					{#if inscription.facsimile}
						<BaseLink href="inscription/{inscription.file}">
							<Image
								src="{config.imageServer}{inscription.file}/{inscription.facsimile
									.url}/{config.imageThumbParams}"
								alt={inscription.facsimile.desc}
								width={400}
								height={200}
							/>
						</BaseLink>
					{/if}
					<p class="title">
						<BaseLink href="inscription/{inscription.file}">{inscription.title}</BaseLink>
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
						<dt>ID</dt>
						<dd>
							<BaseLink href="inscription/{inscription.file}">
								<small>{inscription.file}</small>
							</BaseLink>
						</dd>
						<dt>Status</dt>
						<dd>{inscription.status}</dd>
						<dt>Type</dt>
						{#if inscription.type.ref}
							<dd><a href={inscription.type.ref}>{inscription.type?._}</a></dd>
						{:else}
							<dd>{inscription.type?._ || 'N/A'}</dd>
						{/if}
						<dt>Language</dt>
						<dd>{inscription.textLang?._ || 'N/A'}</dd>
					</dl>
				</li>
			{/each}
		</ol>
		<InscriptionPagination
			page={$searchPage}
			count={total}
			perPage={limit}
			onPageChange={handlePageChange}
		/>
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
				font-size: var(--font-size-1);
				text-align: center;
			}
		}
	}

	.title {
		font-weight: bolder;
		margin-block: var(--size-2);
	}

	dl {
		display: grid;
		grid-template-columns: auto auto;
		margin-block-start: var(--size-2);
	}

	dt {
		margin-block-start: unset;
	}
</style>
