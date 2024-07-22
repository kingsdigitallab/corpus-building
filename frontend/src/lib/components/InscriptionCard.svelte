<script>
	import * as config from '$lib/config.js';
	import { Image } from '@unpic/svelte';
	import InscriptionDate from './InscriptionDate.svelte';
	import InscriptionPlace from './InscriptionPlace.svelte';
	import InscriptionLink from './InscriptionLink.svelte';

	export let inscription;
</script>

<div class="inscription-card">
	{#if inscription.facsimile}
		<InscriptionLink id={inscription.file} title={inscription.title}>
			<Image
				src="{config.imageServer}{inscription.file}/{inscription.facsimile
					.url}/{config.imageThumbParams}"
				alt={inscription.facsimile.desc}
				width={400}
				height={200}
			/>
		</InscriptionLink>
	{/if}
	<p class="inscription-title">
		<InscriptionLink id={inscription.file} title={inscription.title}
			>{inscription.title}</InscriptionLink
		>
	</p>
	<p class="inscription-date-place">
		<InscriptionDate {inscription} />
		<InscriptionPlace {inscription} />
	</p>
	<dl>
		<dt>ID</dt>
		<dd>
			<small>
				<InscriptionLink id={inscription.file}>{inscription.file}</InscriptionLink>
			</small>
		</dd>
		<dt>Status</dt>
		<dd>{inscription.status}</dd>
		<dt>Type</dt>
		{#if inscription.type?.ref}
			<dd><a href={inscription.type.ref}>{inscription.type?._}</a></dd>
		{:else}
			<dd>{inscription.type?._ || 'N/A'}</dd>
		{/if}
		<dt>Object type</dt>
		{#if inscription.objectType?.ref}
			<dd><a href={inscription.objectType.ref}>{inscription.objectType?._}</a></dd>
		{:else}
			<dd>{inscription.objectType?._ || 'N/A'}</dd>
		{/if}
		<dt>Language</dt>
		<dd>{inscription.textLang?._ || 'N/A'}</dd>
	</dl>
</div>

<style>
	.inscription-title {
		font-weight: bolder;
		margin-block: var(--size-2);
	}

	dl {
		display: grid;
		grid-template-columns: auto auto;
		margin-block-start: var(--size-2);
	}

	dt {
		margin-block-start: unset;
	}
</style>
