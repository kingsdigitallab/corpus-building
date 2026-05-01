import { error } from '@sveltejs/kit';
import corpus from '../../../data/corpus.json';
import museums from '../../../data/museums.json';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params: { slug } }) {
	try {
		/**
		 * @type {{
		 * 	slug: string,
		 * 	uri: string,
		 * 	url: string | undefined,
		 * 	name: string,
		 * 	type: string,
		 * 	description: string,
		 * 	location: {
		 * 		address: string,
		 * 		settlement: string,
		 * 		region: string,
		 * 		country: string,
		 * 		geo: { lon: number | null, lat: number | null }
		 * 	},
		 * 	idno: {
		 * 		type: string,
		 * 		url: string
		 * 	}
		 * } | undefined}
		 */
		const museum = museums.find((museum) => museum.slug === slug);

		if (!museum) {
			throw error(404, `Museum ${slug} not found`);
		}

		const inscriptions = /** @type {any[]} */ (corpus)
			.filter((inscription) => inscription?.repository?.ref === museum.uri)
			.map((i) => ({ ...i, idnoSort: parseInt(i.idno?._ || '9999999999', 10) }))
			.map((i) => ({ ...i, languageSort: i.textLang?.languages.join(', ') || 'ZZZ' }))
			.map((i) => ({ ...i, materialSort: i.material?._ || 'ZZZ' }))
			.map((i) => ({ ...i, originSort: i.places?.[0]?._ || 'ZZZ' }))
			.map((i) => ({ ...i, typeSort: i.type?._ || 'ZZZ' }))
			.sort((a, b) => a.idnoSort - b.idnoSort);

		return { museum, inscriptions };
	} catch (e) {
		if (e instanceof Error) {
			error(404, `Error loading museum ${slug}: ${e.message}`);
		}
		throw error(404, `Error loading museum ${slug}`);
	}
}
