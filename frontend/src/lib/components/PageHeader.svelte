<script>
	import { browser } from '$app/environment';
	import BaseLink from '$lib/components/BaseLink.svelte';
	import * as config from '$lib/config';
	import ThemeToggle from './ThemeToggle.svelte';

	/**
	 * @typedef {Object} Props
	 * @property {boolean} [debug]
	 */

	/** @type {Props} */
	let { debug = false } = $props();
</script>

<header>
	<nav>
		<BaseLink href="/" class="title">{config.title}</BaseLink>
		<ul>
			<li>About</li>
			<li>Guide</li>
			{#if debug}
				<li><BaseLink href="/_qa">QA</BaseLink></li>
			{/if}
			<li>
				<ThemeToggle />
			</li>
		</ul>
	</nav>
</header>

<style>
	nav {
		align-items: center;
		border-bottom: var(--border-size-1) solid var(--gray-2);
		display: flex;
		justify-content: space-between;
		padding-block: var(--size-2);
	}

	ul {
		align-items: center;
		display: flex;
		gap: var(--size-2);
		list-style: none;
	}

	li {
		display: inline-flex;
	}
</style>
