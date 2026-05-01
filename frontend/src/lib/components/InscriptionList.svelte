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
	/*ZL adjusted a bit of the layout*/
	ol {
		display: grid; /**ZL changed from flex to grid*/
		grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
		/*flex-direction: row;*/ /**Zl deleted this line*/
		/*flex-wrap: wrap;*/
		gap: 0; /*ZL changed from var(size--1) to 0*/
		/*justify-content: flex-start; /* ZL changed from space-between */
		list-style: none;
		padding-inline-start: 0;
		width: 100%;
		min-width: 0;
		border-left: 1px solid var(--border-color);
		border-top: 1px solid var(--border-color);

		& li {
			border-radius: 0; /* ZL changed from var(--radius-2) to 0 */
			/* flex-basis: 100%; /* ZL changed from 95% to 100% */
			padding-inline-start: unset;

			@media (--motionOK) {
				animation: var(--animation-fade-in);
			}

			/* @media (min-width: 640px) {
				flex-basis: 50%;
			}

			@media (min-width: 1024px) {
				flex-basis: 33.3333%;
			} */
		}

		& li:hover {
			box-shadow: none; /* ZL adjusted var(--shadow-4) to none */
		}
	}

	@media (min-width: 640px) and (max-width: 1023.99px) {
		ol {
			gap: 0; /*ZL changede from var(--size-2) to 0*/
		}
	}

	@media (max-width: 639.99px) {
		ol {
			grid-template-columns: 1fr;
			border-right: none;
		}
	}
</style>
