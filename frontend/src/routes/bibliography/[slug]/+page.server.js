import { error } from '@sveltejs/kit';
import { readFileSync } from 'fs';
import { join } from 'path';
import corpus from '../../../data/corpus.json';
import zotero from '../../../data/zotero.json';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params: { slug } }) {
	try {
		const z = zotero[slug];

		if (!z) {
			throw error(404, `Zotero item ${slug} not found`);
		}

		const inscriptions = corpus
			.filter((/** @type {{ zotero: string | any[]; }} */ inscription) =>
				inscription.zotero?.includes(slug)
			)
			.flatMap((inscription) => {
				const filePath = join(process.cwd(), 'src', 'data', 'metadata', `${inscription.file}.json`);
				const fileContent = readFileSync(filePath, 'utf-8');
				const json = JSON.parse(fileContent);
				const bibls =
					json?.bibliographyEdition?.bibl?.filter((bibl) => bibl?.ptr?.target?.endsWith(slug)) ||
					[];
				return bibls.map((bibl) => ({
					...inscription,
					bibl
				}));
			})
			.map((inscription) => ({
				...inscription,
				bulletinDateSort: parseInt(inscription.bibl?.inscriptionDate || '999999999999'),
				citedRangeSort: String(
					inscription.bibl?.citedRange?.ref?._ || inscription.bibl?.citedRange || 'ZZZZZ'
				)
			}))
			.map((i) => ({ ...i, languageSort: i.textLang?.languages.join(', ') || 'ZZZ' }))
			.map((i) => ({ ...i, materialSort: i.material?._ || 'ZZZ' }))
			.map((i) => ({ ...i, typeSort: i.type?._ || 'ZZZ' }))
			.sort((a, b) =>
				a.citedRangeSort.localeCompare(b.citedRangeSort, undefined, { numeric: true })
			);

		const isBulletin = inscriptions.some((inscription) => inscription.bibl?.type === 'bulletin');

		return { zotero: z, inscriptions, isBulletin };
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
