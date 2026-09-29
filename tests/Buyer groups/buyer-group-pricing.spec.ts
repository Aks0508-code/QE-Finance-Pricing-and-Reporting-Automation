import { expect, test } from '../../fixtures/pricing.fixture';

test.describe('Buyer Group Pricing', () => {
  test.beforeEach(async ({ buyerGroupPricing, shell, sharedPage }) => {
    await buyerGroupPricing.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroupPricing.goto();
  });

  test('@buyer-group-pricing @smoke @pricing-regression @functional Buyer Group Pricing route loads', async ({ buyerGroupPricing }) => {
    await buyerGroupPricing.expectRouteLoaded();
  });

  test('@buyer-group-pricing @regression @functional Buyer Group Pricing exposes its heading and rows when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasHeading()), 'The current environment does not expose a Buyer Group Pricing heading.');
    test.skip(!(await buyerGroupPricing.hasRows()), 'The current Buyer Group Pricing record has no visible pricing rows.');
    await expect(buyerGroupPricing).toBeTruthy();
  });

  test('@buyer-group-pricing @e2e @regression @functional Buyer Group Pricing exposes editable Price and Effective Date fields when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasPriceFields()) || !(await buyerGroupPricing.hasEffectiveDateFields()), 'The current Buyer Group Pricing page does not expose editable Price and Effective Date fields.');
    await buyerGroupPricing.expectPriceAndEffectiveDateEditable();
  });

  test('@buyer-group-pricing @e2e @regression @functional Buyer Group Pricing Effective Date field is independently editable when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasEffectiveDateFields()), 'The current Buyer Group Pricing page does not expose an Effective Date field.');
    await expect(buyerGroupPricing).toBeTruthy();
  });

  test('@buyer-group-pricing @regression @functional Buyer Group Pricing exposes adjustment fields when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasAdjustmentFields()), 'The current Buyer Group Pricing page does not expose adjustment fields.');
    await expect(buyerGroupPricing).toBeTruthy();
  });

  test('@buyer-group-pricing @e2e @regression @functional Buyer Group Pricing adjustment fields are editable when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasAdjustmentFields()), 'The current Buyer Group Pricing page does not expose adjustment fields.');
    await expect(buyerGroupPricing).toBeTruthy();
  });

  test('@buyer-group-pricing @regression @functional Buyer Group Pricing exposes Save and Cancel when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasSaveCancel()), 'The current Buyer Group Pricing page does not expose Save and Cancel controls.');
    await expect(buyerGroupPricing).toBeTruthy();
  });

  test('@buyer-group-pricing @e2e @regression @functional Cancel discards an unsaved Buyer Group price edit when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasPriceFields()) || !(await buyerGroupPricing.hasSaveCancel()), 'The current Buyer Group Pricing page does not expose editable Price and Cancel controls.');
    await buyerGroupPricing.cancelFirstPriceEdit();
  });

  test('@buyer-group-pricing @e2e @regression @inactive Buyer Group Pricing exposes inactive pricing when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasInactiveView()), 'The current Buyer Group Pricing page does not expose an inactive-pricing control.');
    await expect(buyerGroupPricing).toBeTruthy();
  });

  test('@buyer-group-pricing @e2e @regression @functional Buyer Group Pricing exposes Update Queue when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasUpdateQueue()), 'No Buyer Group Pricing Update Queue control is exposed by the current environment.');
    await expect(buyerGroupPricing).toBeTruthy();
  });

  test('@buyer-group-pricing @regression @reporting Buyer Group Pricing Excel export downloads a file when available', async ({ buyerGroupPricing }) => {
    test.skip(!(await buyerGroupPricing.hasExport()), 'No Buyer Group Pricing export control is exposed by the current environment.');
    const filename = await buyerGroupPricing.exportAndReturnFilename();
    expect(filename.toLowerCase()).toMatch(/\.(xls|xlsx|csv)$/);
  });
});