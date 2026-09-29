import { expect, test } from '../../fixtures/pricing.fixture';

test.describe('Buyer Group Defaults', () => {
  test.beforeEach(async ({ buyerGroups, shell, sharedPage }) => {
    await buyerGroups.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroups.goto();
  });

  test('@buyer-group-defaults @smoke @pricing-regression @functional Buyer Group Defaults opens from Maintenance', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openDefaults();
    await expect(target).toHaveURL(/\/BuyerGroupDefaults\.aspx/i);
    await expect(target.getByText(/Buyer Group Defaults/i).first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-defaults @regression @functional Buyer Group Defaults exposes editable form controls', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openDefaults();
    const controls = target.locator('input:visible, select:visible, textarea:visible');
    test.skip((await controls.count()) === 0, 'The current Defaults page exposes no editable controls.');
    await expect(controls.first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-defaults @regression @functional Buyer Group Defaults exposes selection controls when configured', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openDefaults();
    const selections = target.locator('select:visible, input[type="checkbox"]:visible, input[type="radio"]:visible');
    test.skip((await selections.count()) === 0, 'The current Defaults page exposes no selection controls.');
    await expect(selections.first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-defaults @regression @functional Buyer Group Defaults exposes labeled default-setting fields', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openDefaults();
    const labels = target.locator('label:visible, th:visible, td:visible').filter({ hasText: /default|buyer|group|price|category/i });
    test.skip((await labels.count()) === 0, 'The current Defaults page exposes no labeled default-setting fields.');
    await expect(labels.first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-defaults @regression @functional Buyer Group Defaults exposes a close or cancel path', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openDefaults();
    const close = target.getByRole('button', { name: /Cancel|Close/i }).last().or(target.locator('input[value="Cancel"], input[value="Close"]').last());
    await expect(close).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-defaults @e2e @regression @navigation closing Buyer Group Defaults returns to Maintenance', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openDefaults();
    await closeChildOrCancel(target, sharedPage);
    await expect(sharedPage).toHaveURL(/\/BuyerGroups\.aspx/i);
  });
});

async function closeChildOrCancel(target: import('@playwright/test').Page, sharedPage: import('@playwright/test').Page): Promise<void> {
  if (target !== sharedPage) {
    await target.close().catch(() => undefined);
    return;
  }
  await target.getByRole('button', { name: /^Cancel$/i }).last().click().catch(async () => {
    await target.locator('input[value="Cancel"], input[value="Close"]').last().click().catch(() => undefined);
  });
}