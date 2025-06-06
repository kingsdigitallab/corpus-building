<script>
	import heroImage1 from '$lib/assets/images/hero1.png';
	import heroImage2 from '$lib/assets/images/hero2.png';
	import FacetedSearch from '$lib/components/search/FacetedSearch.svelte';
	import * as config from '$lib/config';
	import { onMount } from 'svelte';

	let heroImage = $state(heroImage1);

	onMount(() => {
		heroImage = Math.random() * 2 < 1 ? heroImage1 : heroImage2;
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
			<img src={heroImage} alt={config.heroImageDescription} />
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

	.hero-right img {
		display: block;
		height: 110%;
		object-fit: cover;
		object-position: left;
		width: auto;
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
