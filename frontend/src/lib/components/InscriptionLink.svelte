<script>
	import BaseLink from './BaseLink.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {any} id
	 * @property {string} [title]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { id, title = '', children, ...rest } = $props();

	const children_render = $derived(children);
</script>

<BaseLink href={`/inscription/${id}`} title={title || id} {...rest}>
	{@render children_render?.()}
</BaseLink>
