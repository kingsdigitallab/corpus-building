<script>
	import { dev } from '$app/environment';
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
		<ul>
			<li>
				<BaseLink href="/" class="title">{config.title}</BaseLink>
			</li>
			{#if dev}
				<li><mark>dev</mark></li>
			{/if}
		</ul>
		<ul>
			<li><BaseLink href="/about">About</BaseLink></li>
			<li>Guide</li>
			{#if dev && debug}
				<li><BaseLink href="/_styleguide">Style Guide</BaseLink></li>
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
		border-bottom: var(--border-size-1) solid var(--border-color);
		display: flex;
		justify-content: space-between;
		padding-block: var(--size-2);
	}

	ul {
		align-items: center;
		display: flex;
		gap: var(--size-2);
		list-style: none;
		padding-inline-start: 0;
	}

	ul:first-child li:first-child {
		padding-inline-start: 0;
	}

	li {
		display: inline-flex;
	}
</style>
