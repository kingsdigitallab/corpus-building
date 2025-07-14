<script>
	/** @type {{ data: import('./$types').PageData }} */
	const { data } = $props();
	const { title, content } = data;
</script>

<article>
	<h1>{title}</h1>
	<div>{@html content.body}</div>
</article>
