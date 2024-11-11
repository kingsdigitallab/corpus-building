<script>
	import { Pagination } from 'bits-ui';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	let {
		page,
		count,
		perPage,
		onPageChange
	} = $props();
</script>

{#if count > 0}
	<Pagination.Root {page} {count} {perPage} {onPageChange}  >
		{#snippet children({ pages, range })}
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
					{/snippet}
		</Pagination.Root>
{/if}

<style>
	:global([data-pagination-root]) {
		margin-block: var(--size-2);
	}

	:global([data-selected]) {
		background: var(--surface-4) !important;
		color: var(--text-1);
	}

	.pagination {
		margin-block: var(--size-2);
	}

	.pagination,
	.pages {
		align-items: center;
		display: flex;
		gap: var(--size-2);
		height: 100%;
		justify-content: center;

		:global(button) {
			background: none;
			border: none;
			box-shadow: none;
			font-weight: inherit;
			height: 100%;
			text-shadow: none;

			&:hover {
				background: var(--surface-4);
			}
		}
	}

	p {
		color: var(--text-1);
		text-align: center;
		font-size: var(--font-size-0);
		margin-block: var(--size-2);
	}
</style>
