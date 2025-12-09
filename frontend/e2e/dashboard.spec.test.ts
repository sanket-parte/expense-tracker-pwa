import { test, expect } from '@playwright/test';
import { generateRandomUser } from './utils';

test.describe('Dashboard Flow', () => {
    const user = generateRandomUser();

    test.beforeAll(async ({ browser }) => {
        // Create a new context and page for registration
        const context = await browser.newContext();
        const page = await context.newPage();

        // Register a new user to ensure we have a fresh account
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
        // Login before each test
        await page.goto('/login');
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');
        await page.waitForSelector('text=Financial Overview');
    });

    test('should display dashboard components', async ({ page }) => {
        await expect(page.getByText('Financial Overview')).toBeVisible();
        await expect(page.getByText('Total Expenses')).toBeVisible();
        await expect(page.getByText('Spending Trend')).toBeVisible();
        // Check for specific elements like "Expense By Category"
        await expect(page.getByText('Expense By Category')).toBeVisible();
    });

    // Checking initial state (should be 0 or empty)
    test('should show empty state or zero values initially', async ({ page }) => {
        // Assuming new user has 0 expenses. 
        // We need to match the exact text for amount. 
        // The dashboard displays amounts like "₹0.00" or similar.

        // Finding the Total Expenses amount. 
        // It's in a StatCard. We can look for the heading "Total Expenses" and then the value.
        // But strictly looking for text might be flaky if formatting changes.
        // For now, let's just check the "No expense data yet" text if present in Pie Chart
        await expect(page.getByText('No expense data yet')).toBeVisible();
    });
});
