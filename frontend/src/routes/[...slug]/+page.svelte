<script>
	/** @type {{ data: import('./$types').PageData }} */
	const { data } = $props();
	const { title, content } = data;
</script>

<article class="md">
	<h1>{title}</h1>
	{@html content.body}
</article>

<style>
	.md {
		display: flex;
		flex-direction: column;
		gap: var(--size-4);
		margin-block: var(--size-8);
		margin-inline: auto;
		max-width: 80ch;
	}

	.md h1 {
		max-width: 100%;
		text-align: center;
	}

	:global(.md p) {
		max-inline-size: unset;
		text-align: justify;
	}
</style>
