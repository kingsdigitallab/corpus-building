import { DEBUG } from '$env/static/private';
import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
	if (DEBUG !== 'true') {
		return { prerender: {}, axe: [] };
	}

	const prerenderFilePath = 'src/lib/prerender-errors.json';
	let prerender = {};

	const axeDirPath = 'test-results';
	let axe = [];

	try {
		if (fs.existsSync(prerenderFilePath)) {
			prerender = JSON.parse(fs.readFileSync(prerenderFilePath, 'utf-8'));
		}

		if (fs.existsSync(axeDirPath)) {
			for (const file of fs.readdirSync(axeDirPath)) {
				if (file.endsWith('.axe.json')) {
					const filePath = path.join(axeDirPath, file);
					axe = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
				}
			}
		}

		return { prerender: Object.values(prerender), axe };
	} catch (e) {
		error(404, 'Could not load prerender-errors.json');
	}
}
