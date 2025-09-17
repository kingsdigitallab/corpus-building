<script>
	const { lettering } = $props();

	const typeOfObj = $derived(Array.isArray(lettering) ? 'array' : lettering?._ ? 'obj' : 'simple');
</script>

{#snippet typesDetails(refs)}
    <details>
		<summary>Types</summary>
		<ul>
			{#each refs as ref}
				<li><a href={ref.target}>{ref._}</a></li>
			{/each}
		</ul>
	</details>
{/snippet}

{#if typeOfObj === 'array'}
	{@const desc = lettering[0]}
	{@const types = lettering[1]}

	{#if typeof desc === 'object'}
        {#if desc.ref}
            <p>{desc._}</p>
        {:else}
		    <p>{desc._}</p>
        {/if}
	{:else}
		<p>{desc}</p>
	{/if}

    {@render typesDetails(types.ref)}
{:else if typeOfObj === 'obj'}
    {@render typesDetails(lettering.ref)}
{:else}
	<p>{lettering}</p>
{/if}
