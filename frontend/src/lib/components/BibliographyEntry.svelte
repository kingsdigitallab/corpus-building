<script>
	import { base } from '$app/paths';

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
			title?: string;
			citation?: string;
		};
	}} */
	const { entry } = $props();
</script>

{#if entry.citation}
	{#if entry.ptr?.target}
		<a href={`${base}/bibliography/${entry.ptr.target.split('/').at(-1)}`}>{@html entry.citation}</a
		>{#if entry.citedRange},{:else}.{/if}
	{:else}
		{@html entry.citation}{#if entry.citedRange},{:else}.{/if}
	{/if}
{:else if entry.type === 'bulletin' || entry.type === 'corpus'}
	<span>{entry.n} {entry.author ? `${entry.author} (${entry.date})` : ''}</span>
{:else}
	<span>{entry.author} ({entry.date})</span>
{/if}
{#if typeof entry.citedRange === 'object' && entry.citedRange?.ref}
	at <a href={entry.citedRange.ref.target}>{entry.citedRange.ref._}</a>
{:else if entry.citedRange}
	at <span>{entry.citedRange}</span>
{/if}
