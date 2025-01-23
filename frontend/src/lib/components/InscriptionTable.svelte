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
	{#each inscriptions as inscription}
		<InscriptionTableRow {inscription} />
	{/each}
</table>

<style>
	table {
		width: 100%;
	}
</style>
