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

	function handleReset() {
		inscriptions = data.corpus;

		finishedSearch = false;
		keywords = '';
	}

	function handleSearch() {
		finishedSearch = true;

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
					.every((keyword) => {
						return (
							inscription.metadata.keywords.some((mk) => mk.includes(keyword)) ||
							inscription.metadata.title.toLowerCase().includes(keyword)
						);
					})
			);
		});
	}

	onMount(() => {
		keywords = $page.url.searchParams.get('keywords') || '';
	});
</script>

<article>
	<hgroup>
		<h1>{data.corpus.length.toLocaleString()} Inscriptions over x years across x locations</h1>
		<p>{config.description}</p>
	</hgroup>

	<section>
		<form on:submit={() => handleSearch()} on:reset={() => handleReset()}>
			<label for="keywords">Keywords</label>
			<input type="text" name="keywords" id="keywords" bind:value={keywords} />
			<input type="submit" value="Search" disabled={!keywords} />
			<input type="reset" value="Reset" disabled={!keywords} />
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
			{#each inscriptions as inscription}
				<li>
					<h4>
						<BaseLink href="inscription/{inscription.file}">{inscription.metadata.title}</BaseLink>
					</h4>
					<dl>
						<dt>Settlement</dt>
						<dd>{inscription.metadata.settlement}</dd>
						<dt>Repository</dt>
						<dd>{inscription.metadata.repository?._ || 'N/A'}</dd>
						<dt>Language</dt>
						<dd>{inscription.metadata.textLang?._ || 'N/A'}</dd>
					</dl>
				</li>
			{/each}
		</ol>
	</section>
</article>

<style>
	dt {
		margin-block-start: unset;
	}
</style>
