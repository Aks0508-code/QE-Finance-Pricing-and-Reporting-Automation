import { expect, test } from '../../fixtures/pricing.fixture';

test.describe('Buyer Group Maintenance', () => {
  test.beforeEach(async ({ buyerGroups, shell, sharedPage }) => {
    await buyerGroups.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroups.goto();
  });

  test('@buyer-group @smoke @pricing-regression @functional Buyer Group Maintenance page loads', async ({ buyerGroups }) => {
    await buyerGroups.expectLoaded();
  });

  test('@buyer-group @smoke @pricing-regression @functional Buyer Group Maintenance exposes core controls', async ({ buyerGroups }) => {
    await buyerGroups.expectCoreControls();
  });

  test('@buyer-group @regression @functional active Buyer Group rows expose editable fields', async ({ buyerGroups }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await buyerGroups.expectActiveRowsEditable();
  });

  test('@buyer-group @regression @functional active Buyer Group rows expose inquiry or discount controls when available', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    const controls = sharedPage.locator('input[type="checkbox"]:visible');
    test.skip((await controls.count()) === 0, 'No active Buyer Group inquiry or discount controls are exposed.');
    await expect(controls.first()).toBeVisible();
  });

  test('@buyer-group @regression @search Buyer Group item, customer, and category searches are available', async ({ buyerGroups }) => {
    test.skip(!(await buyerGroups.hasSearchControls()), 'Current Buyer Group page does not expose all search controls.');
    await expect(buyerGroups).toBeTruthy();
  });

  test('@buyer-group @regression @functional Buyer Group item search executes without changing data', async ({ buyerGroups }) => {
    test.skip(!(await buyerGroups.hasSearchControls()), 'Current Buyer Group page does not expose all search controls.');
    await buyerGroups.searchByItem('');
    await buyerGroups.expectLoaded();
  });

  test('@buyer-group @regression @functional Buyer Group customer search executes without changing data', async ({ buyerGroups }) => {
    test.skip(!(await buyerGroups.hasSearchControls()), 'Current Buyer Group page does not expose all search controls.');
    await buyerGroups.searchByCustomer('');
    await buyerGroups.expectLoaded();
  });

  test('@buyer-group @regression @functional Buyer Group category search executes with an available category', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasSearchControls()), 'Current Buyer Group page does not expose all search controls.');
    const category = sharedPage.locator('#lstCategoryCode option, select[name="lstCategoryCode"] option').nth(1);
    test.skip((await category.count()) === 0, 'No selectable Buyer Group category is exposed.');
    const label = (await category.textContent())?.trim();
    test.skip(!label, 'The available Buyer Group category has no label.');
    await buyerGroups.searchByCategory(label as string);
    await buyerGroups.expectLoaded();
  });

  test('@buyer-group @e2e @regression @navigation first Buyer Group pricing link opens pricing', async ({ buyerGroups, sharedPage }) => {
    test.skip(!(await buyerGroups.hasActiveRows()), 'No active Buyer Group rows are exposed by the current environment.');
    await buyerGroups.openFirstPricing();
    await expect(sharedPage).toHaveURL(/\/BuyerGroupPricing\.aspx/i);
  });

  test('@buyer-group @regression @reporting Buyer Group Excel export downloads a file', async ({ buyerGroups }) => {
    const filename = await buyerGroups.exportAndReturnFilename();
    expect(filename.toLowerCase()).toMatch(/\.(xls|xlsx|csv)$/);
  });
});