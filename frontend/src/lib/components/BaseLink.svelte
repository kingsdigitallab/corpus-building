<script>
	import { createBubbler } from 'svelte/legacy';

	const bubble = createBubbler();
	import { base } from '$app/paths';

	
	/**
	 * @typedef {Object} Props
	 * @property {string} href
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { href, children, ...rest } = $props();

	// ensure the href starts with a forward slash if it doesn't already
	let processedHref = $derived(href?.startsWith('/') ? `${base}${href}` : `${base}/${href}`);

	const children_render = $derived(children);
</script>

<a href={processedHref} {...rest} onclick={bubble('click')}>
	{@render children_render?.()}
</a>

<style>
	.title {
		font-size: var(--font-size-4);
		font-weight: bold;
		margin-block: 0;
	}
</style>
