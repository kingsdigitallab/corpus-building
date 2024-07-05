import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('home.axe', () => {
	test('home page is accessible', async ({ page }) => {
		await page.goto('/');

		const results = await new AxeBuilder({ page }).analyze();

		expect(results.violations).toEqual([]);
	});
});
