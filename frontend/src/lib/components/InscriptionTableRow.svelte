<script>
	import InscriptionDate from './InscriptionDate.svelte';
	import InscriptionLink from './InscriptionLink.svelte';
	import InscriptionPlace from './InscriptionPlace.svelte';

	export let inscription;
</script>

<tr>
	<td><InscriptionLink id={inscription.file}>{inscription.file}</InscriptionLink></td>
	<td><InscriptionLink id={inscription.file}>{inscription.title}</InscriptionLink></td>
	<td><InscriptionDate {inscription} /></td>
	<td><InscriptionPlace {inscription} /></td>
	<td>{inscription.status}</td>
	{#if inscription.type.ref}
		<td><a href={inscription.type.ref}>{inscription.type?._}</a></td>
	{:else}
		<td>{inscription.type?._ || 'N/A'}</td>
	{/if}
	<td>{inscription.textLang?._ || 'N/A'}</td>
</tr>
