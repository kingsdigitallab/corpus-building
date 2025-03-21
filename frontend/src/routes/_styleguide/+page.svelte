<script>
	const surfaces = ['surface-1', 'surface-2', 'surface-3', 'surface-4'];
	const themes = ['light', 'dark'];
</script>

<div class="style-guide">
	<h1>Style Guide</h1>

	<div class="theme-columns">
		{#each themes as theme}
			<div class="theme-column surface-1" data-color-scheme={theme}>
				<h2>{theme.charAt(0).toUpperCase() + theme.slice(1)} theme</h2>

				<section class="component-section">
					<h3>Surfaces</h3>
					<div class="component-grid">
						<div class="surface-1">Surface 1</div>
						<div class="surface-2">Surface 2</div>
						<div class="surface-3">Surface 3</div>
						<div class="surface-4">Surface 4</div>
					</div>
				</section>

				<section class="component-section">
					<h3>Text colours</h3>
					<div class="component-grid">
						<div class="text-1">Text 1</div>
						<div class="text-2 surface-4">Text 2 on surface 4</div>
					</div>
				</section>

				<section class="component-section">
					<h3>Typography</h3>
					<div class="component-grid">
						<div class="font-default">Default font</div>
						<div class="font-greek surface-2">Greek font on surface 2</div>
					</div>
				</section>

				<section class="component-section">
					<h3>Links</h3>
					<div class="component-grid">
						<div><a href="#">Default link</a></div>
						<div><a class="strong" href="#">Strong link</a></div>
					</div>
				</section>

				<section class="component-section">
					<h3>Badges</h3>
					<div class="component-grid">
						<div class="badge">Default badge</div>
						<div class="badge strong">Strong badge</div>
						<a href="#" class="badge">Link badge</a>
						<a href="#" class="badge strong">Strong link badge</a>
					</div>
				</section>

				<section class="component-section">
					<h3>Buttons</h3>
					<div class="component-grid">
						<div><button class="surface-1">Surface 1</button></div>
						<div><button class="surface-2">Surface 2</button></div>
						<div><button class="surface-3">Surface 3</button></div>
						<div><button class="surface-4">Surface 4</button></div>
					</div>
				</section>

				<section class="component-section">
					<h3>Slider</h3>
					<div class="component-grid">
						<div class="slider">
							<div class="slider-root">
								<div class="slider-track">
									<div class="slider-range" style="width: 50%"></div>
								</div>
								<div class="slider-thumb" style="left: 50%"></div>
							</div>
						</div>
					</div>
				</section>

				<!-- Add more component sections as needed -->
			</div>
		{/each}
	</div>
</div>

<style>
	.theme-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--size-4);
		margin-block: var(--size-4);
	}

	.theme-column {
		padding: var(--size-4);
		background-color: var(--surface-1);
	}

	.component-section {
		margin-block: var(--size-4);
	}

	.component-grid {
		display: grid;
		gap: var(--size-3);
	}

	.component-grid > div {
		padding: var(--size-3);
		border-radius: var(--radius-1);
	}

	@media (max-width: 768px) {
		.theme-columns {
			grid-template-columns: 1fr;
		}
	}
</style>
