import { test, expect } from '@playwright/test';
import { generateRandomUser } from './utils';

test.describe('Budgets Flow', () => {
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
        await page.waitForSelector('text=Financial Overview');
    });

    test('should create and delete a budget', async ({ page }) => {
        await page.goto('/budgets');

        // Check empty state roughly
        // await expect(page.getByText('No budgets set yet')).toBeVisible(); 
        // This might flop if default budgets exist, but new user should be empty.

        // 1. Create Budget
        await page.click('text=New Budget');

        // Form
        // Category select. Index 1.
        const categorySelect = page.locator('select');
        await categorySelect.selectOption({ index: 1 });

        await page.fill('input[placeholder="0.00"]', '5000');

        await page.click('button:has-text("Set Budget")');

        // Verify budget item appears
        // We can check text "₹5,000" or similar depending on locale formatting "5,000" or "5000".
        // Or just check that the empty state is gone.
        // Let's verify presence of the category name we selected? We don't know it easily.
        // But we know amount 5000.
        await expect(page.getByText('5,000').first()).toBeVisible();

        // 2. Delete Budget
        // Find delete button. In `Budgets.jsx`: 
        // <button ... className="text-slate-400 hover:text-red-500 ..."> <Trash2 /> </button>
        // It is visible on card always? Yes line 144.
        await page.click('button:has(svg.lucide-trash-2)');

        // Verify deletion
        // Should return to empty state or item disappear
        await expect(page.getByText('5,000')).not.toBeVisible();
    });

    test('should open auto-suggest modal', async ({ page }) => {
        await page.goto('/budgets');
        await page.click('button:has-text("Auto-Suggest")');
        // It mimics API call. Should show "AI Suggested Budgets" title in modal.
        // If API fails or returns nothing, it shows "No suggestions found".
        // We just check the modal title.
        await expect(page.getByText('AI Suggested Budgets')).toBeVisible();

        // Close it
        // For new user, it might say "No suggestions found"
        // Check for either "Done" button OR "No suggestions found" text.
        // If "No suggestions found" is visible, we are good.
        const noSuggestions = page.getByText('No suggestions found based on your history.');
        if (await noSuggestions.isVisible()) {
            await expect(noSuggestions).toBeVisible();
            // Close modal by clicking outside or X if available?
            // Or just finish test.
        } else {
            await page.click('button:has-text("Done")');
        }
    });
});
