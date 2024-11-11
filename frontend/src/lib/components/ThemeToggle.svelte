<script>
	import { browser } from '$app/environment';
	import { Button } from 'bits-ui';
	import { MoonIcon, SunIcon } from 'lucide-svelte';

	let theme = $state((browser && localStorage.getItem('color-scheme')) || 'light');

	if (browser) {
		const preference = window.matchMedia('(prefers-color-scheme: dark)');

		if (preference.matches) {
			theme = 'dark';
		}

		setTheme();

		preference.addEventListener('change', (mediaQuery) => {
			if (mediaQuery.matches) {
				theme = 'dark';
			} else {
				theme = 'light';
			}

			setTheme();
		});
	}

	function setTheme() {
		document.documentElement.setAttribute('color-scheme', theme);
		localStorage.setItem('color-scheme', theme);
	}

	function handleThemeToggle() {
		theme = theme === 'light' ? 'dark' : 'light';

		setTheme();
	}
</script>

<svelte:head>
	<script type="module">
		let theme = localStorage.getItem('color-scheme') || 'light';
		const preference = window.matchMedia('(prefers-color-scheme: dark)');

		if (preference.matches) {
			theme = 'dark';
		}

		document.documentElement.setAttribute('color-scheme', theme);
		localStorage.setItem('color-scheme', theme);
	</script>
</svelte:head>

<div class="theme-toggle">
	<Button.Root onclick={handleThemeToggle} aria-label="Toggle colour scheme">
		{#if theme === 'light'}
			<MoonIcon />
		{:else}
			<SunIcon />
		{/if}
	</Button.Root>
</div>

<style>
	.theme-toggle {
		:global(button) {
			aspect-ratio: var(--ratio-square);
			background: none;
			border: none;
			box-shadow: none;
			font-weight: inherit;
			text-shadow: none;

			&:hover {
				background: var(--surface-4);
			}
		}
	}
</style>
