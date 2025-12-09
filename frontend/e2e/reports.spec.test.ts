import { test, expect } from '@playwright/test';
import { generateRandomUser } from './utils';
import dayjs from 'dayjs';

test.describe('Reports Flow', () => {
    const user = generateRandomUser();

    test.beforeAll(async ({ browser }) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('/register');
        await page.fill('input[type="text"]', user.fullName);
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
        await page.waitForSelector('text=Financial Overview');
        await context.close();
    });

    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
    });

    test('should display monthly report', async ({ page }) => {
        await page.goto('/reports');

        // Verify heading
        await expect(page.getByText('Monthly Report')).toBeVisible();

        // Check current month display
        const currentMonth = dayjs().format('MMMM YYYY');
        await expect(page.getByText(currentMonth)).toBeVisible();

        // Check Summary Cards
        await expect(page.getByText('Total Spent')).toBeVisible();
        await expect(page.getByText('Daily Average')).toBeVisible();
        await expect(page.getByText('Top Category')).toBeVisible();

        // Check Navigation
        // Click previous month
        await page.click('button:has(svg.lucide-chevron-left)');

        const prevMonth = dayjs().subtract(1, 'month').format('MMMM YYYY');
        await expect(page.getByText(prevMonth)).toBeVisible();

        // Click next month to return
        await page.click('button:has(svg.lucide-chevron-right)');
        await expect(page.getByText(currentMonth)).toBeVisible();
    });
});
