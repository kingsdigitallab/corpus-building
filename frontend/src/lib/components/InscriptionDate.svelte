<script>
	let { inscription } = $props();

	let dates = [];

	for (const key of ['notBefore', 'notAfter']) {
		if (inscription[key]) {
			if (inscription[key] < 0) {
				dates.push(`${Math.abs(inscription[key])} BC`);
			} else {
				dates.push(`AD ${inscription[key]}`);
			}
		} else {
			dates.push('Unknown');
		}
	}

	let date = $derived(dates.join(' – '));
</script>

<span class="inscription-date">{date}</span>
