<script>
	import FacetedSearch from '$lib/components/search/FacetedSearch.svelte';
	import * as config from '$lib/config';
	import { onMount } from 'svelte';

	let heroImage = $state(config.heroImages[0]);
	let heroImageSrc = $state(heroImage.image);
	let isHeroLoading = $state(true);

	onMount(async () => {
		heroImage = config.heroImages[Math.floor(Math.random() * config.heroImages.length)];

		const heroImageSrcModule = await import(`../lib/assets/images/hero/${heroImage.image}`);
		heroImageSrc = heroImageSrcModule.default;

		isHeroLoading = false;
	});
</script>

<section class="hero">
	<div class="hero-left">
		<hgroup>
			<h1>{config.title}</h1>
			<h2>{config.subtitle}</h2>
			<p>{config.description}</p>
		</hgroup>
		<a class="discover-link" href="#faceted-search">
			<span class="arrow">↓</span>
			<span class="discover-link-text">Discover the inscriptions</span>
		</a>
	</div>
	<div class="hero-right">
		<picture>
			{#if isHeroLoading}
				<div class="hero-loading-placeholder" />
			{:else}
				<img
					src={heroImageSrc}
					alt={heroImage.description}
					style="opacity: 0"
					onload={(e) => e.target && (e.target.style.opacity = 1)}
				/>
			{/if}
		</picture>
	</div>
</section>

<div class="hero-spacer"></div>

<FacetedSearch />

<style>
	.hero {
		border-bottom: var(--border-size-1) solid var(--border-color);
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: 0;
		min-height: calc(100vh - 140px);
	}

	.hero-left {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-block: var(--size-6);
	}

	.hero-left h1 {
		font-size: clamp(4rem, 8vw, 7rem);
		font-weight: 900;
		text-transform: uppercase;
		letter-spacing: 0.02em;
	}

	.hero-left h2 {
		margin-block-end: var(--size-2);
		text-wrap: balance;
	}

	.hero-left p {
		font-size: var(--font-size-2);
		font-weight: 500;
		max-inline-size: 100%;
		text-wrap: balance;
	}

	.discover-link {
		align-items: center;
		color: var(--text-1);
		display: flex;
		font-size: var(--font-size-2);
		font-weight: bold;
		gap: var(--size-2);
		text-decoration: none;
	}

	.arrow {
		border-radius: var(--radius);
		border: var(--border-size-1) solid var(--border-color);
		padding-inline: var(--size-2);
	}

	.discover-link-text {
		text-decoration: underline;
	}

	.hero-right {
		align-self: stretch;
		border-left: var(--border-size-1) solid var(--border-color);
		overflow: visible;
		z-index: -1;
	}

	.hero-loading-placeholder {
		width: 100%;
		height: 100%;
		background: var(--surface-4);
		animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		transition: opacity 0.5s ease-in-out;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.75;
		}
		50% {
			opacity: 0.5;
		}
	}

	.hero-right img {
		display: block;
		height: 110%;
		object-fit: cover;
		object-position: left;
		width: auto;
		transition: opacity 0.5s ease-in-out;
	}

	.hero-spacer {
		height: var(--size-10);
	}

	@media (max-width: 768px) {
		.hero {
			grid-template-columns: 1fr;
			height: auto;
		}
		.hero-right {
			display: none;
		}
		.hero-spacer {
			height: var(--size-6);
		}
	}
</style>
