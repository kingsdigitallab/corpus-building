<script>
	export let inscription;

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

	$: date = dates.join(' – ');
</script>

<div class="inscription-date">{date}</div>
