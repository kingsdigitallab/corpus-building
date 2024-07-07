import { base } from '$app/paths';
import { error } from '@sveltejs/kit';
import corpus from '../../../data/corpus.json';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params, parent }) {
	try {
		const slug = params.slug;
		const metadata = corpus.find((/** @type {{ file: string; }} */ entry) => entry.file === slug);

		const module = await import(`../../../data/html/${slug}.json`);
		const inscription = module.default;

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
