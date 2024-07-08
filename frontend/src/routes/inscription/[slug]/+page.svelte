<script>
	import * as config from '$lib/config';
	import { onMount } from 'svelte';

	/** @type {import('./$types').PageData} */
	export let data;

	let tileSources = data.inscription.images
		.filter((/** @type Object<String, string> */ image) => image.image.endsWith('.tif'))
		.map(
			(/** @type Object<String, string> */ image) =>
				`${config.imageServer}${data.slug}/${image.image}/info.json`
		);

	let OpenSeaDragon;

	onMount(async () => {
		OpenSeaDragon = (await import('openseadragon')).default;

		const viewer = OpenSeaDragon({
			id: 'facsimile-images',
			insecureRequestsAllowed: true,
			prefixUrl: '/openseadragon/images/',
			tileSources,
			sequenceMode: true
		});
	});
</script>

<article>
	<hgroup>
		<h1>{data.inscription.title} <small>{data.metadata.status}</small></h1>
		<p>
			<a href="{config.publicUrl}inscription/{data.slug}" target="inscription"
				>View in current site</a
			>
		</p>
	</hgroup>
	<div class="sections">
		<section id="facsimile-images" style="height: 50vh;"></section>
		{#each data.inscription.divs as div}
			<section id={div.id} class={div.cls}>
				{@html div.html}
			</section>
		{/each}
	</div>
</article>

<style>
	div.sections {
		display: grid;
		gap: var(--size-8);
		grid-template-columns: 2fr 1fr;

		& h2::first-letter,
		h3::first-letter,
		h4::first-letter,
		h5::first-letter,
		h6::first-letter {
			text-transform: uppercase;
		}
	}

	#facsimile-images {
		border: var(--border-size-1) solid var(--gray-2);
		grid-column: 1;
		grid-row: 1;
	}

	#edition {
		font-family: var(--font-antique);
		grid-column: 2;
		grid-row: 1;
	}

	div.sections > *:not(#facsimile-images):not(#edition) {
		grid-column: 1 / -1;
	}

	section {
		margin-block: var(--size-4);
	}

	@media (max-width: 768px) {
		div.sections {
			grid-template-columns: 1fr;
		}

		#facsmile-images,
		#edition {
			grid-column: 1;
		}

		#edition {
			grid-row: 2;
		}

		section {
			margin-block: var(--size-2);
		}
	}
</style>
