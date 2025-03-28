import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import corpus from '../../../data/corpus.json';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params }) {
	try {
		const slug = params.slug;

		const metadataFilePath = `src/data/metadata/${slug}.json`;
		const metadataFileContent = await fs.readFile(metadataFilePath, 'utf8');
		const metadata = JSON.parse(metadataFileContent);

		const htmlFilePath = `src/data/html/${slug}.json`;
		const htmlFileContent = await fs.readFile(htmlFilePath, 'utf8');
		const html = JSON.parse(htmlFileContent);

		const xmlFilePath = `src/data/inscriptions/${slug}.xml`;
		const xmlFileContent = await fs.readFile(xmlFilePath, 'utf8');
		const xml = xmlFileContent;

		return { slug, metadata, images: metadata.graphics, html, xml };
	} catch (err) {
		if (err instanceof Error) {
			error(404, `Error loading ${params.slug}: ${err.message}`);
		}
		throw error(404, `Error loading ${params.slug}`);
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
