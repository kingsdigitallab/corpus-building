<script>
	import * as config from '$lib/config';

	const { title, excerpt, tags } = $props();
</script>

<svelte:head>
	<title>{title} | {config.title}</title>
	<meta name="description" content={excerpt} />
	<meta name="tags" content={tags.join(', ')} />
</svelte:head>

<article class="md">
	<h1>{title}</h1>
	<slot />
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
