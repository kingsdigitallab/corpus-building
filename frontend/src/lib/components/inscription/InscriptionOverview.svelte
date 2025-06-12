<script>
	import { base } from '$app/paths';
	import * as config from '$lib/config';
	import { LucideExternalLink } from 'lucide-svelte';
	import { onMount } from 'svelte';

	const { slug, metadata, images } = $props();
	let curImageTitle = $state(images[0]?.desc || '');

	const tileSources = $derived(
		images.map(
			(/** @type Object<String, string> */ image) =>
				`${config.imageServer}${slug}/${image?.url || ''}/info.json`
		)
	);

	const changeNoteTarget = $derived(
		metadata.status.changeNote?.ref?.target.includes('ISic')
			? metadata.status.changeNote.ref.target.split('/').pop()
			: metadata.status.changeNote?.ref?.target
	);

	onMount(async () => {
		const OpenSeaDragon = (await import('openseadragon')).default;

		const viewer = OpenSeaDragon({
			id: 'image-viewer',
			prefixUrl: `${base}/openseadragon/images/`,
			tileSources,
			sequenceMode: true,
			showReferenceStrip: true,
			preserveViewport: true
		});

		viewer.addHandler('page', (/** @type {{ page: number; }} */ event) => {
			const image = images[event.page];
			curImageTitle = `${image.surfaceType}, ${image.desc}`;
		});
	});
</script>

<section id="overview">
	<div class="overview-header">
		<hgroup>
			<h1 class="inscription-title">{metadata.file}: {metadata.title}</h1>
			{#if metadata.status._ === 'deprecated'}
				<p class="deprecated">
					<strong>This inscription is deprecated.</strong>
					{#if metadata.status.changeNote}
						{@const changeNote = metadata.status.changeNote}
						<small>{changeNote._.replace('  ', ` ${changeNote.ref._} `)}</small>
						{#if changeNote.ref}
							<a href={changeNoteTarget}>
								View inscription {changeNote.ref._}
							</a>
						{/if}
					{/if}
				</p>
			{/if}
		</hgroup>
	</div>
	<figure id="facsimile-images">
		<section id="image-viewer" style="height: 50vh; width: 100%;"></section>
		<figcaption>{curImageTitle}</figcaption>
	</figure>
	<dl>
		<dt>ID</dt>
		<dd>{metadata.file}</dd>
		<dt>Language</dt>
		<dd>{metadata.textLang?._ || config.EMPTY_PLACEHOLDER}</dd>
		<dt>Text type</dt>
		<dd>
			{#if metadata.type?.ref}
				<a class="badge strong" href={metadata.type.ref}
					>{metadata.type?._ || config.EMPTY_PLACEHOLDER}</a
				>
			{:else}
				{metadata.type?._ || config.EMPTY_PLACEHOLDER}
			{/if}
		</dd>
		<dt>Object type</dt>
		{#if metadata.objectType}
			<dd>
				{#if metadata.objectType?.ref}
					<a class="badge strong" href={metadata.objectType.ref}
						>{metadata.objectType?._ || config.EMPTY_PLACEHOLDER}</a
					>
				{:else}
					{metadata.objectType?._ || config.EMPTY_PLACEHOLDER}
				{/if}
			</dd>
		{/if}
		<dt>Status</dt>
		<dd>{metadata._ || config.EMPTY_PLACEHOLDER}</dd>
		<dt>Links</dt>
		<dd>
			<a href="{config.publicUrl}inscription/{slug}" target="inscription">
				View in current site <LucideExternalLink />
			</a>
		</dd>
	</dl>
</section>

<style>
	#overview {
		border-left: var(--border-size-1) solid var(--border-color);
		border-right: var(--border-size-1) solid var(--border-color);
		height: 100%;
		overflow-y: auto;
		margin-top: 0;
		padding-inline: var(--size-4);
		padding-top: 0;
		position: sticky;
		top: 0;
	}

	.overview-header {
		border-bottom: var(--border-size-1) solid var(--border-color);
	}

	#overview h1 {
		font-size: var(--font-size-fluid-1);
		max-inline-size: none;
		padding-block: var(--size-4);
		text-align: center;
	}

	#overview #facsimile-images {
		grid-column: 1;
		grid-row: 1;
		margin: 0 auto;
		padding-inline: var(--size-2);
		width: 100%;
	}

	#overview #facsimile-images figcaption {
		border-top: var(--border-size-1) solid var(--border-color);
		border-bottom: var(--border-size-1) solid var(--border-color);
		font-size: var(--font-size-0);
		max-inline-size: none;
		padding-block: var(--size-4);
		text-align: center;
		text-wrap: balance;
		width: 100%;
	}

	#overview dl {
		column-count: 2;
		column-gap: var(--size-4);
		padding-block: var(--size-4);
	}

	#overview dl dt,
	#overview dl dd {
		display: inline;
		margin: 0;
	}

	#overview dl dt::after {
		content: ': ';
	}

	#overview dl dd::after {
		content: '';
		display: block;
		margin-bottom: var(--size-2);
	}

	#overview dl dd a {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
	}

	@media (max-width: 768px) {
		#overview {
			position: relative;
			height: auto;
			margin-bottom: var(--size-8);
		}

		#overview dl {
			column-count: 1;
		}
	}
</style>
