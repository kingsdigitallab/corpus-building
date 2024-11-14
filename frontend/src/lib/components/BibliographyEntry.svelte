<script>
	/** @type {{
		entry: {
			type?: string;
			n?: string;
			author?: string;
			date?: string;
			citedRange?: {
				ref?: { _: string; target: string };
			} | string;
			ptr?: { target: string };
			ref?: { target: string };
		};
	}} */
	let { entry } = $props();
</script>

{#if entry.type === 'bulletin' || entry.type === 'corpus'}
	<span>{entry.n} {entry.author ? `${entry.author} (${entry.date})` : ''}</span>
{:else}
	<span>{entry.author} ({entry.date})</span>
{/if}
{#if typeof entry.citedRange === 'object' && entry.citedRange?.ref}
	<a href={entry.citedRange.ref.target}>{entry.citedRange.ref._}</a>
{:else if entry.citedRange}
	<span>{entry.citedRange}</span>
{/if}
{#if entry.ptr?.target}
	<a href={entry.ptr?.target}>Zotero</a>
{/if}
{#if entry.ref?.target}
	<a href={entry.ref.target}>FAIR</a>
{/if}
