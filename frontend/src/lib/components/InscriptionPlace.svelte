<script>
	export let inscription;
</script>

<div class="inscription-place">
	{#if inscription.place.offset}<em>{inscription.place.offset}</em>{/if}
	{#if inscription.place.ref}
		<a href={inscription.place.ref}>{inscription.place._}</a>
	{:else}
		{inscription.place._}
	{/if}
</div>
