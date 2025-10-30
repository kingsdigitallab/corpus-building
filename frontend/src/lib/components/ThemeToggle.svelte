<script>
	import { browser } from '$app/environment';
	import { Button } from 'bits-ui';
	import { MoonIcon, SunIcon } from 'lucide-svelte';

	let theme = $state('light');

	if (browser) {
		const preference = window.matchMedia('(prefers-color-scheme: dark)');

		if (preference.matches) {
			theme = 'dark';
		}

		theme = localStorage.getItem('color-scheme') || theme;

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
		document.documentElement.setAttribute('data-color-scheme', theme);
		localStorage.setItem('color-scheme', theme);
	}

	function handleThemeToggle() {
		theme = theme === 'light' ? 'dark' : 'light';

		setTheme();
	}
</script>

<svelte:head>
	<script type="module">
		let theme = 'light';

		const preference = window.matchMedia('(prefers-color-scheme: dark)');

		if (preference.matches) {
			theme = 'dark';
		}

		theme = localStorage.getItem('color-scheme') || theme;

		document.documentElement.setAttribute('data-color-scheme', theme);
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

			/* ZL added new below (adding min-width & height to avoid getting to tiny)*/
			min-width: 44px;
			min-height: 44px;
			display: flex;
			align-items: center;
			justify-content: center;

			&:hover {
				background: var(--surface-4);
			}
		}

		/* ZL added new below (adjusting icon proportions inside the button)*/
		:global(button svg) {
			width: 80%;
			height: 80%;
		}
	}
</style>
