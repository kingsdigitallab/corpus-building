<script>
	let { material } = $props();
</script>

<span class="inscription-material">
	{#if material}
		{#if Array.isArray(material)}
			{material.slice(-1)[0].split(':::').slice(-1)[0]}
		{:else if material?._}
			{material._}
		{/if}
	{:else}'N/A'
	{/if}
</span>
