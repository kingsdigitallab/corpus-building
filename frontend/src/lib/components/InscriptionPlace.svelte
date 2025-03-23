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
						<a class="strong" href={place.ref}>{place._}</a>
					{:else}
						<span class="strong">{place._}</span>
					{/if}
					({place.type})
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
</style>
