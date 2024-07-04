<script>
	import BaseLink from '$lib/components/BaseLink.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<article>
	<h1>QA</h1>

	<section>
		<hgroup>
			<h2>Build errors</h2>
			<p><strong>{data.prerender.length}</strong> build errors found!</p>
		</hgroup>
		<table>
			<thead>
				<tr>
					<th>Timestamp</th>
					<th>Path</th>
					<th>Referrer</th>
					<th>Message</th>
				</tr>
			</thead>
			<tbody>
				{#each data.prerender as error}
					<tr>
						<td>{error.timestamp}</td>
						<td>{error.path}</td>
						<td><BaseLink href={error.referrer}>{error.referrer}</BaseLink></td>
						<td>{error.message}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</article>
