import { error } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import { json } from '@sveltejs/kit';
import corpus from '../../../../../data/corpus.json';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export async function GET({ params: { slug, edition } }) {
	try {
		const jsonFilePath = `src/data/html/${slug}.json`;
		const jsonContent = await fs.readFile(jsonFilePath, 'utf8');
		const inscription = JSON.parse(jsonContent);

		const foundEdition = inscription?.editions?.find((e) => e.id === `edition-${edition}`);

		if (!foundEdition) {
			throw error(404, `Edition ${edition} not found for ${slug}`);
		}

		return json(foundEdition, {
			headers: {
				'Cache-Control': 'public, max-age=3600'
			}
		});
	} catch (e) {
		if (e instanceof Error) {
			error(404, `Error loading ${edition} edition for ${slug}: ${e.message}`);
		}
		throw error(404, `Error loading ${edition} edition for ${slug}`);
	}
}

/**
 * Returns an array of slugs derived from the corpus data.
 *
 * @returns {Array<{ slug: string }>} An array of objects, each containing a unique slug.
 * @type {import('./$types').EntryGenerator}
 */
export function entries() {
	return Array.isArray(corpus)
		? corpus.flatMap(({ file: slug }) => [
				{ slug, edition: 'interpretive' },
				{ slug, edition: 'diplomatic' }
			])
		: [];
}
