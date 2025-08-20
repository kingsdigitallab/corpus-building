import { error } from '@sveltejs/kit';
import corpus from '../../../data/corpus.json';
import zotero from '../../../data/zotero.json';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params: { slug } }) {
	try {
		const z = zotero[slug];

		if (!z) {
			throw error(404, `Zotero item ${slug} not found`);
		}

		const inscriptions = corpus.filter((/** @type {{ zotero: string | any[]; }} */ inscription) =>
			inscription.zotero?.includes(slug)
		);

		return { zotero: z, inscriptions };
	} catch (e) {
		if (e instanceof Error) {
			error(404, `Error loading bibliography: ${e.message}`);
		}
		throw error(404, `Error loading bibliography ${slug}`);
	}
}

/** @type {import('./$types').Entries} */
export async function entries() {
	return Object.keys(zotero).map((slug) => ({
		slug
	}));
}
