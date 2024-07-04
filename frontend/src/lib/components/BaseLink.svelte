<script>
	import { base } from '$app/paths';

	/** @type {string} */
	export let href;

	/** @type {string} */
	export let className = '';

	// ensure the href starts with a forward slash if it doesn't already
	$: processedHref = href.startsWith('/') ? `${base}${href}` : `${base}/${href}`;
</script>

<a href={processedHref} class={className} {...$$restProps} on:click>
	<slot />
</a>
