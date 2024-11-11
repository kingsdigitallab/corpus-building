<script>
	import { page } from '$app/stores';
	import BaseLink from '$lib/components/BaseLink.svelte';
	import Header from '$lib/components/PageHeader.svelte';
	import Transition from '$lib/components/PageTransition.svelte';
	import * as config from '$lib/config';

	import 'open-props/style';
	import 'open-props/normalize';
	import 'open-props/buttons';

	import '../app.css';

	
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').LayoutData} data
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { data, children } = $props();

	const version = import.meta.env.APP_VERSION;

	let { url } = $derived(data);

	const children_render = $derived(children);
</script>

<svelte:head>
	{#if $page.data.title}
		<title>{config.title} | {$page.data.title}</title>
	{:else}
		<title>{config.title}</title>
	{/if}
</svelte:head>

<div class="layout">
	<Header debug={data.debug} />

	<main>
		<Transition {url}>
			{@render children_render?.()}
		</Transition>
	</main>

	<footer>
		<BaseLink href="/">{config.title}</BaseLink>
		<code class="version">
			<a href="https://github.com/kingsdigitallab/corpus-building/blob/v{version}/CHANGELOG.md"
				>v{version}</a
			>
		</code>
	</footer>
</div>

<style>
	.layout {
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100%;
		margin-inline: auto;
		max-inline-size: 1280px;
		padding-inline: var(--size-8);

		transition:
			background-color 0.25s ease-in-out,
			color 0.25s ease-in-out;
	}

	main {
		padding-block: var(--size-4);
	}

	footer {
		border-top: var(--border-size-1) solid var(--gray-2);
		display: flex;
		justify-content: space-between;
		padding-block: var(--size-4);
	}

	.version {
		font-size: var(--font-size-0);
	}

	@media (min-width: 1280px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>
