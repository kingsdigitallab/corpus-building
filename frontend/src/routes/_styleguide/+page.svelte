<script>
	import StyleBlock from './StyleBlock.svelte';
	const themes = ['light', 'dark'];
</script>

<svelte:head>
	{#each themes as theme}
		<style>
			[data-color-scheme='{theme}'] .show-class {
				--class-names: attr(class);
			}
		</style>
	{/each}
</svelte:head>

<article class="style-guide">
	<h1>Style Guide</h1>

	<div class="theme-columns">
		{#each themes as theme}
			<section class="theme-column surface-1" data-color-scheme={theme}>
				<h2 class="brand">{theme.charAt(0).toUpperCase() + theme.slice(1)} theme</h2>

				<section class="component-section">
					<h3>Surfaces</h3>
					<div class="component-grid">
						<StyleBlock classes="surface-1">Surface 1</StyleBlock>
						<StyleBlock classes="surface-2">Surface 2</StyleBlock>
						<StyleBlock classes="surface-3">Surface 3</StyleBlock>
						<StyleBlock classes="surface-4">Surface 4</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Text colours</h3>
					<div class="component-grid">
						<StyleBlock classes="text-1">Text 1</StyleBlock>
						<StyleBlock classes="text-2 surface-2">Text 2 on surface 2</StyleBlock>
						<StyleBlock classes="text-2 surface-4">Text 2 on surface 4</StyleBlock>
						<StyleBlock classes="text-3 surface-3">Text 3 on surface 3</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Typography</h3>
					<div class="component-grid">
						<StyleBlock classes="font-default">
							Optima, Candara, Noto Sans, source-sans-pro, sans-serif;
						</StyleBlock>
						<StyleBlock classes="font-greek surface-2">
							Superclarendon, Bookman Old Style, URW Bookman, URW Bookman L, Georgia Pro, Georgia,
							serif;
						</StyleBlock>
						<div>
							<h1>Heading 1</h1>
							<h2>Heading 2</h2>
							<h3>Heading 3</h3>
							<h4>Heading 4</h4>
							<h5>Heading 5</h5>
							<h6>Heading 6</h6>
							<p>Paragraph</p>
							<strong>Strong</strong>
							<br />
							<em>Emphasis</em>
						</div>
					</div>
				</section>

				<section class="component-section">
					<h3 id="links">Links</h3>
					<div class="component-grid">
						<StyleBlock><a href="#links">Default link</a></StyleBlock>
						<StyleBlock><a class="strong" href="#links">Strong link</a></StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3 id="badges">Badges</h3>
					<div class="component-grid">
						<StyleBlock classes="badge">Default badge</StyleBlock>
						<StyleBlock classes="badge strong">Strong badge</StyleBlock>
						<StyleBlock tag="a" classes="badge" href="#badges">Link badge</StyleBlock>
						<StyleBlock tag="a" classes="badge strong" href="#badges">Strong link badge</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Buttons</h3>
					<div class="component-grid">
						<StyleBlock tag="button" classes="surface-1">Surface 1</StyleBlock>
						<StyleBlock tag="button" classes="surface-2">Surface 2</StyleBlock>
						<StyleBlock tag="button" classes="surface-3">Surface 3</StyleBlock>
						<StyleBlock tag="button" classes="surface-4">Surface 4</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Slider</h3>
					<div class="component-grid">
						<StyleBlock classes="slider">
							<div class="slider-root">
								<div class="slider-track">
									<div class="slider-range" style="width: 50%"></div>
								</div>
								<div class="slider-thumb" style="left: 50%"></div>
							</div>
						</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Inputs</h3>
					<div class="component-grid">
						<div>
							<label>
								<span>Label</span>
								<input type="text" />
							</label>
						</div>
						<div>
							<label>
								<span>Label</span>
								<select>
									<option value="1">Option 1</option>
									<option value="2">Option 2</option>
									<option value="3">Option 3</option>
								</select>
							</label>
						</div>
					</div>
				</section>
			</section>
		{/each}
	</div>
</article>

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

	.show-class::after {
		content: var(--class-names);
		display: block;
		font-family: var(--font-monospace-code);
		font-size: var(--font-size-0);
		margin-top: var(--size-2);
		opacity: 0.7;
	}
</style>
