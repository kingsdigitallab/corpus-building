import bibliography from '../../data/bibliography.json';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	return { bibliography };
}
