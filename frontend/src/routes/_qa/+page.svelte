<script>
	import BaseLink from '$lib/components/BaseLink.svelte';

	/** @type {import('./$types').PageData} */
	export let data;
</script>

<article>
	<h1>QA</h1>

	{#if data.prerender}
		<section id="qa">
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
	{/if}

	{#if Object.keys(data.axe).length > 0}
		<section id="axe">
			<h2>Accessibility issues</h2>
			{#each Object.keys(data.axe) as page}
				<hgroup>
					<h3><BaseLink href={page}>{page}</BaseLink></h3>
					<p><strong>{data.axe[page].length}</strong> accessibility issues found!</p>
				</hgroup>
				<table>
					<thead>
						<tr>
							<th>ID</th>
							<th>Impact</th>
							<th>Description</th>
							<th>Target</th>
							<th>Help</th>
						</tr>
					</thead>
					<tbody>
						{#each data.axe[page] as violation}
							<tr>
								<td>{violation.id}</td>
								<td>{violation.impact}</td>
								<td>{violation.description}</td>
								<td>{violation.nodes[0].target}</td>
								<td><a href={violation.helpUrl}>{violation.help}</a></td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/each}
		</section>
	{/if}
</article>
