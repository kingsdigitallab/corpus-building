<script>
	import { Pagination } from 'bits-ui';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	export let page;
	export let count;
	export let perPage;
	export let onPageChange;
</script>

{#if count > 0}
	<Pagination.Root {page} {count} {perPage} {onPageChange} let:pages let:range>
		<div class="pagination">
			<Pagination.PrevButton><ChevronLeft /></Pagination.PrevButton>
			<div class="pages">
				{#each pages as page (page.key)}
					{#if page.type === 'ellipsis'}
						<span>...</span>
					{:else}
						<Pagination.Page {page}>
							{page.value}
						</Pagination.Page>
					{/if}
				{/each}
			</div>
			<Pagination.NextButton><ChevronRight /></Pagination.NextButton>
		</div>
		<p>
			Showing {range.start + 1} - {range.end}
		</p>
	</Pagination.Root>
{/if}

<style>
	.pagination {
		margin-block: var(--size-4);
	}

	.pagination,
	.pages {
		align-items: center;
		display: flex;
		gap: var(--size-2);
		justify-content: center;

		& button {
			background: none;
			border: none;
			box-shadow: none;
			height: var(--size-8);
			text-shadow: none;

			&:hover {
				background: var(--surface-3);
			}
		}
	}

	p {
		color: var(--gray-8);
		text-align: center;
		font-size: var(--font-size-0);
		margin-block: var(--size-2);
	}
</style>
