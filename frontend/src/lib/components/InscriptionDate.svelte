<script>
	let { date } = $props();

	let dates = [];

	for (const key of ['notBefore', 'notAfter']) {
		if (date[key]) {
			if (date[key] < 0) {
				dates.push(`${Math.abs(date[key])} BC`);
			} else {
				dates.push(`AD ${date[key]}`);
			}
		} else {
			dates.push('Unknown');
		}
	}

	let dateString = $derived(dates.join(' – '));
</script>

<span class="inscription-date">{dateString}</span>
