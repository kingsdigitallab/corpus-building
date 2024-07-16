import adapter from '@sveltejs/adapter-static';
import dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const debug = process.env.DEBUG === 'true';

const errorFilePath = 'src/lib/prerender-errors.json';
if (!existsSync(errorFilePath)) {
	writeFileSync(errorFilePath, '{}');
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		alias: {
			$data: 'src/data'
		},
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/corpus-building' : ''
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// don't throw errors in debug mode, just log them
				if (debug) {
					const errorLog = {
						timestamp: new Date().toISOString(),
						path,
						referrer,
						message
					};

					if (path.endsWith('.jpg') || path.endsWith('.tif')) {
						// console.warn(message);
						return;
					}

					const errors = JSON.parse(readFileSync(errorFilePath, 'utf-8'));
					errors[message] = errorLog;

					writeFileSync(errorFilePath, JSON.stringify(errors, null, 2));

					console.warn(`[prerender] Logged error for: ${path}`);

					return;
				}

				// throw the error in production
				throw new Error(message);
			}
		}
	}
};

export default config;
