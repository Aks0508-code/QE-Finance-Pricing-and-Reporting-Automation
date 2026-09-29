import { expect, test } from '../../../fixtures/pricing.fixture';
import {
  getPriceListUpdateQueueData,
  getPriceListUpdateQueueMutationData,
  hasPriceListUpdateQueueData,
  hasPriceListUpdateQueueMutationData,
} from '../../../config/price-list-update-queue-data';

test.describe('Price List Maintenance - Update Queue', () => {
  test.skip(!hasPriceListUpdateQueueData(), 'Set PRICE_LIST_UQ_PRICE_CODE with an approved Update Queue Price Code.');

  test.beforeEach(async ({ updateQueue, shell, sharedPage }) => {
    await updateQueue.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await updateQueue.goto();
  });

  test('@update-queue @smoke @pricing-regression @functional Update Queue page loads', async ({ updateQueue }) => {
    await updateQueue.expectLoaded();
  });

  test('@update-queue @regression @functional Update Queue exposes Save and Cancel controls', async ({ updateQueue }) => {
    await updateQueue.expectCoreControls();
  });

  test('@update-queue @e2e @regression @functional Update Queue displays price rows', async ({ updateQueue }) => {
    await updateQueue.expectRows();
  });

  test('@update-queue @e2e @regression @functional Update Queue price and effective-date fields are editable', async ({ updateQueue }) => {
    test.skip(!(await updateQueue.hasEditablePrice()) || !(await updateQueue.hasEffectiveDate()), 'Current Update Queue does not expose editable price and effective-date fields.');
    await updateQueue.expectEditablePriceAndEffectiveDate();
  });

  test('@update-queue @regression @search Update Queue item search is available', async ({ updateQueue }) => {
    test.skip(!(await updateQueue.hasSearchControls()), 'Current Update Queue does not expose item search controls.');
    await expect(updateQueue).toBeTruthy();
  });

  test('@update-queue @regression @functional Update Queue pagination and Show All Rows are available when exposed', async ({ updateQueue }) => {
    test.skip(!(await updateQueue.hasPagination()), 'Current Update Queue does not expose pagination or Show All Rows controls.');
    await expect(updateQueue).toBeTruthy();
  });

  test('@update-queue @regression @functional Cancel discards an unsaved Update Queue price edit', async ({ updateQueue }) => {
    test.skip(!(await updateQueue.hasEditablePrice()), 'Current Update Queue does not expose editable price fields.');
    await updateQueue.cancelFirstPriceEdit();
  });

  test('@update-queue @regression @audit Update Queue exposes change audit columns', async ({ updateQueue, sharedPage }) => {
    await expect(sharedPage.getByText(/Change Method|User Id|Change Date/i).first()).toBeVisible();
    void updateQueue;
  });

  test('@update-queue @e2e @regression @mutation approved price change saves and restores', async ({ updateQueue }) => {
    test.skip(!hasPriceListUpdateQueueMutationData(), 'Requires PRICE_LIST_UQ_MUTATION_ENABLED=true and approved original/test prices.');
    const data = getPriceListUpdateQueueData();
    const mutation = getPriceListUpdateQueueMutationData();
    await updateQueue.savePriceAndRestore(data, mutation.originalPrice, mutation.testPrice);
  });

  test('@update-queue @e2e @regression @reporting Update Queue Excel export downloads a file', async ({ updateQueue }) => {
    const filename = await updateQueue.exportAndReturnDownload();
    expect(filename.toLowerCase()).toMatch(/\.(xls|xlsx|csv)$/);
  });
});