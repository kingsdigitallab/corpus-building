import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import fs from 'fs/promises';
import { metadataExtractors } from '@corpus-building/etl/src/metadata.js';
import corpus from '../../../data/corpus.json';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params }) {
	try {
		const slug = params.slug;

		const metadataFilePath = `src/data/metadata/${slug}.json`;
		const metadataFileContent = await fs.readFile(metadataFilePath, 'utf8');
		const metadata = JSON.parse(metadataFileContent);

		const inscriptionFilePath = `src/data/inscriptions/${slug}.xml`;
		let inscriptionFileContent = await fs.readFile(inscriptionFilePath, 'utf8');
		inscriptionFileContent
			.replaceAll(/http:\/\/sicily\.classics\.ox\.ac\.uk\/inscription\/(ISic\d{6})/g, '$1')
			.replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`);
		const inscription = await metadataExtractors.parseXML(inscriptionFileContent);

		const htmlFilePath = `src/data/html/${slug}.json`;
		const htmlFileContent = await fs.readFile(htmlFilePath, 'utf8');
		const html = JSON.parse(htmlFileContent);
		const surfaces = Array.isArray(inscription.TEI.facsimile.surface)
			? inscription.TEI.facsimile.surface
			: [inscription.TEI.facsimile.surface];

		const images = surfaces.flatMap(
			(/** @type {{ graphic: any[]; desc: string; type: string; }} */ surface) =>
				surface.graphic
					.map((graphic) => ({
						...graphic,
						desc: graphic.desc,
						surfaceType: surface.type
					}))
					.filter((image) => image.n === 'screen')
		);

		return { slug, metadata, inscription, images, html };
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
