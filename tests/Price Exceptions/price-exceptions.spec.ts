import { expect, test } from '../../fixtures/price-exceptions.fixture';
import {
  hasPriceExceptionsItemData,
  hasPriceExceptionsMutationData,
  hasPriceExceptionsUploadData,
  isPriceExceptionsBlankValidationEnabled,
} from '../../config/price-exceptions-data';
import { priceExceptionsLocators as locators } from '../../locators/price-exceptions.locators';

test.describe('Price Exceptions', () => {
  test('@price-exceptions @smoke @functional active Price Exceptions route loads', async ({ priceExceptions }) => {
    await priceExceptions.expectActiveLoaded();
  });

  test('@price-exceptions @smoke @functional active Price Exceptions exposes core controls', async ({ priceExceptions }) => {
    await priceExceptions.expectActiveCoreControls();
  });

  test('@price-exceptions @regression @navigation active Price Exceptions remains on Stage', async ({ priceExceptions }) => {
    await priceExceptions.expectActiveLoaded();
    expect(new URL(priceExceptions.currentPage.url()).hostname).toBe('stage.ashleynet.com');
  });

  test('@price-exceptions @regression @functional active Price Exceptions exposes configured environments', async ({ priceExceptions }) => {
    await priceExceptions.expectActiveLoaded();
    await priceExceptions.expectEnvironmentOptions();
  });

  test('@price-exceptions @regression @functional active Price Exceptions executes item search', async ({ priceExceptions }) => {
    await priceExceptions.searchActive();
  });

  test('@price-exceptions @regression @reporting active Price Exceptions executes the Reports selector', async ({ priceExceptions }) => {
    await priceExceptions.expectActiveLoaded();
    test.skip(await locators.reports(priceExceptions.currentPage).locator('option').count() === 0, 'Reports selector has no options in this environment.');
    await priceExceptions.selectFirstReport();
  });

  test('@price-exceptions @e2e @regression @functional active Price Exceptions exposes populated grid columns', async ({ priceExceptions }) => {
    test.skip(!hasPriceExceptionsItemData() || !(await priceExceptions.hasActiveRows()), 'An approved active Price Exception row is not available.');
    await priceExceptions.expectActiveGrid();
  });

  test('@price-exceptions @e2e @regression @functional active Price Exceptions exposes editable row fields', async ({ priceExceptions }) => {
    test.skip(!hasPriceExceptionsItemData() || !(await priceExceptions.hasActiveRows()), 'An approved active Price Exception row is not available.');
    await expect(locators.activeEditableFields(priceExceptions.currentPage).first()).toBeEditable();
  });

  test('@price-exceptions @e2e @regression active Price Exceptions safely cancels an unsaved row edit', async ({ priceExceptions }) => {
    test.skip(!hasPriceExceptionsItemData() || !(await priceExceptions.hasActiveRows()), 'An approved active Price Exception row is not available.');
    await priceExceptions.cancelUnsavedActiveEdit();
  });

  test('@price-exceptions @regression @functional active Price Exceptions safely toggles Delete All', async ({ priceExceptions }) => {
    await priceExceptions.toggleDeleteAllSafely();
  });

  test('@price-exceptions @e2e @regression @navigation active Price Exceptions opens Change All Dates', async ({ priceExceptions }) => {
    const target = await priceExceptions.openChangeDates();
    await priceExceptions.expectDatesLoaded(target);
    await priceExceptions.cancelTarget(target);
  });

  test('@price-exceptions @e2e @regression @navigation active Price Exceptions opens Add New Exception', async ({ priceExceptions }) => {
    const target = await priceExceptions.openAddNew();
    await priceExceptions.expectEditLoaded(target);
    await priceExceptions.cancelTarget(target);
  });

  test('@price-exceptions @regression @reporting active Price Exceptions downloads Excel export', async ({ priceExceptions }) => {
    await priceExceptions.expectActiveLoaded();
    test.skip(await locators.exportExcel(priceExceptions.currentPage).count() === 0, 'Excel export is not exposed in this environment.');
    const filename = await priceExceptions.exportToExcel();
    expect(filename.toLowerCase()).toMatch(/\.xls[xm]?$/);
  });

  test('@price-exceptions @e2e @regression @navigation active Price Exceptions opens Excel import', async ({ priceExceptions }) => {
    const target = await priceExceptions.openImport();
    await priceExceptions.expectImportLoaded(target);
    await priceExceptions.cancelTarget(target);
  });

  test('@price-exceptions @smoke @functional Add New Price Exception route loads', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await priceExceptions.expectEditLoaded();
  });

  test('@price-exceptions @smoke @functional Add New Price Exception exposes pricing fields', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await priceExceptions.expectEditFields();
  });

  test('@price-exceptions @regression @functional Add New Price Exception exposes save and cancel actions', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await priceExceptions.expectEditActions();
  });

  test('@price-exceptions @regression @functional Add New Price Exception exposes warehouse, freight, and reduction selectors', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await priceExceptions.expectEditSelectionControls();
  });

  test('@price-exceptions @regression @functional Add New Price Exception exposes discount, commission, and adjustment fields', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await priceExceptions.expectEditAdjustmentControls();
  });

  test('@price-exceptions @regression @functional Add New Price Exception exposes effective dates and calendar controls', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await priceExceptions.expectEditDateControls();
  });

  test('@price-exceptions @e2e @regression Add New Price Exception safely cancels without saving', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await locators.editItem(priceExceptions.currentPage).fill('AUTOMATION_ONLY');
    await priceExceptions.cancelTarget(priceExceptions.currentPage);
  });

  test('@price-exceptions @regression @validation Add New Price Exception validates blank input when explicitly enabled', async ({ priceExceptions }) => {
    test.skip(!isPriceExceptionsBlankValidationEnabled(), 'Blank validation is disabled by default.');
    await priceExceptions.gotoEditNew();
    await locators.editSaveClose(priceExceptions.currentPage).click();
    await expect(locators.validationMessage(priceExceptions.currentPage)).toBeVisible();
  });

  test('@price-exceptions @regression @functional Add New Price Exception starts with the selected environment', async ({ priceExceptions }) => {
    await priceExceptions.gotoEditNew();
    await expect(locators.editItem(priceExceptions.currentPage)).toBeVisible();
    await expect(priceExceptions.currentPage).toHaveURL(/envSelected=/i);
  });

  test('@price-exceptions @smoke @functional Change All Dates route loads', async ({ priceExceptions }) => {
    await priceExceptions.gotoChangeDates();
    await priceExceptions.expectDatesLoaded();
  });

  test('@price-exceptions @regression @functional Change All Dates exposes date and calendar controls', async ({ priceExceptions }) => {
    await priceExceptions.gotoChangeDates();
    await priceExceptions.expectDatesFields();
  });

  test('@price-exceptions @e2e @regression Change All Dates safely cancels without submitting', async ({ priceExceptions }) => {
    await priceExceptions.gotoChangeDates();
    await locators.datesFrom(priceExceptions.currentPage).fill('01/01/2030');
    await priceExceptions.cancelTarget(priceExceptions.currentPage);
  });

  test('@price-exceptions @regression @validation Change All Dates validates blank input when explicitly enabled', async ({ priceExceptions }) => {
    test.skip(!isPriceExceptionsBlankValidationEnabled(), 'Blank validation is disabled by default.');
    await priceExceptions.gotoChangeDates();
    await locators.datesSubmit(priceExceptions.currentPage).click();
    await expect(locators.validationMessage(priceExceptions.currentPage)).toBeVisible();
  });

  test('@price-exceptions @smoke @functional Excel import route loads', async ({ priceExceptions }) => {
    await priceExceptions.gotoImport();
    await priceExceptions.expectImportLoaded();
  });

  test('@price-exceptions @regression @functional Excel import exposes file, column, upload, and cancel controls', async ({ priceExceptions }) => {
    await priceExceptions.gotoImport();
    await priceExceptions.expectImportControls();
  });

  test('@price-exceptions @regression @functional Excel import selects all supported exception columns', async ({ priceExceptions }) => {
    await priceExceptions.gotoImport();
    await priceExceptions.selectImportDefaults();
  });

  test('@price-exceptions @e2e @regression Excel import safely cancels without uploading', async ({ priceExceptions }) => {
    await priceExceptions.gotoImport();
    await priceExceptions.expectImportControls();
    await priceExceptions.cancelTarget(priceExceptions.currentPage);
  });

  test('@price-exceptions @e2e @regression @functional Excel import uploads only with approved mutation data', async ({ priceExceptions }) => {
    test.skip(!hasPriceExceptionsUploadData(), 'Import requires explicit mutation enablement and an approved upload file.');
    await priceExceptions.gotoImport();
    await priceExceptions.uploadApprovedFile();
  });

  test('@price-exceptions @smoke @functional Inactive Price Exceptions route loads', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    await priceExceptions.expectInactiveLoaded();
  });

  test('@price-exceptions @smoke @functional Inactive Price Exceptions exposes search and Return controls', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    await priceExceptions.expectInactiveCoreControls();
  });

  test('@price-exceptions @regression @navigation Inactive Price Exceptions remains on Stage', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    await priceExceptions.expectInactiveLoaded();
    expect(new URL(priceExceptions.currentPage.url()).hostname).toBe('stage.ashleynet.com');
  });

  test('@price-exceptions @regression @functional Inactive Price Exceptions executes item search', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    await priceExceptions.searchInactive();
  });

  test('@price-exceptions @e2e @regression @inactive Inactive Price Exceptions exposes archived rows when available', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    test.skip(!hasPriceExceptionsItemData() || !(await priceExceptions.hasInactiveRows()), 'An approved inactive Price Exception row is not available.');
    await priceExceptions.expectInactiveGrid();
  });

  test('@price-exceptions @e2e @regression @inactive Inactive Price Exceptions exposes archived row columns when available', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    test.skip(!hasPriceExceptionsItemData() || !(await priceExceptions.hasInactiveRows()), 'An approved inactive Price Exception row is not available.');
    await priceExceptions.expectInactiveGrid();
  });

  test('@price-exceptions @e2e @regression @navigation Inactive Price Exceptions Return navigates to active Price Exceptions', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    await priceExceptions.returnToActive();
  });

  test('@price-exceptions @regression @functional Inactive Price Exceptions exposes configured environments', async ({ priceExceptions }) => {
    await priceExceptions.gotoInactive();
    await expect(locators.inactiveEnvironment(priceExceptions.currentPage).locator('option')).toHaveCount(2);
  });
});