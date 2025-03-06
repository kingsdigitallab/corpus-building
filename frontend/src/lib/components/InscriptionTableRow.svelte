<script>
	import InscriptionDate from './InscriptionDate.svelte';
	import InscriptionLink from './InscriptionLink.svelte';
	import InscriptionPlace from './InscriptionPlace.svelte';

	let { inscription } = $props();
</script>

<tr>
	<td class="strong">
		<InscriptionLink id={inscription.file}>{inscription.file}</InscriptionLink>
	</td>
	<td class="strong">
		<InscriptionLink id={inscription.file}>{inscription.title}</InscriptionLink>
	</td>
	<td><InscriptionDate date={inscription.date} /></td>
	<td><InscriptionPlace {inscription} /></td>
	<td>{inscription.status}</td>
	<td>
		{#if inscription.type?.ref}
			<a class="badge" href={inscription.type.ref}>{inscription.type?._}</a>
		{:else}
			{inscription.type?._ || 'N/A'}
		{/if}
	</td>
	<td>
		{#if inscription.rawObjectType?.ref}
			<a class="badge" href={inscription.rawObjectType.ref}>{inscription.rawObjectType?._}</a>
		{:else}
			{inscription.rawObjectType?._ || 'N/A'}
		{/if}
	</td>
	<td>{inscription.textLang?._ || 'N/A'}</td>
	<td>{inscription.settlement || 'N/A'}</td>
</tr>

<style>
	tr {
		font-size: var(--font-size-0);
		vertical-align: top;
		padding-block: var(--size-1);
	}

	tr:hover {
		font-weight: 600;
	}

	td {
		padding-block: var(--size-4);
		text-align: left;
	}

	td:has(.badge)::first-letter {
		text-transform: capitalize;
	}

	:global(td a, td a:visited) {
		color: var(--text-1);
	}

	:global(td .inscription-date),
	:global(td .inscription-place li) {
		font-size: var(--font-size-0);
	}
</style>
