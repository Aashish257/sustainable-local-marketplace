import { test, expect } from '@playwright/test';
import { login, USERS } from './helpers';

test('two buyers bid live: each sees the other\'s bid without refreshing', async ({ browser }) => {
    const alice = await (await browser.newContext()).newPage();
    const rival = await (await browser.newContext()).newPage();
    await login(alice, USERS.buyer);
    await login(rival, USERS.rival);

    // Auctions have their own page
    await alice.goto('/auctions');
    await alice.getByText('E2E Vintage Lamp').click();
    await expect(alice.getByRole('heading', { name: 'Live auction' })).toBeVisible();
    const lampUrl = alice.url();
    await rival.goto(lampUrl);

    const placeBid = async (page, amount) => {
        await page.getByLabel(/your bid/i).fill(String(amount));
        await page.getByRole('button', { name: 'Place bid' }).click();
    };

    // Wait until both are connected to the live feed
    await expect(alice.getByText('Live updates on')).toBeVisible();
    await expect(rival.getByText('Live updates on')).toBeVisible();

    await placeBid(alice, 1200);
    await expect(rival.getByText('₹1,200').first()).toBeVisible(); // pushed over the socket

    await placeBid(rival, 1500);
    await expect(alice.getByText('₹1,500').first()).toBeVisible();

    // A bid that is not higher than the current one can't even be submitted
    await alice.getByLabel(/your bid/i).fill('1400');
    await expect(alice.getByRole('button', { name: 'Place bid' })).toBeDisabled();
    await expect(alice.getByText('₹1,500').first()).toBeVisible();
});
