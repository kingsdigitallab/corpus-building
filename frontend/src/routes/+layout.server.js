import { DEBUG } from '$env/static/private';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
	return { debug: DEBUG === 'true' };
}
