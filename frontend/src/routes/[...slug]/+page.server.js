import { error } from '@sveltejs/kit';
import { render } from 'svelte/server';

const pages = import.meta.glob('../../pages/**/*.md', { eager: true });

/** @type {import('./$types').PageServerLoad} */
export async function load({ params: { slug } }) {
	try {
		const pagePath = `../../pages/${slug}.md`;
		const page = pages[pagePath];

		if (!page) {
			throw error(404, `Page not found: ${slug}`);
		}

		return {
			slug,
			...page.metadata,
			content: render(page.default)
		};
	} catch (e) {
		throw error(404, `Failed to load ${slug}: ${e instanceof Error ? e.message : 'Unknown error'}`);
	}
}
