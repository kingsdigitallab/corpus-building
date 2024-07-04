<script>
	import BaseLink from '$lib/components/BaseLink.svelte';
	import * as config from '$lib/config';

	import 'open-props/style';
	import 'open-props/normalize';

	/** @type {import('./$types').LayoutData} */
	export let data;
</script>

<div class="layout">
	<header>
		<ul>
			<li><BaseLink href="/">{config.title}</BaseLink></li>
			{#if data.debug}
				<li><BaseLink href="/_qa">QA</BaseLink></li>
			{/if}
		</ul>
	</header>
	<main>
		<slot />
	</main>
	<footer>---</footer>
</div>

<style>
	.layout {
		height: 100%;
		max-inline-size: 1280px;
		display: grid;
		grid-template-rows: auto 1fr auto;
		margin-inline: auto;
		padding-inline: var(--size-7);
	}

	main {
		padding-block: var(--size-9);
	}

	@media (min-width: 1280px) {
		.layout {
			padding-inline: 0;
		}
	}
</style>
