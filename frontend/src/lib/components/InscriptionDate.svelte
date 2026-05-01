<script>
	import { formatInscriptionDate } from '$lib/utils/format';

	let { date } = $props();
	let dateString = $derived(formatInscriptionDate(date));
</script>

<span class="inscription-date">{dateString}</span>
