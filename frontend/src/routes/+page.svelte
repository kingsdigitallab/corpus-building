<script>
	import heroImage from '$lib/assets/images/hero.png';
	import FacetedSearch from '$lib/components/search/FacetedSearch.svelte';
	import * as config from '$lib/config';
</script>

<section class="hero">
	<div class="hero-left">
		<hgroup>
			<h1>{config.title}</h1>
			<h2>{config.description}</h2>
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
		font-weight: 600;
		max-inline-size: 100%;
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
		width: 100%;
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
