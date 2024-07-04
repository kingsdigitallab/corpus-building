import { base } from '$app/paths';
import { error } from '@sveltejs/kit';

/** @type {import('../$types').PageServerLoad} */
export async function load({ params }) {
	try {
		const module = await import(`../../../data/html/${params.slug}.json`);
		const inscription = module.default;

		const license = inscription.divs.at(-1);

		inscription.divs = inscription.divs.map((/** @type {{ html: string; }} */ div) => ({
			...div,
			html: div.html.replace(/(href|src)="\/(?!\/)/g, `$1="${base}/`)
		}));

		return { inscription, license, title: inscription.title };
	} catch (e) {
		error(404, `Could not find data for ${params.slug}`);
	}
}
