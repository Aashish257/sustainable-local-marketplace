import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers';

const TITLE = `E2E Compost Bin ${Date.now()}`;

test('seller lists a product, admin approves it, shoppers can see it', async ({ browser }) => {
    // 1. Seller lands in the dashboard and cannot open the shop
    const sellerPage = await (await browser.newContext()).newPage();
    await login(sellerPage, USERS.seller);
    await expect(sellerPage).toHaveURL(/\/dashboard/);
    await sellerPage.goto('/marketplace');
    await expect(sellerPage).toHaveURL(/\/dashboard/);

    // 2. Seller submits a listing; it waits for approval
    await sellerPage.goto('/dashboard/products/new');
    await sellerPage.locator('input[name="title"]').fill(TITLE);
    await sellerPage.locator('textarea[name="description"]').fill('Kitchen compost bin made from recycled plastic.');
    await sellerPage.locator('input[name="price"]').fill('750');
    await sellerPage.locator('input[name="stock"]').fill('4');
    await sellerPage.getByRole('button', { name: /publish product/i }).click();
    await expect(sellerPage).toHaveURL(/\/dashboard\/products$/);
    await expect(sellerPage.getByRole('row', { name: new RegExp(TITLE) }).getByText('Pending approval')).toBeVisible();

    // 3. Not visible to shoppers yet
    const guest = await (await browser.newContext()).newPage();
    await guest.goto(`/marketplace?search=${encodeURIComponent(TITLE)}`);
    await expect(guest.getByText(TITLE)).toHaveCount(0);

    // 4. Admin approves it from the moderation queue
    const adminPage = await (await browser.newContext()).newPage();
    await login(adminPage, USERS.admin);
    await expect(adminPage).toHaveURL(/\/admin/);
    await adminPage.goto('/admin/products');
    const row = adminPage.getByRole('row', { name: new RegExp(TITLE) });
    await row.getByRole('button', { name: 'Approve' }).click();
    await expect(row.getByText('Approved')).toBeVisible();

    // 5. Now shoppers find it
    await guest.goto(`/marketplace?search=${encodeURIComponent(TITLE)}`);
    await expect(guest.getByText(TITLE).first()).toBeVisible();
});
