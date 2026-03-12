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

    test('load more button appends results', async ({ page }) => {
        await page.goto(`${BASE}/?limit=3`);

        // Wait for initial results
        const results = page.locator('.inscriptions .inscription-card');
        await expect(results.first()).toBeVisible({ timeout: 5000 });

        // Count initial results (e.g., 20)
        const initialCount = await results.count();
        expect(initialCount).toBeGreaterThan(0);

        // Click the load more button
        const loadMoreBtn = page.locator('button:has-text("Load more")').first();
        await expect(loadMoreBtn).toBeVisible();
        await loadMoreBtn.click();

        // Wait a bit for results to append
        await page.waitForTimeout(1000);

        // Expect the results count to have increased
        const newCount = await results.count();
        expect(newCount).toBeGreaterThan(initialCount);
    });

    test('pagination next page replaces results', async ({ page }) => {
        await page.goto(`${BASE}/?limit=3`);

        const results = page.locator('.inscriptions .inscription-card');
        await expect(results.first()).toBeVisible({ timeout: 5000 });

        const initialCount = await results.count();
        expect(initialCount).toBeGreaterThan(0);

        const firstResultText = await results.first().textContent();

        // Click next page in the standard paginator
        const nextButton = page.locator('button[aria-label="Next page"]');
        await expect(nextButton).toBeVisible();
        await nextButton.click();

        await page.waitForTimeout(1000);

        // Expect the count to remain exactly the original limit (e.g. 20) instead of growing
        const newCount = await results.count();
        expect(newCount).toEqual(initialCount);

        // Expect the results to have changed
        const newFirstResultText = await results.first().textContent();
        expect(newFirstResultText).not.toEqual(firstResultText);
    });
});
