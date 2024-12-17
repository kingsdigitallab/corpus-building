import corpus from '$data/corpus.json';
import * as config from '$lib/config.js';

/**
 * @param {string} query
 */
export async function getInscriptions(query, page = 1, limit = config.search.limit) {
	if (page < 1) page = 1;
	if (limit > 5 * config.search.limit) limit = config.search.limit;

	let inscriptions = corpus;

	if (query) {
		inscriptions = corpus.filter((/** @type {{ keywords: string[]; }} */ inscription) =>
			query
				.toLocaleLowerCase()
				.split(' ')
				.every((/** @type String */ term) =>
					inscription.keywords.some((/** @type string */ keyword) => keyword.includes(term))
				)
		);
	}

	const total = inscriptions.length;
	const start = (page - 1) * limit;
	const end = start + limit < total ? start + limit : total;
	const previous = start > 0 && page - 1;
	const next = end < total && page + 1;

	const yearSpan = getYearSpan(inscriptions);
	const numberOfLocations = getNumberOfLocations(inscriptions);

	const results = {
		yearSpan,
		numberOfLocations,
		inscriptions: inscriptions.slice(start, end),
		geo: inscriptions.map((inscription) => ({
			file: inscription.file,
			title: inscription.title,
			places: inscription.places,
			geo: inscription.geo[0]
		}))
	};

	return {
		query,
		limit,
		total,
		page,
		start,
		end,
		previous,
		next,
		results
	};
}

/**
 * @param {Object[]} inscriptions
 */
export function getYearSpan(inscriptions) {
	if (!inscriptions || inscriptions.length === 0) return 0;

	const minYear = Math.min(
		...inscriptions
			.filter((inscription) => inscription.notBefore)
			.map((inscription) => inscription.notBefore)
	);

	const maxYear = Math.max(
		...inscriptions
			.filter((inscription) => inscription.notAfter)
			.map((inscription) => inscription.notAfter)
	);

	return maxYear - minYear;
}

/**
 * @param {Object[]} inscriptions
 */
export function getNumberOfLocations(inscriptions) {
	if (!inscriptions) return 0;

	return new Set(inscriptions.map((inscription) => inscription.provenance)).size;
}

export function getSearchParams(url) {
	const query = url.searchParams.get('q') || '';

	let page = parseInt(url.searchParams.get('page') || '1');
	if (page < 1) page = 1;

	const limit = parseInt(url.searchParams.get('limit') || `${config.search.limit}`);

	return { query, page, limit };
}
