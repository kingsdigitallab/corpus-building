<script>
	const { tag = 'div', classes = '', children, ...rest } = $props();

	const displayClasses = $derived(
		classes
			.split(' ')
			.filter((c) => c !== 'show-class')
			.join(' ')
	);
</script>

<svelte:element
    this={tag}
    class="{classes} style-block"
    data-classes={displayClasses}
    {...rest}
>
    {@render children?.()}
</svelte:element>

<style>
	.style-block {
		padding: var(--size-3);
		border-radius: var(--radius-1);
	}

	.style-block::after {
		content: attr(data-classes);
		display: block;
		font-family: var(--font-monospace-code);
		font-size: var(--font-size-0);
		margin-top: var(--size-2);
		opacity: 0.7;
	}
</style>
