import { error } from '@sveltejs/kit';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params, fetch }) {
	try {
		const response = await fetch(`/src/data/html/${params.slug}.json`);
		const inscription = await response.json();

		const license = inscription.divs.at(-1);

		return { inscription, license };
	} catch (e) {
		error(404, `Could not find ${params.slug}`);
	}
}
