import { expect, test } from '@playwright/test';

test.describe('home', () => {
	test('home page has expected h1', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toBeVisible();
	});
});
