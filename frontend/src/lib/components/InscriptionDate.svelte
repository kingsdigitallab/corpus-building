<script>
	let { date } = $props();

	function getDateString() {
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

		return dates.join(' - ');
	}

	let dateString = $derived(getDateString());
</script>

<span class="inscription-date">{dateString}</span>
