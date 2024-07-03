import { error } from '@sveltejs/kit';
import corpus from '../data/corpus.json';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	try {
		return { corpus };
	} catch (e) {
		error(404, 'Could not load corpus data');
	}
}
