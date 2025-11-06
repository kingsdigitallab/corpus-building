<script>
	import { Tooltip } from 'bits-ui';
	import { InfoIcon } from 'lucide-svelte';

	let { delayDuration = 100, sideOffset = 0, children } = $props();
</script>

<Tooltip.Provider>
	<Tooltip.Root {delayDuration}>
		<Tooltip.Trigger class="tooltip-trigger">
			<InfoIcon />
		</Tooltip.Trigger>
		<Tooltip.Content {sideOffset}>
			<div class="tooltip-inner">{@render children?.()}</div>
		</Tooltip.Content>
	</Tooltip.Root>
</Tooltip.Provider>

<style>
	:global(.tooltip-trigger) {
		align-items: center;
		border: none;
		display: inline-flex;
		justify-content: center;
	}

	:global(.tooltip-trigger:focus-visible) {
		outline: none;
	}

	.tooltip-inner {
		align-items: center;
		background-color: var(--surface-1);
		border-color: var(--border-color);
		border-radius: var(--radius-1);
		border-width: var(--border-size-1);
		box-sizing: border-box; /* ZL added */
		padding: var(--size-2) var(--size-3);
		display: block; /* ZL changed from flex to block */
		text-align: left; /* ZL added */
		line-height: 1.4; /* ZL added */
		overflow-wrap: anywhere; /* ZL added */
		word-break: break-word; /* ZL added */
		font-size: var(--font-size-0);
		font-weight: var(--font-weight-5);
		justify-content: center;
		white-space: normal; /* ZL added */
		max-width: 320px; /* ZL changed from 50% to 320px */
		padding-block: var(--size-1);
		padding-inline: var(--size-2);
		z-index: 1000;
	}

</style>
