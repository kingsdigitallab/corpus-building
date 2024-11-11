<script>
	import InscriptionDate from './InscriptionDate.svelte';
	import InscriptionLink from './InscriptionLink.svelte';
	import InscriptionPlace from './InscriptionPlace.svelte';

	let { inscription } = $props();
</script>

<tr>
	<td><InscriptionLink id={inscription.file}>{inscription.file}</InscriptionLink></td>
	<td><InscriptionLink id={inscription.file}>{inscription.title}</InscriptionLink></td>
	<td><InscriptionDate {inscription} /></td>
	<td><InscriptionPlace {inscription} /></td>
	<td>{inscription.status}</td>
	<td>
		{#if inscription.type.ref}
			<a href={inscription.type.ref}>{inscription.type?._}</a>
		{:else}
			{inscription.type?._ || 'N/A'}
		{/if}
	</td>
	<td>
		{#if inscription.objectType?.ref}
			<a href={inscription.objectType.ref}>{inscription.objectType?._}</a>
		{:else}
			{inscription.objectType?._ || 'N/A'}
		{/if}
	</td>
	<td>{inscription.textLang?._ || 'N/A'}</td>
	<td>{inscription.settlement || 'N/A'}</td>
</tr>
