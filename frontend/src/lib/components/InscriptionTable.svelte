<script>
	import InscriptionTableRow from './InscriptionTableRow.svelte';
	import { Button } from 'bits-ui';
	import { LucideArrowUp, LucideArrowDown } from 'lucide-svelte';

	let {
		inscriptions,
		showSearch = false,
		sortOptions = [],
		showCitedRange = false,
		showBulletinDate = false,
		showInventoryNumber = false
	} = $props();

	let search = $state('');
	let sortBy = $state(sortOptions?.[0]?.value || 'file');
	let sortDir = $state(1);

	let filteredInscriptions = $derived(
		inscriptions
			.filter(
				(inscription) =>
					inscription.keywords?.join(' ').toLowerCase().includes(search.toLowerCase()) ||
					inscription?.idno?._?.toLowerCase().includes(search.toLowerCase()) ||
					inscription?.bibl?.citedRange?.toLowerCase().includes(search.toLowerCase())
			)
			.sort((a, b) => {
				if (sortBy === 'idnoSort') {
					return a[sortBy] - b[sortBy] * sortDir;
				}

				return (a[sortBy] || '').localeCompare(b[sortBy]) * sortDir;
			})
	);
	const total = $derived(filteredInscriptions.length);
</script>

{#if showSearch}
	<section class="controls">
		<input
			class="search"
			type="search"
			bind:value={search}
			placeholder="Search ISic, title..."
			aria-label="Search inscription table"
		/>
		<div class="sort">
			<label>
				<span>Sort by</span>
				<select bind:value={sortBy}>
					{#each sortOptions as option (option.value)}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				<Button.Root
					class="order-toggle"
					onclick={() => (sortDir = sortDir * -1)}
					aria-label="Toggle sort order from ascending to descending"
				>
					{#if sortDir === 1}
						<LucideArrowUp aria-label="Ascending" />
					{:else}
						<LucideArrowDown aria-label="Descending" />
					{/if}
				</Button.Root>
			</label>
		</div>
		<p class="meta">{total} inscription{total === 1 ? '' : 's'}</p>
	</section>
{/if}

<table>
	<thead class="surface-1">
		<tr>
			{#if showCitedRange}
				<th class="surface-4">Cited range</th>
				{#if showBulletinDate}
					<th class="surface-4">Bulletin date</th>
				{/if}
			{/if}
			{#if showInventoryNumber}
				<th class="surface-4">Inventory number</th>
			{/if}
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
		{#each filteredInscriptions as inscription}
			<InscriptionTableRow
				{inscription}
				{showCitedRange}
				{showBulletinDate}
				{showInventoryNumber}
			/>
		{/each}
	</tbody>
</table>

<style>
	.controls {
		align-items: center;
		border-block: var(--border-size-1) solid var(--border-color);
		border-top: none;
		column-gap: var(--size-4);
		display: flex;
		flex-wrap: wrap;
		margin-bottom: var(--size-4);
		margin-top: unset;
		padding-block: var(--size-3);
		row-gap: var(--size-3);
	}

	.controls .search {
		flex: 1 1 100%;
	}

	.controls .meta {
		font-size: var(--font-size-1);
		margin-right: auto;
		order: 1;
	}

	.controls .sort {
		align-items: center;
		display: flex;
		flex-wrap: wrap;
		gap: var(--size-2) var(--size-4);
		margin-left: auto;
		order: 2;
	}

	.sort label {
		align-items: center;
		display: inline-flex;
		gap: var(--size-2);
	}

	.search {
		background: var(--surface-1);
		border-radius: var(--radius-2);
		border: 1px solid var(--border-color);
		color: var(--text-1);
		padding: var(--size-2) var(--size-3);
		width: 100%;
	}

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
