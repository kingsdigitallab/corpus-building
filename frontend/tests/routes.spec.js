import { expect, test } from '@playwright/test';

const BASE = '/corpus-building';

test.describe('routes', () => {
    test('home page has expected h1', async ({ page }) => {
        await page.goto(`${BASE}/`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('about page loads', async ({ page }) => {
        await page.goto(`${BASE}/about`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('accessibility page loads', async ({ page }) => {
        await page.goto(`${BASE}/accessibility`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('credits page loads', async ({ page }) => {
        await page.goto(`${BASE}/credits`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('how to cite page loads', async ({ page }) => {
        await page.goto(`${BASE}/how-to-cite`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('technical overview page loads', async ({ page }) => {
        await page.goto(`${BASE}/technical-overview`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('inscription detail page loads', async ({ page }) => {
        await page.goto(`${BASE}/inscription/ISic000001`);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page.locator('h1')).toContainText('ISic000001');
    });

    test('bibliography list page loads', async ({ page }) => {
        await page.goto(`${BASE}/bibliography`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('museum list page loads', async ({ page }) => {
        await page.goto(`${BASE}/museum`);
        await expect(page.locator('h1')).toBeVisible();
    });

    test('404 page for unknown route', async ({ page }) => {
        const response = await page.goto(`${BASE}/this-page-does-not-exist`);
        expect(response?.status()).toBe(404);
    });
});
