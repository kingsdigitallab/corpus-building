<script>
	let { inscription } = $props();

	let places = $derived(inscription?.places?.slice(0, 2));
</script>

<div class="inscription-place">
	{#each places as place}
		{#if place}
			<span
				>{#if place.offset}<em>{place.offset}</em>{/if}
				{#if place.ref}
					<a href={place.ref}>{place._}</a>
				{:else}
					{place._}
				{/if}
				({place.type})</span
			>
		{/if}
	{/each}
</div>

<style>
	span + span::before {
		content: ', ';
	}
</style>
