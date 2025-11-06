<script>
	import InscriptionCard from './InscriptionCard.svelte';

	const { inscriptions, view = 'image', query, exactSearch = false } = $props();
</script>

<ol class="inscription-list">
	{#each inscriptions as inscription (inscription.file)}
		<li>
			<InscriptionCard {inscription} {view} {query} {exactSearch} />
		</li>
	{/each}
</ol>

<style>
	ol {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--size-1);
		justify-content: flex-start; /* ZL changed from space-between */
		list-style: none;
		padding-inline-start: 0;

		& li {
			border-radius: var(--radius-2);
			flex-basis: 95%;
			padding-inline-start: unset;

			@media (--motionOK) {
				animation: var(--animation-fade-in);
			}

			@media (min-width: 640px) {
				flex-basis: calc(50% - (var(--size-2) / 2));
			}

			@media (min-width: 1024px) {
				flex-basis: calc(33.3333% - (2 * var(--size-2) / 3));
			}
		}

		& li:hover {
			box-shadow: var(--shadow-4);
		}
	}

	@media (min-width: 640%) and (max-width: 1023.98px) {
		ol {
			gap: var(--size-2);
		}
	}
</style>
