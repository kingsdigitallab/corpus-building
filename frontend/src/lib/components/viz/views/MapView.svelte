<script>
	import InscriptionMap from '../charts/InscriptionMap.svelte';

	/**
	 * @type {{
	 *   inscriptions: any[]
	 * }}
	 */
	let { inscriptions } = $props();
</script>

<section class="viz-summary">
	<hgroup>
		<h3>Map</h3>
		<p>Geographical distribution of inscriptions.</p>
	</hgroup>
</section>

<section class="viz-container">
	<InscriptionMap {inscriptions} />
</section>

<style>
	.viz-summary {
		border-top: var(--border-size-1) solid var(--gray-4);
		padding-top: var(--size-4);
		margin-bottom: 0;
		margin-top: var(--size-4);
	}

	.viz-summary hgroup p {
		max-inline-size: unset;
	}

	.viz-container {
		display: flex;
		gap: var(--size-8);
		justify-content: space-between;
		margin-top: 0;
		max-width: 100%;
		padding-top: var(--size-10);
	}
</style>
