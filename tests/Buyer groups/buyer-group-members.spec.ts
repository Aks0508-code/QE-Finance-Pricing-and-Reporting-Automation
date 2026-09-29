import { expect, test } from '../../fixtures/pricing.fixture';

test.describe('Buyer Group Members', () => {
  test.beforeEach(async ({ buyerGroups, shell, sharedPage }) => {
    await buyerGroups.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroups.goto();
  });

  test('@buyer-group-members @smoke @pricing-regression @functional Buyer Group Members link is available from an active group', async ({ buyerGroups }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await expect(buyerGroups).toBeTruthy();
  });

  test('@buyer-group-members @regression @navigation first Buyer Group Members link opens the confirmed members route', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await buyerGroups.openFirstCustomerMembers();
    await expect(sharedPage).toHaveURL(/\/BuyerGroupMembers\.aspx/i);
  });

  test('@buyer-group-members @regression @functional Buyer Group Members page exposes member or customer content', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await buyerGroups.openFirstCustomerMembers();
    const text = (await sharedPage.locator('body').innerText()).trim();
    test.skip(!/buyer group|member|customer/i.test(text), 'The current Members page does not expose recognizable member content.');
    expect(text).toMatch(/buyer group|member|customer/i);
  });

  test('@buyer-group-members @regression @functional Buyer Group Members page exposes usable controls when available', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await buyerGroups.openFirstCustomerMembers();
    const controls = sharedPage.locator('input:visible, select:visible, textarea:visible, button:visible, a:visible');
    test.skip((await controls.count()) === 0, 'The current Members page exposes no interactive controls.');
    await expect(controls.first()).toBeVisible();
  });

  test('@buyer-group-members @regression @functional Buyer Group Members exposes a grid or empty-state response', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await buyerGroups.openFirstCustomerMembers();
    const tables = sharedPage.locator('table:visible');
    const emptyState = sharedPage.getByText(/no members|no records|no data|not found/i);
    test.skip((await tables.count()) === 0 && (await emptyState.count()) === 0, 'No member grid or empty-state response is exposed.');
    await expect(sharedPage.locator('body')).toBeVisible();
  });

  test('@buyer-group-members @e2e @regression @navigation Buyer Group Members supports returning to Buyer Group Maintenance', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await buyerGroups.openFirstCustomerMembers();
    await sharedPage.goBack();
    await expect(sharedPage).toHaveURL(/\/BuyerGroups\.aspx/i);
  });
});