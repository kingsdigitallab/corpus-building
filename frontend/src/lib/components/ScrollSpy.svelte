<script>
	import { Tooltip } from 'bits-ui';
	import { onMount } from 'svelte';

	let {
		label = 'Page navigation',
		root = 'main',
		rootSelector = 'section[id]',
		headingSelectors = ['h2', 'h3', 'h4'],
		excludeIds = [],
		displayStyle = 'text'
	} = $props();

	/** @type {import('svelte').SvelteComponent['sections']} */
	let sections = $state([]);

	/** @type {import('svelte').SvelteComponent['activeSection']} */
	let activeSection = $state('');

	let activeHover = $state(null);

	onMount(() => {
		sections = Array.from(document.querySelectorAll(rootSelector))
			.filter((section) => !excludeIds.includes(section.id))
			.map((section) => ({
				id: section.id,
				title: section.querySelector(headingSelectors.join(', '))?.textContent || null,
				element: section
			}))
			.filter((section) => section.title);

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeSection = entry.target.id;
					}
				});
			},
			{
				root: document.querySelector(root),
				rootMargin: '-30% 0px -70% 0px'
			}
		);

		sections.forEach((section) => observer.observe(section.element));

		return () => observer.disconnect();
	});
</script>

<nav aria-label={label}>
	<ul class={displayStyle}>
		{#each sections as section}
			<li>
				{#if displayStyle === 'dots'}
					<div class="dot-container">
						<a
							class="dot"
							class:active={activeSection === section.id}
							href="#{section.id}"
							aria-label={section.title}
							onmouseenter={() => (activeHover = section.id)}
							onmouseleave={() => (activeHover = null)}
						></a>
						{#if activeHover === section.id}
							<div class="tooltip" role="tooltip">{section.title}</div>
						{/if}
					</div>
				{:else}
					<a class:active={activeSection === section.id} href="#{section.id}">{section.title}</a>
				{/if}
			</li>
		{/each}
	</ul>
</nav>

<style>
	nav {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		font-size: var(--font-size-1);
		margin-inline-end: var(--size-2);
		padding: var(--size-2);
	}

	.active {
		background-color: var(--surface-4);
	}

	.dots {
		align-items: center;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-between;
	}

	.dots li {
		height: 100%;
		margin: 0;
		padding: 0;
		position: relative;
	}

	.dots li:not(:last-child)::after {
		background-color: var(--surface-2);
		content: '';
		height: 100%;
		left: 50%;
		position: absolute;
		transition: background-color 0.2s;
		width: 1px;
	}

	.dots li:has(.active.dot):not(:last-child)::after {
		height: calc(100% - var(--size-3));
	}

	.dot-container {
		position: relative;
	}

	.tooltip {
		background: var(--surface-4);
		border-radius: var(--radius-2);
		font-size: var(--font-size-0);
		padding: var(--size-1) var(--size-2);
		position: absolute;
		right: calc(100% + var(--size-2));
		top: 50%;
		/* transform: translateY(-50%); */
		white-space: nowrap;
		z-index: 10;
	}

	.tooltip::first-letter {
		text-transform: uppercase;
	}

	.dot {
		background-color: var(--surface-2);
		border-radius: 50%;
		display: block;
		height: var(--size-2);
		width: var(--size-2);
	}

	.active.dot {
		height: var(--size-3);
		width: var(--size-3);
	}
</style>
