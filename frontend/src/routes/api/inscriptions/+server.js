import { getInscriptions } from '$lib/inscriptions.js';
import { json } from '@sveltejs/kit';

export const prerender = true;

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	const inscriptions = await getInscriptions('');

	return json(inscriptions);
}
