import { DEBUG } from '$env/static/private';
import { error } from '@sveltejs/kit';
import { existsSync, readFileSync } from 'fs';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	if (DEBUG !== 'true') {
		return { prerender: [] };
	}

	const errorFilePath = 'src/lib/prerender-errors.json';

	if (!existsSync(errorFilePath)) {
		return { prerender: [] };
	}

	try {
		const prerender = JSON.parse(readFileSync(errorFilePath, 'utf-8'));
		return { prerender: Object.values(prerender) };
	} catch (e) {
		error(404, 'Could not load prerender-errors.json');
	}
}
