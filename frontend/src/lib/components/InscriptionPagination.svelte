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
	<Pagination.Root {page} {count} {perPage} {onPageChange}>
		{#snippet children({ pages, range })}
				<div class="pagination">
				<Pagination.PrevButton aria-label="Previous page"><ChevronLeft /></Pagination.PrevButton>
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
				<Pagination.NextButton aria-label="Next page"><ChevronRight /></Pagination.NextButton>
			</div>
			<p>
				Showing {range.start + 1} - {range.end}
			</p>
		{/snippet}
	</Pagination.Root>
{/if}

<style>
	:global([data-pagination-root]) {
		margin-block-start: var(--size-8);
		margin-block-end: var(--size-4);
	}

	:global([data-selected]) {
		background: var(--surface-1) !important;
		border: var(--border-size-1) solid var(--border-color) !important;
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
		justify-content: center;

		:global(button),
		:global(a) {
			background: none;
			border: none;
			box-shadow: none;
			font-weight: inherit;
			text-shadow: none;

			min-width: 44px;
		    min-height: 44px;
		    display: inline-flex;
		    align-items: center;
		    justify-content: center;
		    border-radius: var(--radius-2);

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
		max-inline-size: unset;
	}
</style>
