import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs/promises';
import path from 'path';

test.describe('home.axe', () => {
	test('home page is accessible', async ({ page }) => {
		await page.goto('/');

		const results = await new AxeBuilder({ page }).analyze();

		if (results.violations.length > 0) {
			const violations = { '/': results.violations };

			const outputDir = 'test-results';
			await fs.mkdir(outputDir, { recursive: true });
			const filePath = path.join(outputDir, 'home.axe.json');
			await fs.writeFile(filePath, JSON.stringify(violations, null, 2));
		}

		expect(results.violations).toEqual([]);
	});
});
