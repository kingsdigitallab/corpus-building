<script>
	import InscriptionTableRow from './InscriptionTableRow.svelte';

	let { inscriptions } = $props();
</script>

<table>
	<thead>
		<tr>
			<th>ID</th>
			<th>Title</th>
			<th>Date</th>
			<th>Place</th>
			<th>Status</th>
			<th>Type</th>
			<th>Object type</th>
			<th>Language</th>
			<th>Settlement</th>
		</tr>
	</thead>
	<tbody>
		{#each inscriptions as inscription}
			<InscriptionTableRow {inscription} />
		{/each}
	</tbody>
</table>

<style>
	table {
		--nice-inner-radius: 0;

		background: unset;
		border: unset;
		border-radius: unset;
		border-spacing: 0;
		border-top: 1px solid var(--border-color);
		width: 100%;
	}

	thead {
		border-start-start-radius: unset;
		background-color: var(--surface-2);
		font-size: var(--font-size-1);
	}

	th {
		text-align: left;
	}
</style>
