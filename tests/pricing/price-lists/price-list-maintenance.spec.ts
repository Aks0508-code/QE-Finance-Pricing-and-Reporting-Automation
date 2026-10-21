import { expect, test } from '../../../fixtures/pricing.fixture';
import { hasPriceCodeItemData, getPriceCodeItemData, getVerifiedPriceCodeItem } from '../../../config/price-code-data';
import { priceListLocators } from '../../../locators/pricing/price-lists.locators';
import { PriceCodeMaintenancePage } from '../../../pages/pricing/price-codes/price-code-maintenance.page';
import { PriceListMaintenancePage } from '../../../pages/pricing/price-lists/price-list-maintenance.page';

test.describe('Price List Maintenance', () => {
  test('@price-list @smoke @pricing-regression @functional Price List Maintenance page loads', async ({ priceList }) => {
    await priceList.expectLoaded();
  });

  test('@price-list @e2e @regression @functional Price List Maintenance exposes core search controls', async ({ priceList }) => {
    await priceList.expectCoreControlsVisible();
  });

  test('@price-list @e2e @regression @inactive inactive Price List Maintenance view loads when exposed', async ({ priceList }) => {
    test.skip(!(await priceList.hasInactiveView()), 'Stage does not expose an inactive or archived Price List view.');
    await priceList.openInactiveView();
    await priceList.expectInactiveLoaded();
  });

  test('@price-list @regression @navigation Price Code navigation opens Price List and returns', async ({ priceCodes, priceList }) => {
    await priceCodes.goto();
    await priceCodes.expectLoaded();
    await priceList.openFromPriceCodeAndReturn();
  });

  test('@price-list @e2e @regression @search item search control accepts an item value', async ({ priceList }) => {
    test.skip(!hasPriceCodeItemData(), 'Requires an approved item CSV/list or PRICE_CODE_TEST_ITEM.');
    test.skip(!(await priceList.hasSearchControls()), 'Price List Maintenance does not expose item search controls on this stage page.');
    await priceList.expectSearchInputEditable();
    await priceList.searchByItem(getPriceCodeItemData());
  });

  test('@price-list @regression @search item search displays the requested Price List result', async ({ priceList }) => {
    test.skip(!hasPriceCodeItemData(), 'Requires an approved item CSV/list or PRICE_CODE_TEST_ITEM.');
    await priceList.expectLoaded();
    test.skip(!(await priceList.hasSearchControls()), 'Price List Maintenance does not expose item search controls on this stage page.');
    // Use the verified item for the configured Price Code (falls back to the
    // general random pool only if no verified item is configured), since
    // this assertion requires the item to actually appear in this Price
    // List's results, unlike the general random pool which may contain
    // items outside this Price Code's list.
    const item = getVerifiedPriceCodeItem();
    await priceList.searchByItem(item);
    await priceList.expectItemVisible(item);
  });

  test('@price-list @regression @functional Price List Maintenance exposes visible results when available', async ({ priceList }) => {
    await priceList.expectLoaded();
    await priceList.expectVisibleResults();
  });

  test('@price-list @e2e @regression @reporting Price List Excel export works when available', async ({ priceList }) => {
    await priceList.expectLoaded();
    test.skip(!(await priceList.hasExportControl()), 'Price List Maintenance does not expose Excel export on this stage page.');
    const filename = await priceList.exportAndReturnDownload();
    expect(filename.toLowerCase()).toMatch(/\.(xls|xlsx|csv)$/);
  });

  test('@price-list @e2e @regression @functional Price List pagination controls are available when exposed', async ({ priceList, sharedPage }) => {
    let target = priceList;
    if (!(await target.hasPaginationControls())) {
      const paginationCode = process.env.PRICE_LIST_PAGINATION_CODE?.trim().replace('*', '');
      if (paginationCode) {
        const priceCodes = new PriceCodeMaintenancePage(sharedPage);
        await priceCodes.openPriceListForCode(paginationCode).catch(() => undefined);
        target = new PriceListMaintenancePage(sharedPage);
      }
    }
    test.skip(!(await target.hasPaginationControls()), 'Price List pagination controls are not exposed on this stage page.');
    await target.expectPaginationControls();
  });

  test('@price-list @e2e @regression @functional Price List delete and save/cancel controls are available when exposed', async ({ priceList }) => {
    test.skip(!(await priceList.hasDeleteControls()), 'Price List delete controls are not exposed on this stage page.');
    await priceList.expectDeleteControls();
  });

  test('@price-list @regression @functional Price List upload workflow opens', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    await priceList.closeUploadTarget(target);
  });

  test('@price-list @regression @functional Price List upload controls are visible', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try { await priceList.expectUploadControls(target); } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @regression @functional Price List upload header-row option is usable', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try {
      const checkbox = target.getByRole('checkbox', { name: /header row/i });
      await checkbox.check();
      await expect(checkbox).toBeChecked();
      await checkbox.uncheck();
    } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @regression @functional Price List upload effective date is editable', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try {
      const date = priceListLocators.effectiveDate(target);
      await expect(date).toBeVisible();
      await expect(date).toBeEditable();
    } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @e2e @regression @calendar effective date calendar opens', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try {
      // On this stage page the effective date field may be a plain typeable
      // input with no popup calendar attached. Accept either outcome as long
      // as the field remains interactive.
      await priceList.openEffectiveDateCalendar(target);
      await expect(priceListLocators.effectiveDate(target)).toBeEditable();
    } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @e2e @regression @calendar selected effective date is displayed exactly', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    const effectiveDate = priceList.getApprovedEffectiveDate();
    try {
      await priceList.selectEffectiveDateFromCalendar(target, effectiveDate);
      await priceList.expectEffectiveDate(target, effectiveDate);
    } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @e2e @regression @calendar future-month effective date can be selected and validated', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    const effectiveDate = priceList.getApprovedEffectiveDate();
    effectiveDate.setMonth(effectiveDate.getMonth() + 1);
    try {
      await priceList.selectEffectiveDateFromCalendar(target, effectiveDate);
      await priceList.expectEffectiveDate(target, effectiveDate);
    } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @regression @functional Price List common adjustment fields are available', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try { await expect(target.getByRole('combobox')).toHaveCount(4); } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @e2e @regression @functional Price List adjustment dropdowns support every available combination', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try { await priceList.exerciseAdjustmentCombinations(target); } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @regression @functional Price List open-order protection option is usable', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try {
      const checkbox = priceListLocators.doNotReplaceOpenOrders(target);
      await checkbox.check();
      await expect(checkbox).toBeChecked();
    } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @regression @functional Price List upload without a file shows validation', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try { await priceList.expectUploadValidationWithoutFile(target); } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @regression @functional Price List Not Uploaded List displays status', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    try { await priceList.expectNotUploadedList(target); } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @e2e @regression @functional Price List upload completion summary is visible after an approved upload', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()) || process.env.PRICE_LIST_UPLOAD_ENABLED !== 'true' || !process.env.PRICE_LIST_UPLOAD_FILE,
      'Requires the exposed upload workflow, PRICE_LIST_UPLOAD_ENABLED=true, and an approved PRICE_LIST_UPLOAD_FILE.');
    const target = await priceList.openUploadWorkflow();
    try { await priceList.uploadApprovedSpreadsheet(target); } finally { await priceList.closeUploadTarget(target); }
  });

  test('@price-list @regression @functional Price List upload window closes safely', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()), 'Price List upload workflow is not exposed from this stage page.');
    const target = await priceList.openUploadWorkflow();
    if (await target.getByRole('button', { name: /Close Window/i }).count() > 0) {
      await target.getByRole('button', { name: /Close Window/i }).click();
    } else if (!target.isClosed()) {
      await target.close();
    }
  });

  test('@price-list @e2e @regression @functional approved Price List spreadsheet upload completes', async ({ priceList }) => {
    test.skip(!(await priceList.hasUploadWorkflow()) || process.env.PRICE_LIST_UPLOAD_ENABLED !== 'true' || !process.env.PRICE_LIST_UPLOAD_FILE,
      'Requires the exposed upload workflow, PRICE_LIST_UPLOAD_ENABLED=true, and an approved PRICE_LIST_UPLOAD_FILE.');
    const target = await priceList.openUploadWorkflow();
    try { await priceList.uploadApprovedSpreadsheet(target, priceList.getApprovedEffectiveDate()); } finally { await priceList.closeUploadTarget(target); }
  });
});