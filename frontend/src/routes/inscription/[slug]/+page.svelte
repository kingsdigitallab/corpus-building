<script>
	/** @type {import('./$types').PageData} */
	export let data;
</script>

<article>
	<h1>{data.inscription.title}</h1>
	{#each data.inscription.divs as div}
		<section id={div.id} class={div.cls}>
			{@html div.html}
		</section>
	{/each}
</article>
