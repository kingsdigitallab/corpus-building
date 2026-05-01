<script>
	import { page } from '$app/stores';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/PageHeader.svelte';
	import Transition from '$lib/components/PageTransition.svelte';
	import * as config from '$lib/config';

	import 'open-props/style';
	import 'open-props/normalize';
	import 'open-props/buttons';
	import 'open-props/colors-hsl';

	import '$lib/assets/styles/app.css';

	
	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').LayoutData} data
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let { data, children } = $props();

	let { url } = $derived(data);

	const children_render = $derived(children);
</script>

<svelte:head>
	{#if $page.data.title}
		<title>{$page.data.title} | {config.title}</title>
	{:else}
		<title>{config.title} — {config.subtitle}</title>
	{/if}
	<meta name="description" content={config.description} />
	<link rel="canonical" href={`${config.url}${$page.url.pathname}`} />
	<meta property="og:site_name" content={config.title} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${config.url}${$page.url.pathname}`} />
	<meta
		property="og:title"
		content={$page.data.title ? `${$page.data.title} | ${config.title}` : config.title}
	/>
	<meta property="og:description" content={config.description} />
</svelte:head>

<div class="layout">
	<Header debug={data.debug} />

	<main>
		<Transition {url}>
			{@render children_render?.()}
		</Transition>
	</main>

	<Footer />
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

	@media (max-width: 1279px) {
		.layout {
			padding-inline: var(--size-2);
		}
	}

	@media (min-width: 1280px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>