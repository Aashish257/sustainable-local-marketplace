import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers';

test('buyer finds a product, pays in sandbox mode and sees the order', async ({ page }) => {
    await login(page, USERS.buyer);
    await expect(page).toHaveURL(/\/marketplace/); // buyers land on the shop

    await page.getByText('E2E Bamboo Bottle').first().click();
    await expect(page.getByRole('heading', { name: 'E2E Bamboo Bottle' })).toBeVisible();
    await page.getByRole('button', { name: /add to cart/i }).click();

    await page.goto('/checkout');
    await page.getByLabel('Full name').fill('Bina Buyer');
    await page.getByLabel('Phone').fill('+91 98765 43210');
    await page.getByLabel('Street address').fill('12 Green Lane');
    await page.getByLabel('City').fill('Pune');
    await page.getByLabel('State').fill('Maharashtra');
    await page.getByLabel('PIN code').fill('411001');
    await page.getByRole('button', { name: /continue to payment/i }).click();

    await expect(page).toHaveURL(/\/payment\/[a-f0-9]{24}/);
    await page.getByRole('button', { name: /test payment \(sandbox mode\)/i }).click();
    await expect(page).toHaveURL(/\/payment\/success/);

    await page.goto('/orders');
    await expect(page.getByText('Paid & Processing').first()).toBeVisible();
});

test('guests are asked to sign in before checkout', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login/);
});
