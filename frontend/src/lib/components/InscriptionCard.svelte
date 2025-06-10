<script>
	import * as config from '$lib/config.js';
	import { fuzzyMatch } from '$lib/utils/fuzzy.js';
	import { Image } from '@unpic/svelte';
	import InscriptionDate from './InscriptionDate.svelte';
	import InscriptionPlace from './InscriptionPlace.svelte';
	import InscriptionLink from './InscriptionLink.svelte';

	const { inscription, view = 'image', query } = $props();

	/**
	 * @param {string} html
	 */
	function highlightText(html) {
		if (!query) return html;

		const parser = new DOMParser();
		const doc = parser.parseFromString(html, 'text/html');
		const elements = doc.querySelectorAll('[data-lemma], [data-text]');
		const queryWords = query.toLowerCase().split(/\s+/).filter(Boolean);

		for (const element of elements) {
			const lemma = element.getAttribute('data-lemma');
			const text = element.getAttribute('data-text');
			const shouldHighlight = queryWords.some(
				(/** @type {string} */ word) =>
					(lemma && fuzzyMatch(word, lemma)) || (text && fuzzyMatch(word, text))
			);

			if (shouldHighlight) {
				const mark = document.createElement('mark');
				for (const attr of element.attributes) {
					mark.setAttribute(attr.name, attr.value);
				}
				mark.innerHTML = element.innerHTML;
				element.replaceWith(mark);
			}
		}

		return doc.body.innerHTML;
	}
</script>

<div class="inscription-card">
	<div class="card-header">
		<InscriptionLink id={inscription.file} class="inscription-id">
			ID: {inscription.file}
		</InscriptionLink>

		{#if view === 'image'}
			<div class="card-image">
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
				{:else}
					<div class="card-image-placeholder"></div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="card-body">
		{#if view === 'text'}
			<div class="surface-4 edition-content">
				{@html highlightText(inscription.html)}
			</div>
		{/if}
		<div class="inscription-title">
			<InscriptionLink id={inscription.file} title={inscription.title}
				>{inscription.title}</InscriptionLink
			>
		</div>
		<div class="inscription-date-place">
			<InscriptionDate date={inscription.date} />
			<InscriptionPlace {inscription} />
		</div>
	</div>
	<div class="card-footer">
		<dl>
			<dt>Status</dt>
			<dd>{inscription?.status || 'N/A'}</dd>
			<dt>Type</dt>
			<dd class="badge strong">
				{#if inscription.type?.ref}
					<a href={inscription.type.ref}>{inscription.type?._}</a>
				{:else}
					{inscription.type?._ || 'N/A'}
				{/if}
			</dd>
		</dl>
		<dl>
			<dt>Object type</dt>
			<dd class="badge strong">
				{#if inscription.rawObjectType?.ref}
					<a href={inscription.rawObjectType.ref}>{inscription.rawObjectType?._}</a>
				{:else}
					{inscription.rawObjectType?._ || 'N/A'}
				{/if}
			</dd>
			<dt>Language</dt>
			<dd>{inscription.textLang?._ || 'N/A'}</dd>
		</dl>
	</div>
</div>

<style>
	.inscription-card {
		border: 1px solid var(--border-color);
		height: 100%;
		text-align: center;
		display: flex;
		flex-direction: column;
	}

	.card-header {
		padding-block: var(--size-2);
	}

	:global(.inscription-id) {
		color: var(--text-1);
		font-size: var(--font-size-3);
		font-weight: normal;
	}

	.card-image {
		padding: var(--size-8) var(--size-4) 0 var(--size-4);
	}

	.card-image-placeholder {
		background-color: var(--surface-2);
		height: 200px;
		width: 100%;
	}

	.card-body {
		padding-block: var(--size-4);
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.edition-content {
		border-radius: var(--radius-2);
		font-family: var(--font-family-greek);
		font-size: var(--font-size-1);
		height: 100%;
		max-height: 200px;
		min-height: 200px;
		margin-inline: var(--size-2);
		overflow-x: scroll;
		overflow-y: scroll;
		padding-block: var(--size-4);
		padding-left: var(--size-8);
		padding-right: var(--size-3);
		position: relative;
		text-align: start;
		transition: max-height 0.3s ease-in-out;
	}

	.inscription-title {
		font-size: var(--font-size-3);
		font-weight: bold;
		margin-top: var(--size-2);
	}

	:global(.inscription-title a) {
		color: var(--text-1);
	}

	:global(.inscription-date) {
		font-size: var(--font-size-1);
	}

	:global(.inscription-place) {
		font-size: var(--font-size-1);
	}

	.card-footer {
		border-top: 1px solid var(--border-color);
		bottom: 0;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding-block: var(--size-4);
		padding-inline: var(--size-4);
		text-align: left;
	}

	dl:last-of-type {
		text-align: right;
	}

	dt {
		font-size: var(--font-size-1);
		font-weight: normal;
	}

	dt:not(:first-of-type) {
		margin-block-start: var(--size-2);
	}

	dd {
		font-weight: bold;
	}

	dd::first-letter {
		text-transform: capitalize;
	}
</style>
