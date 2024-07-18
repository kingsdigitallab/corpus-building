<script>
	import InscriptionCard from './InscriptionCard.svelte';

	export let inscriptions;
</script>

<ol class="inscription-list">
	{#each inscriptions as inscription}
		<li>
			<InscriptionCard {inscription} />
		</li>
	{/each}
</ol>

<style>
	ol {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--size-4);
		justify-content: space-between;
		list-style: none;
		padding-inline-start: 0;

		& li {
			border-radius: var(--radius-2);
			box-shadow: var(--shadow-2);
			flex-basis: 95%;
			padding: var(--size-fluid-3);

			@media (--motionOK) {
				animation: var(--animation-fade-in);
			}

			@media (min-width: 640px) {
				flex-basis: 45%;
			}

			@media (min-width: 1024px) {
				flex-basis: 30%;
			}
		}

		& li:hover {
			box-shadow: var(--shadow-4);
		}
	}
</style>
