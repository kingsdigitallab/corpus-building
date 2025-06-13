<script>
	import { base } from '$app/paths';
	import * as config from '$lib/config';
	import { footer } from '$lib/footer';
	import BaseLink from '$lib/components/BaseLink.svelte';

	const version = import.meta.env.APP_VERSION;
</script>

<footer>
	<section class="footer-links">
		{#each footer.links as section}
			<div class="footer-link-section">
				<h3>{section.title}</h3>
				<ul>
					{#each section.links as link}
						<li class={link.class || ''}>
							{#if link.href}
								{#if link.href.startsWith('http') || link.href.startsWith('mailto')}
									<a href={link.href}>{link.title}</a>
								{:else}
									<BaseLink href={link.href}>{link.title}</BaseLink>
								{/if}
							{:else}
								{link.title}
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</section>
	<section class="footer-logos">
		<ul>
			{#each footer.logos as logo}
				<li>
					{#if logo.href}
						<a href={logo.href}>
							<img src={`${base}${logo.img}`} alt={logo.title} width={logo.width || 75} />
						</a>
					{:else}
						<img src={`${base}${logo.img}`} alt={logo.title} width={logo.width || 75} />
					{/if}
				</li>
			{/each}
		</ul>
	</section>
	<section class="footer-bottom">
		<ul>
			<li>
				<BaseLink href="/">{config.title}</BaseLink>
			</li>
			<li class="kdl">
				Design, developed and maintained by <a href="https://kdl.kcl.ac.uk/">King's Digital Lab</a>
			</li>
			<li>
				<a
					class="version"
					href="https://github.com/kingsdigitallab/corpus-building/blob/v{version}/CHANGELOG.md"
					>v{version}</a
				>
			</li>
		</ul>
	</section>
</footer>

<style>
	footer {
		border-top: var(--border-size-1) solid var(--border-color);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.footer-links {
		display: flex;
		gap: var(--size-6);
		justify-content: space-around;
		margin-block: 0;
		padding-block-end: var(--size-4);
		padding-block-start: var(--size-10);
	}

	@media (max-width: 768px) {
		.footer-links {
			align-items: center;
			flex-direction: column;
			gap: var(--size-4);
		}
	}

	.footer-link-section {
		padding-inline: var(--size-6);
	}

	@media (max-width: 768px) {
		.footer-link-section {
			text-align: center;
		}
	}

	.footer-link-section h3 {
		font-size: var(--font-size-2);
		font-weight: 600;
		margin-block-end: var(--size-6);
	}

	.footer-logos {
		border-top: var(--border-size-1) solid var(--border-color);
		border-bottom: var(--border-size-1) solid var(--border-color);
		margin-block: 0;
		padding-block: var(--size-6);
	}

	.footer-logos ul {
		align-items: center;
		display: flex;
		justify-content: space-between;
		gap: var(--size-6);
	}

	@media (max-width: 768px) {
		.footer-logos ul {
			gap: var(--size-4);
			flex-wrap: wrap;
			justify-content: center;
			max-width: 50%;
			margin: 0 auto;
		}
	}

	ul,
	li {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li.small {
		font-size: var(--font-size-0);
	}
	li.spacer {
		margin-block-start: var(--size-10);
	}

	@media (max-width: 768px) {
		li.spacer {
			margin-block-start: var(--size-2);
		}
	}

	.footer-bottom ul {
		display: flex;
		font-size: var(--font-size-0);
		justify-content: space-between;
		gap: var(--size-6);
	}

	@media (max-width: 768px) {
		.footer-bottom ul {
			align-items: center;
			flex-direction: column;
			gap: var(--size-4);
		}
	}

	.kdl a {
		text-decoration: underline;
	}
</style>
