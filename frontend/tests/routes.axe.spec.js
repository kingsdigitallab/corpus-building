import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs/promises';
import path from 'path';

const BASE = '/corpus-building';

const routes = [
    { name: 'home', path: `${BASE}/` },
    { name: 'about', path: `${BASE}/about` },
    { name: 'accessibility', path: `${BASE}/accessibility` },
    { name: 'credits', path: `${BASE}/credits` },
    { name: 'how-to-cite', path: `${BASE}/how-to-cite` },
    { name: 'technical-overview', path: `${BASE}/technical-overview` },
    { name: 'inscription', path: `${BASE}/inscription/ISic000001` },
    { name: 'bibliography', path: `${BASE}/bibliography` },
    { name: 'museum', path: `${BASE}/museum` }
];

test.describe('routes.axe', () => {
    for (const route of routes) {
        test(`${route.name} page is accessible`, async ({ page }) => {
            await page.goto(route.path);

            // Exclude third-party MapLibre map containers from scan
            // (documented known limitation in accessibility statement)
            const results = await new AxeBuilder({ page })
                .exclude('.maplibregl-map')
                .analyze();

            if (results.violations.length > 0) {
                const violations = { [route.path]: results.violations };

                const outputDir = 'test-results';
                await fs.mkdir(outputDir, { recursive: true });
                const filePath = path.join(outputDir, `${route.name}.axe.json`);
                await fs.writeFile(filePath, JSON.stringify(violations, null, 2));
            }

            expect(results.violations).toEqual([]);
        });
    }
});
