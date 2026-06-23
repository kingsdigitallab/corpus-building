<script>
	import { EMPTY_PLACEHOLDER } from '$lib/config';

	let { 
		inscription,
		aClass = 'badge strong',
		showCertainty = false
	} = $props();

	// Whether inscription.type is a single element {} or an array,
	// inscriptionTypes will always be an array.
	let inscriptionTypes = $derived(inscription?.type ? (Array.isArray(inscription.type) ? inscription.type : [inscription.type]) : []);
</script>

{#if inscriptionTypes.length}
	{#each inscriptionTypes as inscType, inscIdx}
		{@const inscTypeLabel = inscType?._ || EMPTY_PLACEHOLDER}
		{#if inscType?.ref}
			<a class={aClass} href={inscType.ref}>{inscTypeLabel}</a>
		{:else}
			{inscTypeLabel}
		{/if}
		{#if inscType?.certainty && showCertainty}
			<span class="badge">{inscType.certainty.desc}</span>
		{/if}
	{/each}
{:else}
	{EMPTY_PLACEHOLDER}
{/if}
