<script>
	import { page } from '$app/stores';
	import BaseLink from '$lib/components/BaseLink.svelte';
	import * as config from '$lib/config';

	import 'open-props/style';
	import 'open-props/normalize';
	import 'open-props/buttons';

	import '../app.css';

	/** @type {import('./$types').LayoutData} */
	export let data;

	const version = import.meta.env.APP_VERSION;
</script>

<svelte:head>
	{#if $page.data.title}
		<title>{config.title} | {$page.data.title}</title>
	{:else}
		<title>{config.title}</title>
	{/if}
</svelte:head>

<div class="layout">
	<header>
		<nav>
			<BaseLink href="/" class="title">{config.title}</BaseLink>
			<ul>
				{#if data.debug}
					<li><BaseLink href="/_qa">QA</BaseLink></li>
				{/if}
			</ul>
		</nav>
	</header>
	<main>
		<slot />
	</main>
	<footer>
		<p>
			{config.title}
			<a href="https://github.com/kingsdigitallab/corpus-building/blob/v{version}/CHANGELOG.md"
				>v{version}</a
			>
		</p>
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
	}

	nav {
		align-items: center;
		border-bottom: var(--border-size-1) solid var(--gray-2);
		display: flex;
		justify-content: space-between;
		padding-block: var(--size-2);

		& ul {
			list-style: none;
		}
	}

	main {
		padding-block: var(--size-9);
	}

	footer {
		border-top: var(--border-size-1) solid var(--gray-2);
		padding-block: var(--size-4);
	}

	@media (min-width: 1280px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>
