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

	:global(.md .tap-target-links a) {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding-inline: var(--size-2);
	}

	:global(.md .tap-target-links li) {
		margin-bottom: 4px;
	}

	:global(.md a[href^='http']:not(.badge)):not(:has(img))::after {
		content: '↗';
		margin-left: 0.25em;
		font-size: 0.8em;
		display: inline-block;
		vertical-align: text-top;
	}

	:global(.md table) {
		--nice-inner-radius: 0;

		align-self: center;
		background: var(--surface-1);
		border: var(--border-size-1) solid var(--border-color);
		border-radius: var(--radius-1);
		border-spacing: 0;
	}

	:global(.md thead) {
		background-color: var(--surface-1);
		border-start-start-radius: unset;
		color: var(--text-1);
		font-size: var(--font-size-1);
	}

	:global(.md th) {
		background-color: var(--surface-4);
		color: var(--text-1);
		text-align: left;
	}

	:global(.md td) {
		text-align: left;
	}

	/* ZL: Make text visible inside tables */
	:global(.md td code) {
		color: var(--gray-12);
	}

	/* ZL: Changing colours in light mode */
	:global(html[data-color-scheme='light'] .md td code) {
		background-color: var(--surface-4);
		color: var(--gray-12);
	}

	/* ZL: changed row hovering colour (before was not accessible) */

	/* Light mode row hover */
	:global([data-color-scheme='light'] .md table tbody tr:hover),
	:global([data-color-scheme='light'] .md table tbody tr:hover td) {
		background-color: var(--surface-4);
		color: var(--text-1);
	}

	/* Dark mode row hover */
	:global([data-color-scheme='dark'] .md table tbody tr:hover),
	:global([data-color-scheme='dark'] .md table tbody tr:hover td) {
		background-color: var(--surface-4);
		color: var(--text-1);
	}
</style>
