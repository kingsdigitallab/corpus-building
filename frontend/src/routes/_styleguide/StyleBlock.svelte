<script>
	const { children } = $props();

	/**
	 * @param {HTMLElement} node
	 */
	function escapeHtml(node) {
		const content = node.innerHTML;
		node.textContent = content.replaceAll('<!---->', '').replaceAll(/\s?s-\w+\b/g, '').replaceAll(' class=""', '');

		return {
			update() {
				node.textContent = node.innerHTML;
			}
		};
	}
</script>

<div class="style-block">
	<div class="style-block-content">
		{@render children?.()}
	</div>

{#if children}
	<details>
		<summary>Code</summary>
		<pre class="surface-4"><code use:escapeHtml>{@render children?.()}</code></pre>
	</details>
{/if}
</div>

<style>
	:global(.style-block-content > *) {
		padding: var(--size-3);
		border-radius: var(--radius-1);
	}

    pre {
        border-radius: var(--radius-1);
        padding: var(--size-2);
    }

	code {
		font-family: var(--font-monospace);
		font-size: var(--font-size-0);
	}
</style>
