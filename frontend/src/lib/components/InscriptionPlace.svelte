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
						<a href={place.ref}>{place._}</a>
					{:else}
						{place._}
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

	a {
		color: var(--text-1) !important;
		font-weight: bold;
	}
</style>
