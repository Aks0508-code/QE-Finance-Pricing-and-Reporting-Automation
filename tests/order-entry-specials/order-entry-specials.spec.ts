import { expect, test } from '../../fixtures/order-entry-specials.fixture';
import { isOrderEntrySpecialsBlankValidationEnabled, isOrderEntrySpecialsMutationEnabled } from '../../config/order-entry-specials-data';
import { orderEntrySpecialsLocators as locators } from '../../locators/order-entry-specials.locators';

test.describe('Order Entry Specials', () => {
  test('@order-entry-specials @smoke @functional Order Entry Specials route loads', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.expectLoaded();
  });

  test('@order-entry-specials @smoke @functional Order Entry Specials exposes core maintenance controls', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.expectCoreControls();
  });

  test('@order-entry-specials @regression @navigation Order Entry Specials stays on the approved Stage host', async ({ orderEntrySpecials, sharedPage }) => {
    await orderEntrySpecials.expectLoaded();
    expect(new URL(sharedPage.url()).hostname).toBe('stage.ashleynet.com');
  });

  test('@order-entry-specials @regression @functional Order Entry Specials Environment selector exposes options', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.expectEnvironmentOptions();
  });

  test('@order-entry-specials @e2e @regression @functional Order Entry Specials grid exposes confirmed headers and rows', async ({ orderEntrySpecials }) => {
    test.skip(!(await orderEntrySpecials.hasMainRows()), 'The current environment exposes no Specials grid rows.');
    await orderEntrySpecials.expectMainGrid();
  });

  test('@order-entry-specials @e2e @regression @functional Order Entry Specials rows expose editable maintenance fields', async ({ orderEntrySpecials }) => {
    test.skip(!(await orderEntrySpecials.hasMainRows()), 'The current environment exposes no editable Specials rows.');
    await expect(locators.mainEditableInputs(orderEntrySpecials.currentPage).first()).toBeEditable();
  });

  test('@order-entry-specials @e2e @regression @functional Order Entry Specials Cancel discards an unsaved row edit', async ({ orderEntrySpecials }) => {
    test.skip(!(await orderEntrySpecials.hasMainRows()), 'The current environment exposes no editable Specials rows.');
    test.skip(!isOrderEntrySpecialsMutationEnabled(), 'Unsaved mutation coverage requires explicit Order Entry enablement.');
    await orderEntrySpecials.cancelFirstUnsavedMainEdit();
  });

  test('@order-entry-specials @regression @reporting Order Entry Specials Export To Excel downloads a spreadsheet', async ({ orderEntrySpecials }) => {
    test.skip(!(await locators.exportToExcel(orderEntrySpecials.currentPage).count()), 'The current page does not expose Export To Excel.');
    const filename = await orderEntrySpecials.exportAndReturnFilename();
    expect(filename.toLowerCase()).toMatch(/\.(xls|xlsx|csv)$/);
  });

  test('@order-entry-specials @e2e @regression @navigation Order Entry Specials opens the confirmed Detail route', async ({ orderEntrySpecials }) => {
    const target = await orderEntrySpecials.openDetail();
    await orderEntrySpecials.expectDetailForm(target);
    await closeChild(target);
  });

  test('@order-entry-specials @e2e @regression @navigation Order Entry Specials opens the Excluded Items route', async ({ orderEntrySpecials }) => {
    const target = await orderEntrySpecials.openExcludedItems();
    await orderEntrySpecials.expectExcludedLoaded(target);
    await expect(target).toHaveURL(/\/OrderEntrySpecials\/ExcludedItems\.aspx/i);
    await closeChild(target);
  });

  test('@order-entry-specials @smoke @functional Add/Edit Special route loads', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoAddEdit();
    await orderEntrySpecials.expectAddEditForm();
  });

  test('@order-entry-specials @e2e @regression @navigation Add/Edit Special opens from Add New and safely cancels', async ({ orderEntrySpecials }) => {
    const target = await orderEntrySpecials.openAddEdit();
    await orderEntrySpecials.expectAddEditForm(target);
    await orderEntrySpecials.cancelTarget(target);
  });

  test('@order-entry-specials @regression @functional Add/Edit Special exposes labeled form controls', async ({ orderEntrySpecials, sharedPage }) => {
    await orderEntrySpecials.gotoAddEdit();
    const labels = sharedPage.locator('label:visible, th:visible, td:visible').filter({ hasText: /code|description|date|discount|currency|special/i });
    test.skip(await labels.count() === 0, 'The Add/Edit Special form exposes no labeled fields in this environment.');
    await expect(labels.first()).toBeVisible();
  });

  test('@order-entry-specials @regression @functional Add/Edit Special exposes selection controls when configured', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoAddEdit();
    const selections = locators.visibleSelects(orderEntrySpecials.currentPage).or(orderEntrySpecials.currentPage.locator('input[type="checkbox"]:visible'));
    test.skip(await selections.count() === 0, 'The Add/Edit Special form exposes no selection controls.');
    await expect(selections.first()).toBeVisible();
  });

  test('@order-entry-specials @regression @functional Add/Edit Special exposes Save and Cancel controls', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoAddEdit();
    await expect(locators.save(orderEntrySpecials.currentPage)).toBeVisible();
    await expect(locators.cancel(orderEntrySpecials.currentPage)).toBeVisible();
  });

  test('@order-entry-specials @regression @validation Add/Edit Special rejects blank input when explicitly enabled', async ({ orderEntrySpecials }) => {
    test.skip(!isOrderEntrySpecialsBlankValidationEnabled(), 'Blank Add/Edit Special validation is disabled by default.');
    await orderEntrySpecials.gotoAddEdit();
    await locators.save(orderEntrySpecials.currentPage).click();
    await expect(locators.validationMessage(orderEntrySpecials.currentPage)).toBeVisible();
  });

  test('@order-entry-specials @smoke @functional Specials Detail route loads', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoDetail();
    await orderEntrySpecials.expectDetailForm();
  });

  test('@order-entry-specials @e2e @regression @functional Specials Detail exposes a detail grid or visible item content', async ({ orderEntrySpecials, sharedPage }) => {
    await orderEntrySpecials.gotoDetail();
    const content = locators.detailGrid(sharedPage).or(sharedPage.getByText(/Item|Series|Special/i).first());
    test.skip(await content.count() === 0, 'The current Specials Detail route exposes no item/detail content.');
    await expect(content.first()).toBeVisible();
  });

  test('@order-entry-specials @regression @functional Specials Detail exposes visible controls or links', async ({ orderEntrySpecials, sharedPage }) => {
    await orderEntrySpecials.gotoDetail();
    const controls = locators.visibleInputs(sharedPage).or(sharedPage.getByRole('link').filter({ hasText: /Item|Series|Special/i }));
    test.skip(await controls.count() === 0, 'The current Specials Detail route exposes no visible controls or links.');
    await expect(controls.first()).toBeVisible();
  });

  test('@order-entry-specials @e2e @regression @navigation Specials Detail can open the Item/Series Add/Edit route', async ({ orderEntrySpecials }) => {
    const target = await orderEntrySpecials.openItemEdit();
    await orderEntrySpecials.expectItemForm(target);
    await closeChild(target);
  });

  test('@order-entry-specials @smoke @functional Specials Item/Series Add/Edit route loads', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoItemEdit();
    await orderEntrySpecials.expectItemForm();
  });

  test('@order-entry-specials @regression @functional Specials Item/Series form exposes editable controls', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoItemEdit();
    const controls = locators.visibleInputs(orderEntrySpecials.currentPage);
    test.skip(await controls.count() === 0, 'The current Item/Series form exposes no editable controls.');
    await expect(controls.first()).toBeEnabled();
  });

  test('@order-entry-specials @regression @functional Specials Item/Series form exposes selection options when configured', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoItemEdit();
    const selections = locators.visibleSelects(orderEntrySpecials.currentPage).or(orderEntrySpecials.currentPage.locator('input[type="checkbox"]:visible'));
    test.skip(await selections.count() === 0, 'The current Item/Series form exposes no selection options.');
    await expect(selections.first()).toBeVisible();
  });

  test('@order-entry-specials @e2e @regression @functional Specials Item/Series form exposes a safe Cancel path', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoItemEdit();
    const cancel = locators.cancel(orderEntrySpecials.currentPage);
    test.skip(await cancel.count() === 0, 'The current Item/Series form exposes no Cancel control.');
    await expect(cancel).toBeVisible();
  });

  test('@order-entry-specials @smoke @functional Specials Excluded Items route loads', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoExcludedItems();
    await orderEntrySpecials.expectExcludedLoaded();
  });

  test('@order-entry-specials @regression @functional Specials Excluded Items exposes import, export, Add New, Save, and Cancel controls', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoExcludedItems();
    await orderEntrySpecials.expectExcludedCoreControls();
  });

  test('@order-entry-specials @e2e @regression @functional Specials Excluded Items exposes item and series rows when records are available', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoExcludedItems();
    test.skip(!(await orderEntrySpecials.hasRows(locators.excludedRows)), 'The current environment exposes no Excluded Items rows.');
    await orderEntrySpecials.expectExcludedRows();
  });

  test('@order-entry-specials @e2e @regression @navigation Add New Specials Excluded Item opens from Excluded Items', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoExcludedItems();
    const target = await orderEntrySpecials.openExcludedItemNew();
    await closeChild(target);
  });

  test('@order-entry-specials @regression @functional Add New Specials Excluded Item exposes item, series, Save, and Cancel controls', async ({ orderEntrySpecials }) => {
    await orderEntrySpecials.gotoExcludedItemNew();
    await orderEntrySpecials.expectExcludedNewForm();
  });

  test('@order-entry-specials @e2e @regression @validation Add New Specials Excluded Item rejects blank input when explicitly enabled', async ({ orderEntrySpecials }) => {
    test.skip(!isOrderEntrySpecialsBlankValidationEnabled(), 'Blank Excluded Item validation is disabled by default.');
    await orderEntrySpecials.gotoExcludedItemNew();
    await locators.excludedNewSave(orderEntrySpecials.currentPage).click();
    await expect(locators.validationMessage(orderEntrySpecials.currentPage)).toBeVisible();
  });
});

async function closeChild(target: import('@playwright/test').Page): Promise<void> {
  if (!target.isClosed()) await target.close().catch(() => undefined);
}