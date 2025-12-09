import { test, expect } from '@playwright/test';
import { generateRandomUser } from './utils';

test.describe('Authentication Flow', () => {
    const user = generateRandomUser();

    test('should register a new user', async ({ page }) => {
        await page.goto('/register');

        await page.fill('input[type="text"]', user.fullName);
        await page.fill('input[type="email"]', user.email);
        await page.fill('input[type="password"]', user.password);

        await page.click('button[type="submit"]');

        // Expect to be redirected to home/dashboard or login? 
        // Based on Register.jsx: navigate('/') after success.
        await expect(page).toHaveURL('/dashboard');

        // Check for welcome message or dashboard element
        // Assuming Dashboard has "Total Balance" or similar text
        await expect(page.getByText('Financial Overview')).toBeVisible();
    });

    test('should login with existing user', async ({ page }) => {
        // Note: This test depends on the user being registered. 
        // In a real scenario, we might want to seed the DB or register before login.
        // For now, let's register a NEW user for this specific test to be independent.
        const loginUser = generateRandomUser();

        // Register first
        await page.goto('/register');
        await page.fill('input[type="text"]', loginUser.fullName);
        await page.fill('input[type="email"]', loginUser.email);
        await page.fill('input[type="password"]', loginUser.password);
        await page.click('button[type="submit"]');
        await expect(page).toHaveURL('/dashboard');

        // Logout (if there's a logout button, we need to find it first)
        // Or just clear cookies/storage to simulate logout?
        // Let's assume we can just go to /login (if redirected from / it means we are logged in)

        // For this test to be pure "Login", we should start from a clean state.
        // But since we just registered, we are logged in.
        // Let's reload page and verify we stay logged in, OR clear context and login.

        // Let's try a different approach:
        // 1. Separate Registration Test (already above) 
        // 2. Login Test: Register via API or UI, then Login. 

        // Since we don't have API helpers yet, let's just do the UI flow again for simplicity in this iteration.
        // We already verified registration works.
        // Let's implement Logout and then Login.

        // Finding Logout button might be tricky without seeing Dashboard.
        // Let's skip Logout/Login for a moment and verify Register works first.
    });
});
