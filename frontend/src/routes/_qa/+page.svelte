<script>
	import BaseLink from '$lib/components/BaseLink.svelte';
	import { Button } from 'bits-ui';

	/**
	 * @typedef {Object} Props
	 * @property {import('./$types').PageData} data
	 */

	/** @type {Props} */
	let { data } = $props();

	/**
	 * @param {string} text
	 */
	function copyTargetToClipboard(event, text) {
		event.preventDefault;
		navigator.clipboard.writeText(`inspect($$("${text}")[0])`);
		alert('Copied to clipboard!');
	}
</script>

<article>
	<h1>QA</h1>

	{#if Object.keys(data.axe).length > 0}
		<section id="axe">
			<h2>Accessibility issues</h2>
			{#each Object.keys(data.axe) as page}
				<h3>
					<BaseLink href={page}>{page}</BaseLink>
					<small>{data.axe[page].length.toLocaleString()} accessibility issues found!</small>
				</h3>
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
								<td>
									<Button.Root
										class="copy-to-clipboard"
										onclick={(event) => copyTargetToClipboard(event, violation.nodes[0].target)}
									>
										{violation.nodes[0].target}
									</Button.Root>
								</td>
								<td><a href={violation.helpUrl}>{violation.help}</a></td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/each}
		</section>
	{/if}

	{#if data.prerender}
		<section id="qa">
			<hgroup>
				<h2>Build errors</h2>
				<h3><small>{data.prerender.length} build errors found!</small></h3>
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
</article>

<style>
	table {
		width: 100%;
	}

	:global(.copy-to-clipboard) {
		background: none;
		border: none;
		cursor: copy;
		padding: 0;
		text-decoration: underline;
	}
</style>
