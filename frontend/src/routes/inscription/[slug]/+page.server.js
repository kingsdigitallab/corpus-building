import { error } from '@sveltejs/kit';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params }) {
	try {
		const module = await import(`../../../data/html/${params.slug}.json`);
		const inscription = module.default;

		const license = inscription.divs.at(-1);

		return { inscription, license };
	} catch (e) {
		error(404, `Could not find data for ${params.slug}`);
	}
}
