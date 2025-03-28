<script>
	import StyleBlock from './StyleBlock.svelte';

	const themes = ['light', 'dark'];
</script>

<article class="style-guide">
	<h1>Style Guide</h1>

	<div class="theme-columns">
		{#each themes as theme}
			<section class="theme-column surface-1" data-color-scheme={theme}>
				<h2 class="brand">{theme.charAt(0).toUpperCase() + theme.slice(1)} theme</h2>

				<section class="component-section">
					<h3>Surfaces</h3>
					<div class="component-grid">
						<StyleBlock>
							<div class="surface-1">Surface 1</div>
						</StyleBlock>
						<StyleBlock>
							<div class="surface-2">Surface 2</div>
						</StyleBlock>
						<StyleBlock>
							<div class="surface-3">Surface 3</div>
						</StyleBlock>
						<StyleBlock>
							<div class="surface-4">Surface 4</div>
						</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Text colours</h3>
					<div class="component-grid">
						<StyleBlock><div class="text-1">Text 1</div></StyleBlock>
						<StyleBlock><div class="text-2 surface-2">Text 2 on surface 2</div></StyleBlock>
						<StyleBlock><div class="text-2 surface-4">Text 2 on surface 4</div></StyleBlock>
						<StyleBlock><div class="text-3 surface-3">Text 3 on surface 3</div></StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Typography</h3>
					<div class="component-grid">
						<StyleBlock>
							<div class="font-default">
								<h4>Default font</h4>
								Optima, Candara, Noto Sans, source-sans-pro, sans-serif
							</div>
						</StyleBlock>
						<StyleBlock>
							<div class="font-greek">
								<h4>Greek font/edition font</h4>
								source-sans-pro, Superclarendon, Bookman Old Style, URW Bookman, URW Bookman L, Georgia
								Pro, Georgia, serif
							</div>
						</StyleBlock>
						<StyleBlock>
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
						</StyleBlock>
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
						<StyleBlock>
							<div class="badge">Default badge</div>
						</StyleBlock>
						<StyleBlock>
							<div class="badge strong">Strong badge</div>
						</StyleBlock>
						<StyleBlock>
							<a class="badge" href="#badges">Link badge</a>
						</StyleBlock>
						<StyleBlock>
							<a class="badge strong" href="#badges">Strong link badge</a>
						</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Buttons</h3>
					<div class="component-grid">
						<StyleBlock>
							<div>
								<button class="surface-1">Surface 1</button>
							</div>
						</StyleBlock>
						<StyleBlock>
							<div>
								<button class="surface-2">Surface 2</button>
							</div>
						</StyleBlock>
						<StyleBlock>
							<div>
								<button class="surface-3">Surface 3</button>
							</div>
						</StyleBlock>
						<StyleBlock>
							<div>
								<button class="surface-4">Surface 4</button>
							</div>
						</StyleBlock>
						<StyleBlock>
							<div>
								<a role="button">Link as button</a>
							</div>
						</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Slider</h3>
					<div class="component-grid">
						<StyleBlock>
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
						<StyleBlock>
							<div>
								<label>
									<span>Label</span>
									<input type="text" />
								</label>
							</div>
						</StyleBlock>
						<StyleBlock>
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
						</StyleBlock>
					</div>
				</section>

				<section class="component-section">
					<h3>Edition</h3>
					<div class="component-grid">
						<StyleBlock>
							<div class="surface-4 font-greek">
								<div>1 line 1</div>
								<div>2 line 2</div>
								<div>3 line 3</div>
							</div>
						</StyleBlock>
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
		border-bottom: 1px solid var(--border-color);
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
