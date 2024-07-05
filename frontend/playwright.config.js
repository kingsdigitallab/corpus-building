import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: `npm run build && npm run preview`,
		port: 4173,
		timeout: 5 * 60 * 1000
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	timeout: 5 * 60 * 1000
};

export default config;
