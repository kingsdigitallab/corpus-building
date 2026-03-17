<script>
	import { DownloadIcon, TableIcon } from 'lucide-svelte';

	/** 
	 * @type {{ 
	 *   title: string,
	 *   summary: string,
	 *   data: Array<{ key: string, value: number } & Record<string, unknown>>,
	 *   columns?: string[],
	 *   formatKey?: (key: string | undefined) => string,
	 *   settingsSlot?: import('svelte').Snippet,
	 *   children: import('svelte').Snippet<[number]>
	 * }} 
	 */
	let { 
		title, 
		summary, 
		data,
		columns = [],
		formatKey = (k) => k ?? '',
		settingsSlot,
		children
	} = $props();

	// Shared state
	let height = $state(400);
	let showDataTable = $state(false);
	let isDownloading = $state(false);

	// Download functionality
	function dataToCSV() {
		const headers = ['Category', 'Count', ...columns];
		const rows = data.map((d) => [
			d.key,
			d.value,
			...columns.map((col) => d[col] || '-')
		]);

		return [headers, ...rows].map((row) => row.join(',')).join('\n');
	}

	async function downloadData() {
		isDownloading = true;

		const csv = dataToCSV();
		const blob = new Blob([csv], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'data.csv';
		a.click();
		a.remove();
		URL.revokeObjectURL(url);

		isDownloading = false;
	}
</script>

<section class="viz-settings">
	<fieldset>
		{@render settingsSlot?.()}
		<label>
			Chart height ({height}px)
			<input
				type="range"
				min="200"
				max="2000"
				step="10"
				bind:value={height}
				aria-label="Adjust chart height"
			/>
			<small>Move the slider to adjust the chart height</small>
		</label>
	</fieldset>
</section>

<section class="viz-summary">
	<hgroup>
		<h3>{title}</h3>
		<p>{@html summary}</p>
	</hgroup>
</section>

<section class="viz-container">
	{@render children(height)}
</section>

{#if data?.length > 0}
	<section class="viz-data">
		<p>
			<button class="surface-2" onclick={() => (showDataTable = !showDataTable)}>
				<TableIcon />{showDataTable ? 'Hide' : 'Show'} data
			</button>
		</p>
		{#if showDataTable}
			<div class="table-scroll">
				<table>
					<thead class="surface-1">
						<tr>
							<th class="surface-4">{title}</th>
							<th class="surface-4">Count</th>
							{#each columns as col (col)}
								<th class="surface-4">{formatKey(col)}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data as d (d.key)}
							<tr>
								<td>{d.key}</td>
								<td class="number">{d.value.toLocaleString()}</td>
								{#each columns as col (col)}
									<td class="number">{d[col]?.toLocaleString?.() || '-'}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<p>
				<button onclick={downloadData} aria-busy={isDownloading} disabled={isDownloading}>
					<DownloadIcon />{isDownloading ? 'Downloading...' : 'Download data'}
				</button>
			</p>
		{/if}
	</section>
{/if}

<style>
	.viz-settings {
		margin-bottom: 0;
		margin-top: var(--size-2);
	}

	:global(.viz-settings fieldset) {
		border: none;
		display: flex;
		justify-content: space-between;
	}

	:global(.viz-settings fieldset > *) {
		align-items: flex-start;
		display: flex;
		flex-direction: column;
		justify-content: center;
		max-inline-size: unset;
		padding-bottom: var(--size-4);
		padding-inline: var(--size-8);
		width: 100%;
	}

	:global(small) {
		max-inline-size: unset;
	}

	:global(.viz-settings fieldset > :first-child) {
		border-right: var(--border-size-1) solid var(--gray-4);
	}

	:global(input[type='range']) {
		width: 100%;
	}

	.viz-summary {
		border-top: var(--border-size-1) solid var(--gray-4);
		padding-top: var(--size-4);
		margin-bottom: 0;
		margin-top: var(--size-4);
	}

	.viz-summary hgroup p {
		max-inline-size: unset;
	}

	.viz-container {
		display: flex;
		gap: var(--size-8);
		justify-content: space-between;
		margin-top: 0;
		max-width: 100%;
		padding-top: var(--size-10);
	}

	.viz-data {
		align-items: center;
		border-top: var(--border-size-1) solid var(--gray-4);
		display: flex;
		flex-direction: column;
		margin-bottom: 0;
		max-width: 90vw;
		padding-top: var(--size-6);
	}

	.table-scroll {
		max-width: 100%;
		overflow-x: auto;
	}

	table {
		--nice-inner-radius: 0;

		background: unset;
		border: unset;
		border-radius: unset;
		border-spacing: 0;
		border-top: var(--border-size-1) solid var(--border-color);
		margin-bottom: var(--size-6);
		margin-top: var(--size-4);
		width: max-content;
	}

	thead th {
		border-bottom: var(--border-size-2) solid var(--border-color);
		border-start-start-radius: unset;
	}

	tr {
		font-size: var(--font-size-0);
	}

	tr th {
		vertical-align: top;
	}

	tr :not(th) {
		padding-block: var(--size-1);
	}

	th {
		white-space: wrap;
		text-align: left;
	}

	td {
		padding-block: var(--size-4);
		text-align: left;
	}

	td.number {
		text-align: right;
	}
</style>
