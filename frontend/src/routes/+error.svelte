<script>
	import { page } from '$app/stores';
</script>

<h1>{$page.status}: {$page.error?.message}</h1>
<p>Error loading the page {$page.url.pathname}.</p>
