import { getInscriptions } from '$lib/inscriptions';
import { error } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		return await getInscriptions('');
	} catch (e) {
		error(500, `Error loading inscriptions: ${e.message}`);
	}
}
