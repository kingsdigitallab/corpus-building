<script>
	import * as config from '$lib/config';
	import BaseLink from '$lib/components/BaseLink.svelte';

	const version = import.meta.env.APP_VERSION;
</script>

<footer>
	<BaseLink href="/">{config.title}</BaseLink>

	<a href="https://github.com/kingsdigitallab/corpus-building/blob/v{version}/CHANGELOG.md"
		>v{version}</a
	>
</footer>

<style>
	footer {
		border-top: var(--border-size-1) solid var(--gray-2);
		display: flex;
		justify-content: space-between;
		padding-block: var(--size-4);
	}

	.version {
		font-size: var(--font-size-0);
	}
</style>
