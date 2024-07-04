<script>
	import BaseLink from '$lib/components/BaseLink.svelte';
	import * as config from '$lib/config';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<hgroup>
	<h1>{data.corpus.length} Inscriptions over x years across x locations</h1>
	<p>{config.description}</p>
</hgroup>

<section>
	<h2>Inscriptions</h2>
	<ol>
		{#each data.corpus as inscription}
			<li>
				<BaseLink href="inscription/{inscription.file}">{inscription.metadata.title}</BaseLink>
			</li>
		{/each}
	</ol>
</section>
