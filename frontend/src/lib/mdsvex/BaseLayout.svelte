<script>
	import * as config from '$lib/config';

	let { title, excerpt, tags } = $props();
</script>

<svelte:head>
	<title>{title} | {config.title}</title>
	<meta name="description" content={excerpt} />
	<meta name="tags" content={tags.join(', ')} />
</svelte:head>

<article>
	<h1>{title}</h1>
	<slot />
</article>
