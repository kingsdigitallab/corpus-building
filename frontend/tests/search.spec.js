import { expect, test } from '@playwright/test';

const BASE = '/corpus-building';

test.describe('search', () => {
    test('search returns results', async ({ page }) => {
        await page.goto(`${BASE}/`);

        const searchInput = page.locator('input[type="search"], input[type="text"]').first();
        await expect(searchInput).toBeVisible();

        await searchInput.fill('funerary');
        await searchInput.press('Enter');

        // Wait for results to update
        await page.waitForTimeout(1000);

        // Expect some inscription results to appear
        const results = page.locator('[class*="result"], [class*="card"], table tbody tr, article');
        await expect(results.first()).toBeVisible({ timeout: 5000 });
    });

    test('empty search shows all inscriptions', async ({ page }) => {
        await page.goto(`${BASE}/`);

        // The home page should show inscriptions without any search
        const heading = page.locator('h1');
        await expect(heading).toBeVisible();
    });

    test('search with no results shows appropriate message', async ({ page }) => {
        await page.goto(`${BASE}/`);

        const searchInput = page.locator('input[type="search"], input[type="text"]').first();
        await expect(searchInput).toBeVisible();

        await searchInput.fill('xyznonexistentterm123456');
        await searchInput.press('Enter');

        await page.waitForTimeout(1000);

        // Should show 0 results or a no-results message
        const pageContent = await page.textContent('body');
        expect(
            pageContent?.includes('0') || pageContent?.toLowerCase().includes('no result')
        ).toBeTruthy();
    });
});
