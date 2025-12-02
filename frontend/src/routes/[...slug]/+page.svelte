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

	:global(.md h1, .md h2, .md h3, .md h4, .md h5, .md h6) {
		max-inline-size: unset;
	}

	:global(.md p) {
		max-inline-size: unset;
		text-align: justify;
	}

	/* ZL added underline all links */
	:global(.md a) {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	:global(.md a[href^='http']:not(.badge))::after {
		content: '↗';
		margin-left: 0.25em;
		font-size: 0.8em;
		display: inline-block;
		vertical-align: text-top;
	}
</style>
