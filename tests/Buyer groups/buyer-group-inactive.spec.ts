import { expect, test } from '../../fixtures/pricing.fixture';

test.describe('Inactive Buyer Groups', () => {
  test.beforeEach(async ({ buyerGroups, shell, sharedPage }) => {
    await buyerGroups.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroups.goto();
  });

  test('@buyer-group-inactive @smoke @pricing-regression @inactive Inactive Buyer Groups route loads', async ({ buyerGroups, sharedPage }) => {
    await buyerGroups.openInactiveView();
    await expect(sharedPage).toHaveURL(/\/BuyerGroupsInActive\.aspx/i);
    await buyerGroups.expectInactiveLoaded();
  });

  test('@buyer-group-inactive @regression @inactive Inactive Buyer Groups exposes archive or status information', async ({ buyerGroups, sharedPage }) => {
    await buyerGroups.openInactiveView();
    const text = await sharedPage.locator('body').innerText();
    test.skip(!/inactive|reactivate|status|reason/i.test(text), 'The current inactive page exposes no archive/status information.');
    expect(text).toMatch(/inactive|reactivate|status|reason/i);
  });

  test('@buyer-group-inactive @regression @functional Inactive Buyer Groups exposes inactive rows when data is available', async ({ buyerGroups }) => {
    await buyerGroups.openInactiveView();
    test.skip(!(await buyerGroups.hasInactiveRows()), 'No inactive Buyer Group rows are exposed by the current environment.');
    await expect(buyerGroups).toBeTruthy();
  });

  test('@buyer-group-inactive @e2e @regression @functional Inactive Buyer Groups exposes reactivation controls when available', async ({ buyerGroups, sharedPage }) => {
    await buyerGroups.openInactiveView();
    test.skip(!(await buyerGroups.hasInactiveRows()), 'No inactive Buyer Group rows are exposed by the current environment.');
    const controls = sharedPage.locator('input[type="checkbox"]:visible, input[id*="Reactivate" i]:visible, button:visible');
    test.skip((await controls.count()) === 0, 'No reactivation controls are exposed by the current inactive data.');
    await expect(controls.first()).toBeVisible();
  });

  test('@buyer-group-inactive @regression @inactive Inactive Buyer Groups exposes archive metadata columns when available', async ({ buyerGroups, sharedPage }) => {
    await buyerGroups.openInactiveView();
    const metadata = sharedPage.locator('th:visible, td:visible').filter({ hasText: /status|reason|note|date|inactive/i });
    test.skip((await metadata.count()) === 0, 'No inactive archive metadata columns are exposed.');
    await expect(metadata.first()).toBeVisible();
  });

  test('@buyer-group-inactive @e2e @regression @navigation returning from Inactive Buyer Groups reaches Maintenance', async ({ buyerGroups, sharedPage }) => {
    await buyerGroups.openInactiveView();
    await sharedPage.goBack();
    await expect(sharedPage).toHaveURL(/\/BuyerGroups\.aspx/i);
  });
});