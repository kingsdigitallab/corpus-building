<script>
	export let inscription;

	const mainPlace = inscription.places[0];
	const otherPlace = inscription.places[1];
</script>

<div class="inscription-place">
	{#each [mainPlace, otherPlace] as place}
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
