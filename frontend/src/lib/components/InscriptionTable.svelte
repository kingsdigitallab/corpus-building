<script>
	import InscriptionTableRow from './InscriptionTableRow.svelte';

	let { inscriptions } = $props();
</script>

<table>
	<thead class="surface-1">
		<tr>
			<th class="surface-4">ID</th>
			<th class="surface-4">Title</th>
			<th class="surface-4">Date</th>
			<th class="surface-4">Origin</th>
			<th class="surface-4">Material</th>
			<th class="surface-4">Type</th>
			<th class="surface-4">Object type</th>
			<th class="surface-4">Language</th>
			<th class="surface-4">Current location</th>
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
		font-size: var(--font-size-1);
	}

	th {
		text-align: left;
	}
</style>
