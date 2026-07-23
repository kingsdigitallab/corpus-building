<script>
	import InscriptionDate from './InscriptionDate.svelte';
	import InscriptionLink from './InscriptionLink.svelte';
	import InscriptionMaterial from './InscriptionMaterial.svelte';
	import InscriptionPlace from './InscriptionPlace.svelte';
	import InscriptionType from './InscriptionType.svelte';

	let {
		inscription,
		showCitedRange = false,
		showBulletinDate = false,
		showInventoryNumber = false
	} = $props();

	const objectType = $derived(inscription.rawObjectType || inscription.objectType);
</script>

<tr>
	{#if showCitedRange}
		<td>
			{#if inscription?.bibl?.citedRange}
				{inscription.bibl.citedRange?.ref?._ || inscription.bibl.citedRange}
			{:else}
				N/A
			{/if}
		</td>
		{#if showBulletinDate}
			<td>
				{inscription.bibl?.inscriptionDate || 'N/A'}
			</td>
		{/if}
	{/if}
	{#if showInventoryNumber}
		<td>{inscription?.idno?._ || 'N/A'}</td>
	{/if}
	<td class="strong">
		<InscriptionLink id={inscription.file}>{inscription.file}</InscriptionLink>
	</td>
	<td class="strong">
		<InscriptionLink id={inscription.file}>{inscription.title}</InscriptionLink>
	</td>
	<td><InscriptionDate date={inscription.date} /></td>
	<td><InscriptionPlace {inscription} /></td>
	<td><InscriptionMaterial material={inscription.material} /></td>
	<td>
		<InscriptionType {inscription} aClass="badge" />
	</td>
	<td>
		{#if objectType?.ref}
			<a class="badge" href={objectType.ref}>{objectType?._}</a>
		{:else}
			{objectType?._ || 'N/A'}
		{/if}
	</td>
	<td>{inscription.textLang?._ || 'N/A'}</td>
	<td>{inscription.settlement || 'N/A'}</td>
</tr>

<style>
	tr {
		font-size: var(--font-size-0);
		vertical-align: middle;
		padding-block: var(--size-1);
	}

	tr:hover {
		font-weight: 600;
	}

	/**ZL changed as for adjusting the alignment*/
	td {
		padding-block: var(--size-4);
		padding-inline: var(--size-3);
		text-align: left;
	}

	td:has(.badge)::first-letter {
		text-transform: capitalize;
	}

	:global(td a, td a:visited) {
		color: var(--text-1);
	}

	/* ZL: table row, keeps links colours stable after visited */
	:global([data-color-scheme='dark'] td a.badge),
	:global([data-color-scheme='dark'] td a.badge:visited),
	:global([data-color-scheme='dark'] td .badge a),
	:global([data-color-scheme='dark'] td .badge a:visited) {
		color: var(--text-2) !important;
	}

	:global([data-color-scheme='light'] td a.badge),
	:global([data-color-scheme='light'] td a.badge:visited),
	:global([data-color-scheme='light'] td .badge a),
	:global([data-color-scheme='light'] td .badge a:visited) {
		color: var(--text-2) !important;
	}

	:global(td .inscription-date),
	:global(td .inscription-place li) {
		font-size: var(--font-size-0);
	}

	/* ZL: table row hover – different in light and dark */

	/* Light mode: cream / yellow highlight */
	:global([data-color-scheme='light'] #faceted-search table tbody tr:hover),
	:global([data-color-scheme='light'] #faceted-search table tbody tr:hover td) {
		background-color: var(--brown-0); /* the yellow you like */
		color: var(--text-1);
	}

	/* Dark mode: subtle lighter band, not black */
	:global([data-color-scheme='dark'] #faceted-search table tbody tr:hover),
	:global([data-color-scheme='dark'] #faceted-search table tbody tr:hover td) {
		background-color: #50514f;
		color: var(--text-1);
	}

	/* ZL: hide secondary metadata cells on mobile */
	@media (max-width: 768px) {
		tr td:nth-child(5),
		tr td:nth-child(6),
		tr td:nth-child(7),
		tr td:nth-child(8),
		tr td:nth-child(9) {
			display: none;
		}

		/* ZL: give date column a little more space on mobile */
		tr td:nth-child(3) {
			min-width: 5.5rem;
		}
	}

	/* ZL: stack origin badges vertically in table view */
	td :global(.inscription-place ul) {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--size-2);
	}
</style>
