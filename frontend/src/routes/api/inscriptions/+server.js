import { getInscriptions, getSearchParams } from '$lib/inscriptions.js';
import { json } from '@sveltejs/kit';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	const { query, page, limit } = getSearchParams(url);

	const inscriptions = await getInscriptions(query, page, limit);

	return json(inscriptions);
}
