import { error, text } from '@sveltejs/kit';
import fs from 'node:fs/promises';
import corpus from '../../../../../data/corpus.json';
import { stripHtml } from '$lib/utils/html.js';

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

        const plainText = stripHtml(foundEdition.html);

        return text(plainText, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
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
 * @returns {Array<{ slug: string, edition: string }>} An array of objects for prerendering.
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
