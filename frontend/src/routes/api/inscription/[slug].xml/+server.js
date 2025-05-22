import { error } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import corpus from '../../../../data/corpus.json';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export async function GET({ params: { slug } }) {
	try {
		const xmlFilePath = `src/data/inscriptions/${slug}.xml`;
		const xmlContent = await fs.readFile(xmlFilePath, 'utf8');

		return new Response(xmlContent, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (e) {
		if (e instanceof Error) {
			error(404, `Error loading XML for ${slug}: ${e.message}`);
		}
		throw error(404, `Error loading XML for ${slug}`);
	}
}

/**
 * Returns an array of slugs derived from the corpus data.
 *
 * @returns {Array<{ slug: string }>} An array of objects, each containing a unique slug.
 * @type {import('./$types').EntryGenerator}
 */
export function entries() {
	return Array.isArray(corpus) ? corpus.map(({ file: slug }) => ({ slug })) : [];
}
