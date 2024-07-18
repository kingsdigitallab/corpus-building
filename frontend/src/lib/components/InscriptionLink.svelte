<script>
	import BaseLink from './BaseLink.svelte';

	export let id;
	export let title = '';
</script>

<BaseLink href="inscription/{id}" title={title || id}>
	<slot />
</BaseLink>
