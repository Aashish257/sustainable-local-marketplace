import { expect } from '@playwright/test';

// Seeded by backend/tests/e2e-server.js
export const USERS = {
    buyer: 'buyer@e2e.test',
    rival: 'buyer2@e2e.test',
    seller: 'seller@e2e.test',
    admin: 'admin@e2e.test',
};

// Logs in through the real form, the way a user does
export const login = async (page, email) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('input[type="password"]').press('Enter');
    await expect(page).not.toHaveURL(/\/login/);
};
