import { expect, test } from '@playwright/test';

test.describe('home', () => {
	test('home page has expected h1', async ({ page }) => {
		await page.goto('/corpus-building/');
		await expect(page.locator('h1')).toBeVisible();
	});
});
