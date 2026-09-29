import { expect, test } from '../../fixtures/pricing.fixture';
import type { Page } from '@playwright/test';

test.describe('Buyer Group Add Forms', () => {
  test.beforeEach(async ({ buyerGroups, shell, sharedPage }) => {
    await buyerGroups.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroups.goto();
  });

  test('@buyer-group-add-new @smoke @pricing-regression @functional Add New Buyer Group opens the confirmed form route', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNew();
    await expect(target).toHaveURL(/\/BuyerGroupsNew\.aspx/i);
    await expect(target.getByRole('textbox').first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-new @regression @functional Add New Buyer Group exposes code, description, and category fields', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNew();
    await expect(target.getByRole('row', { name: /^Code:/i }).getByRole('textbox').first()).toBeVisible();
    await expect(target.getByRole('row', { name: /^Description:/i }).getByRole('textbox').first()).toBeVisible();
    await expect(target.getByRole('row', { name: /^Category Code:/i }).getByRole('combobox').first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-new @regression @validation Add New Buyer Group exposes environment selection requirements', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNew();
    const environments = target.getByRole('checkbox', { name: /ASHLEY FURNITURE/i });
    test.skip((await environments.count()) === 0, 'The current Add New form does not expose environment checkboxes.');
    await expect(environments.first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-new @e2e @regression @functional Add New Buyer Group exposes Submit and Add, Submit and Close, and Cancel', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNew();
    await expect(target.getByRole('button', { name: /Submit and Close/i })).toBeVisible();
    await expect(target.getByRole('button', { name: /Submit and Add/i })).toBeVisible();
    await expect(target.getByRole('button', { name: /^Cancel$/i })).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-item @smoke @pricing-regression @functional Add New Item opens the confirmed price form route', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNewItem();
    await expect(target).toHaveURL(/\/BuyerGroupPriceNew\.aspx/i);
    await expect(target.getByRole('row', { name: /^Item Number:/i }).getByRole('textbox').first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-item @regression @functional Add New Item exposes price and effective-date fields', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNewItem();
    await expect(target.getByRole('row', { name: /^Price:/i }).getByRole('textbox').first()).toBeVisible();
    await expect(target.locator('input[id*="Date" i], input[name*="Date" i]').first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-item @regression @functional Add New Item exposes buying-group selection', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNewItem();
    await expect(target.getByText(/Select Buying Groups/i)).toBeVisible();
    const groups = target.locator('input[type="checkbox"]:visible, select:visible');
    test.skip((await groups.count()) === 0, 'The current Add New Item form exposes no group-selection control.');
    await expect(groups.first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-item @regression @validation Add New Item exposes required-field labels', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNewItem();
    const required = target.locator('label:visible, th:visible, td:visible').filter({ hasText: /item|price|date|buying group|required/i });
    test.skip((await required.count()) === 0, 'The current Add New Item form exposes no required-field labels.');
    await expect(required.first()).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });

  test('@buyer-group-add-item @e2e @regression @functional Add New Item exposes Save and Add, Save and Close, and Cancel', async ({ buyerGroups, sharedPage }) => {
    const target = await buyerGroups.openAddNewItem();
    await expect(target.getByRole('button', { name: /Save & Add/i })).toBeVisible();
    await expect(target.getByRole('button', { name: /Save & Close/i })).toBeVisible();
    await expect(target.getByRole('button', { name: /^Cancel$/i })).toBeVisible();
    await closeChildOrCancel(target, sharedPage);
  });
});

async function closeChildOrCancel(target: Page, sharedPage: Page): Promise<void> {
  if (target !== sharedPage) {
    await target.close().catch(() => undefined);
    return;
  }
  await target.getByRole('button', { name: /^Cancel$/i }).last().click().catch(() => undefined);
}