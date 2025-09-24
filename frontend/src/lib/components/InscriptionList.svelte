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
		justify-content: space-between;
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
				flex-basis: 45%;
			}

			@media (min-width: 1024px) {
				flex-basis: 33%;
			}
		}

		& li:hover {
			box-shadow: var(--shadow-4);
		}
	}
</style>
