<script>
	import * as config from '$lib/config';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<hgroup>
	<h1>{data.metadata.length} Inscriptions over x years across x locations</h1>
	<p>{config.description}</p>
</hgroup>

<section>
	<h2>Inscriptions</h2>
	<ol>
		{#each data.metadata as inscription}
			<li>
				<a href="inscription/{inscription.file}">{inscription.metadata.title}</a>
			</li>
		{/each}
	</ol>
</section>
