import { base } from '$app/paths';
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

		const inscriptionFilePath = `src/data/html/${slug}.json`;
		const inscriptionFileContent = await fs.readFile(inscriptionFilePath, 'utf8');
		const inscription = JSON.parse(inscriptionFileContent);

		const license = inscription.divs.at(-1);

		inscription.divs = inscription.divs.map((/** @type {{ html: string; }} */ div) => ({
			...div,
			html: div.html.replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`)
		}));

		return { slug, metadata, inscription, license, title: inscription.title };
	} catch (e) {
		error(404, `Error loading ${params.slug}: ${e.message}`);
	}
}

/**
 * Returns an array of slugs derived from the corpus data.
 * Each slug corresponds to a unique inscription file in the project.
 *
 * @returns {Array<{ slug: string }>} An array of objects, each containing a unique slug.
 * @type {import('./$types').EntryGenerator}
 */
export function entries() {
	return corpus.map(({ file: slug }) => ({ slug }));
}
