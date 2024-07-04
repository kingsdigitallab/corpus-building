import adapter from '@sveltejs/adapter-static';
import { config as dotenv } from 'dotenv';
import { appendFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv({ path: join(__dirname, '.env') });

const debug = process.env.DEBUG === 'true';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// don't throw errors in dev mode, just log them
				if (debug) {
					const logMessage = `[${new Date().toISOString()}] ${message}\n`;

					if (path.endsWith('.jpg') || path.endsWith('.tif')) {
						console.warn(logMessage);
						return;
					}

					try {
						appendFileSync('prerender-errors.log', logMessage);
					} catch (e) {
						writeFileSync('prerender-errors.log', logMessage);
					}

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
