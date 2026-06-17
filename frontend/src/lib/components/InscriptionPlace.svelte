<script>
	let { inscription } = $props();

	let places = $derived(inscription?.places?.slice(0, 2));
</script>

<div class="inscription-place">
	<ul>
		{#each places as place}
			<li class="badge">
				{#if place}
					{#if place.offset}<em>{place.offset}</em>{/if}
					{#if place.ref}
						<a class="strong" href={place.ref} title={place._}>
							{place._} ({place.type})
						</a>
					{:else}
						<span class="strong" title={place._}>
							{place._} ({place.type})
						</span>
					{/if}
				{/if}
			</li>
		{/each}
	</ul>
</div>

<style>
	ul {
		display: inline-flex;
		gap: var(--size-2);
		list-style: none;
		padding: 0;
		margin: 0;
	}
	/**ZL: changed the focus ring size - covering the entire badge*/
	li.badge:focus-within {
		outline: 2px solid var(--yellow-3);
		outline-offset: 4px;
	}

	li.badge a:focus {
		outline: none;
	}
</style>
