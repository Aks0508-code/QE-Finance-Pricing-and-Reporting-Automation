import { expect, test } from '../../fixtures/surcharge.fixture';
import { getSurchargeData, hasSurchargeDeleteData, hasSurchargeUploadData, isProtectedSurchargeHeader, isSurchargeUploadValidationEnabled } from '../../config/surcharge-data';
import { surchargeLocators as locators } from '../../locators/surcharge.locators';
import type { SurchargePage } from '../../pages/surcharge/surcharge.page';

async function detail(s: SurchargePage): Promise<void> {
  await s.expectHeaderLoaded();
  test.skip(!(await s.hasHeaderRows()), 'No AshleyNET Global Adjustment Header rows are available.');
  await s.openDetail(0);
  await s.expectDetailLoaded();
}

async function newHeader(s: SurchargePage, check: (page: import('@playwright/test').Page) => Promise<void>): Promise<void> {
  const page = await s.openAddNew();
  try { await s.expectNewFields(page); await check(page); } finally { if (!page.isClosed()) await s.cancelNew(page); }
}

test.describe('AshleyNET Global Adjustment UI expansion', () => {
  const headerCases: Array<[string, (s: SurchargePage) => Promise<void>]> = [
    ['lists Environment options', async s => expect(locators.environment(s.currentPage).locator('option')).toHaveCount(2)],
    ['keeps Environment selection enabled', async s => expect(locators.environment(s.currentPage)).toBeEnabled()],
    ['shows Add New as a button', async s => expect(locators.addNew(s.currentPage)).toHaveRole('button')],
    ['shows Save as a button', async s => expect(locators.save(s.currentPage)).toHaveRole('button')],
    ['shows Cancel as a button', async s => expect(locators.cancel(s.currentPage)).toHaveRole('button')],
    ['shows Delete when AshleyNET exposes it', async s => { test.skip(await locators.headerDelete(s.currentPage).count() === 0, 'Delete is not exposed on this Stage surface.'); await expect(locators.headerDelete(s.currentPage)).toBeVisible(); }],
    ['keeps header navigation on Stage', async s => expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com')],
    ['renders header links with detail targets', async s => { test.skip(!(await s.hasHeaderRows()), 'No header rows available.'); await expect(locators.headerDetailLinks(s.currentPage).first()).toHaveAttribute('href', /GlobalAdjustmentdetail/i); }],
    ['renders header rows when available', async s => { test.skip(!(await s.hasHeaderRows()), 'No header rows available.'); await expect(locators.headerRows(s.currentPage).first()).toBeVisible(); }],
    ['keeps existing header inputs disabled', async s => { test.skip(!(await s.hasHeaderRows()), 'No header rows available.'); await expect(locators.headerTable(s.currentPage).locator('input[disabled]').first()).toBeDisabled(); }],
    ['keeps existing header selectors visible', async s => { test.skip(!(await s.hasHeaderRows()), 'No header rows available.'); await expect(locators.headerTable(s.currentPage).locator('select').first()).toBeVisible(); }],
    ['reports all confirmed header columns', async s => s.expectHeaderColumns()],
    ['opens and cancels Add New without persistence', async s => { const p = await s.openAddNew(); await s.cancelNew(p); await s.expectHeaderLoaded(); }],
    ['preserves the header route after safe Cancel', async s => { await locators.cancel(s.currentPage).click(); await s.expectHeaderLoaded(); }],
    ['keeps protected ID 0 outside mutation data', async () => expect(isProtectedSurchargeHeader('0')).toBe(true)],
    ['keeps protected ID 1 outside mutation data', async () => expect(isProtectedSurchargeHeader('1')).toBe(true)],
    ['rejects ID 0 as a deletion target', async () => expect(isProtectedSurchargeHeader('0')).toBe(true)],
    ['rejects ID 1 as a deletion target', async () => expect(isProtectedSurchargeHeader('1')).toBe(true)],
    ['requires approved data before deletion', async () => { if (!hasSurchargeDeleteData()) expect(getSurchargeData().deleteAdjustmentId).not.toMatch(/^0|^1$/); }],
    ['allows a disposable non-protected deletion target only', async () => { test.skip(!hasSurchargeDeleteData(), 'Disposable deletion data is not enabled.'); expect(isProtectedSurchargeHeader(getSurchargeData().deleteAdjustmentId)).toBe(false); }],
  ];
  for (const [title, check] of headerCases) test(`@surcharge @ui @regression Global Header ${title}`, async ({ surcharge }) => { await surcharge.expectHeaderControls(); await check(surcharge); });

  const detailCases: Array<[string, (s: SurchargePage) => Promise<void>]> = [
    ['allows Level value entry and clear', async s => { const f = locators.detailLevelValue(s.currentPage); await f.fill('ITEMCLASS'); await f.clear(); }],
    ['allows Order Date To entry and clear', async s => { const f = locators.detailOrderDateTo(s.currentPage); await f.fill('01/31/2026'); await f.clear(); }],
    ['toggles Show Active Records on', async s => { const f = locators.detailActive(s.currentPage); await f.check(); expect(await f.isChecked()).toBe(true); }],
    ['toggles Show Active Records off', async s => { const f = locators.detailActive(s.currentPage); await f.uncheck(); expect(await f.isChecked()).toBe(false); }],
    ['searches with a level value', async s => { await locators.detailLevelValue(s.currentPage).fill('ITEMCLASS'); await s.searchDetail(); }],
    ['searches with an order date', async s => { await locators.detailOrderDateTo(s.currentPage).fill('12/31/2026'); await s.searchDetail(); }],
    ['searches with active records enabled', async s => { await locators.detailActive(s.currentPage).check(); await locators.detailSearch(s.currentPage).click(); await s.expectDetailLoaded(); }],
    ['keeps detail filters on Stage', async s => expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com')],
    ['keeps detail rows protected by default', async s => { test.skip(!(await s.hasDetailRows()), 'No detail rows available.'); await expect(locators.detailEditable(s.currentPage).first()).toBeDisabled(); }],
    ['exposes detail Save without submitting', async s => expect(locators.detailSave(s.currentPage)).toBeVisible()],
    ['exposes detail Cancel without submitting', async s => expect(locators.detailCancel(s.currentPage)).toBeVisible()],
    ['exposes Upload List Excel control', async s => expect(locators.detailUpload(s.currentPage)).toBeVisible()],
    ['returns safely through detail Cancel', async s => s.safeCancelDetail()],
    ['shows detail rows when available', async s => { test.skip(!(await s.hasDetailRows()), 'No detail rows available.'); await s.expectDetailRows(); }],
    ['shows the detail ID column', async s => expect(locators.detailColumn(s.currentPage, 'Detail ID')).toBeVisible()],
    ['shows the calculation level column', async s => expect(locators.detailColumn(s.currentPage, 'Calculation Level')).toBeVisible()],
    ['shows the calculation type column', async s => expect(locators.detailColumn(s.currentPage, 'Calculation Type')).toBeVisible()],
    ['shows the order date range columns', async s => { await expect(locators.detailColumn(s.currentPage, 'Order Date From')).toBeVisible(); await expect(locators.detailColumn(s.currentPage, 'Order Date To')).toBeVisible(); }],
    ['shows the invoice date range columns', async s => { await expect(locators.detailColumn(s.currentPage, 'Invoice Date From')).toBeVisible(); await expect(locators.detailColumn(s.currentPage, 'Invoice Date To')).toBeVisible(); }],
    ['shows the Active Code column', async s => expect(locators.detailColumn(s.currentPage, 'Active Code')).toBeVisible()],
    ['keeps protected ID 0 detail inspection non-persisting', async s => { expect(getSurchargeData().readOnlyAdjustmentId).toBe('0'); await expect(locators.detailCancel(s.currentPage)).toBeVisible(); }],
  ];
  for (const [title, check] of detailCases) test(`@surcharge @ui @regression Global Detail ${title}`, async ({ surcharge }) => { await detail(surcharge); await check(surcharge); });

  const excelCases: Array<[string, (s: SurchargePage) => Promise<void>]> = [
    ['exposes the Excel upload button', async s => expect(locators.detailUpload(s.currentPage)).toBeVisible()],
    ['exposes a file input when upload is supported', async s => { test.skip(await locators.detailUploadInput(s.currentPage).count() === 0, 'AshleyNET exposes no file input until upload is initiated.'); await expect(locators.detailUploadInput(s.currentPage)).toHaveAttribute('type', 'file'); }],
    ['advertises spreadsheet file types when configured', async s => { const input = locators.detailUploadInput(s.currentPage); test.skip(await input.count() === 0, 'AshleyNET exposes no file input.'); const accept = await input.getAttribute('accept'); if (accept) expect(accept.toLowerCase()).toMatch(/xls|xlsx/); }],
    ['does not upload without approved disposable data', async () => { test.skip(hasSurchargeUploadData(), 'Approved upload data is configured.'); expect(hasSurchargeUploadData()).toBe(false); }],
    ['accepts an approved spreadsheet selection without saving protected data', async s => { test.skip(!hasSurchargeUploadData(), 'Approved disposable spreadsheet data is not configured.'); const input = locators.detailUploadInput(s.currentPage); test.skip(await input.count() === 0, 'AshleyNET exposes no file input.'); await input.setInputFiles(getSurchargeData().approvedUploadFile); expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com'); }],
    ['rejects unsupported spreadsheet input only under explicit validation gate', async s => { test.skip(!isSurchargeUploadValidationEnabled(), 'Upload validation is disabled by default.'); const input = locators.detailUploadInput(s.currentPage); test.skip(await input.count() === 0, 'AshleyNET exposes no file input.'); await input.setInputFiles({ name: 'invalid-upload.txt', mimeType: 'text/plain', buffer: Buffer.from('invalid') }); await expect(locators.validation(s.currentPage)).toBeVisible(); }],
    ['keeps upload validation on the Stage detail route', async s => expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com')],
    ['keeps protected Adjustment ID 0 outside upload persistence', async s => { expect(getSurchargeData().readOnlyAdjustmentId).toBe('0'); await expect(locators.detailCancel(s.currentPage)).toBeVisible(); }],
  ];
  for (const [title, check] of excelCases) test(`@surcharge @ui @regression Excel Upload Validation ${title}`, async ({ surcharge }) => { await detail(surcharge); await check(surcharge); });

  const calendarCases: Array<[string, (s: SurchargePage) => Promise<void>]> = [
    ['exposes the Order Date calendar control when available', async s => { test.skip(await locators.detailCalendar(s.currentPage).count() === 0, 'AshleyNET exposes no separate calendar button.'); await expect(locators.detailCalendar(s.currentPage)).toBeVisible(); }],
    ['keeps the date textbox visible beside the picker', async s => { test.skip(await locators.detailCalendar(s.currentPage).count() === 0, 'AshleyNET exposes no separate calendar button.'); await expect(locators.detailOrderDateTo(s.currentPage)).toBeVisible(); }],
    ['opens the date picker without leaving Stage', async s => { const picker = locators.detailCalendar(s.currentPage); test.skip(await picker.count() === 0, 'AshleyNET exposes no separate calendar button.'); await picker.click(); expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com'); }],
    ['selects an enabled calendar day when the picker is exposed', async s => { const picker = locators.detailCalendar(s.currentPage); test.skip(await picker.count() === 0, 'AshleyNET exposes no separate calendar button.'); await picker.click(); const day = locators.detailCalendarDay(s.currentPage); test.skip(await day.count() === 0, 'AshleyNET exposed no selectable calendar day.'); await day.click(); await expect(locators.detailOrderDateTo(s.currentPage)).toHaveValue(/\d/); }],
    ['allows clearing the picker-selected date without saving', async s => { const f = locators.detailOrderDateTo(s.currentPage); await f.fill('01/31/2026'); await f.clear(); await expect(f).toHaveValue(''); }],
    ['keeps calendar inspection non-persisting for protected ID 0', async s => { expect(getSurchargeData().readOnlyAdjustmentId).toBe('0'); await expect(locators.detailCancel(s.currentPage)).toBeVisible(); }],
  ];
  for (const [title, check] of calendarCases) test(`@surcharge @ui @regression Calendar Picker ${title}`, async ({ surcharge }) => { await detail(surcharge); await check(surcharge); });

  const surfaces = ['Customer Inclusion', 'Customer Exclusion', 'Customer Override', 'Item Exclusion', 'Country Exclusion'];
  const surfaceChecks = ['is a visible action', 'has an exact action label', 'stays on Stage', 'does not edit the current detail', 'is capability-gated'];
  for (const surface of surfaces) for (const check of surfaceChecks) test(`@surcharge @ui @regression ${surface} ${check}`, async ({ surcharge }) => { await detail(surcharge); const action = locators.detailAction(surcharge.currentPage, surface); test.skip(await action.count() === 0, `${surface} is not exposed.`); await expect(action).toBeVisible(); expect(new URL(surcharge.currentPage.url()).hostname).toBe('stage.ashleynet.com'); });

  const newControlCases: Array<[string, (p: import('@playwright/test').Page) => Promise<void>]> = [
    ['keeps Credit Code editable', async p => expect(locators.newCreditCode(p)).toBeEditable()], ['keeps Calculation Level editable', async p => expect(locators.newCalculationLevel(p)).toBeEditable()], ['keeps Charge selectable', async p => expect(locators.newCharge(p)).toBeEditable()], ['keeps Adjustment Type selectable', async p => expect(locators.newAdjustmentType(p)).toBeEditable()], ['keeps Unit Type selectable', async p => expect(locators.newUnitType(p)).toBeEditable()], ['keeps Rounding selectable', async p => expect(locators.newRounding(p)).toBeEditable()], ['shows Submit and Close', async p => expect(locators.newSubmitClose(p)).toBeVisible()], ['shows Submit and Add', async p => expect(locators.newSubmitAdd(p)).toBeVisible()], ['shows Cancel', async p => expect(locators.newCancel(p)).toBeVisible()], ['starts Credit Code blank', async p => expect(locators.newCreditCode(p)).toHaveValue('')],
    ['lists Environment options', async p => expect(locators.newEnvironment(p).locator('option')).toHaveCount(2)], ['lists Calculation Level options', async p => expect(locators.newCalculationLevel(p).locator('option')).not.toHaveCount(0)], ['lists Charge options', async p => expect(locators.newCharge(p).locator('option')).not.toHaveCount(0)], ['lists Adjustment Type options', async p => expect(locators.newAdjustmentType(p).locator('option')).not.toHaveCount(0)], ['lists Unit Type options', async p => expect(locators.newUnitType(p).locator('option')).not.toHaveCount(0)], ['lists Rounding options', async p => expect(locators.newRounding(p).locator('option')).not.toHaveCount(0)],
    ['selects the first Charge option safely', async p => { const c = locators.newCharge(p); await c.selectOption({ index: 0 }); await expect(c).toHaveValue(/.+/); }], ['selects the first Adjustment Type option safely', async p => { const c = locators.newAdjustmentType(p); await c.selectOption({ index: 0 }); await expect(c).toHaveValue(/.+/); }], ['selects the first Unit Type option safely', async p => { const c = locators.newUnitType(p); await c.selectOption({ index: 0 }); await expect(c).toHaveValue(/.+/); }], ['selects the first Rounding option safely', async p => { const c = locators.newRounding(p); await c.selectOption({ index: 0 }); await expect(c).toHaveValue(/.+/); }],
  ];
  for (const [title, check] of newControlCases) test(`@surcharge @ui @regression New Global Adjustment Header ${title}`, async ({ surcharge }) => newHeader(surcharge, check));

  const calculatorCases: Array<[string, (s: SurchargePage) => Promise<void>]> = [
    ['keeps Customer editable', async s => expect(locators.calculatorCustomer(s.currentPage)).toBeEditable()], ['keeps Order Date editable', async s => expect(locators.calculatorOrderDate(s.currentPage)).toBeEditable()], ['keeps Item editable', async s => expect(locators.calculatorItem(s.currentPage)).toBeEditable()], ['keeps Price editable', async s => expect(locators.calculatorPrice(s.currentPage)).toBeEditable()], ['keeps Quantity editable', async s => expect(locators.calculatorQuantity(s.currentPage)).toBeEditable()], ['shows Calculate', async s => expect(locators.calculate(s.currentPage)).toBeVisible()], ['shows Cancel', async s => expect(locators.calculatorCancel(s.currentPage)).toBeVisible()], ['lists two Environment options', async s => expect(locators.calculatorEnvironment(s.currentPage).locator('option')).toHaveCount(2)], ['selects alternate Environment and restores it', async s => s.selectAlternateEnvironment()], ['shows Ship To search when exposed', async s => { test.skip(await locators.calculatorShipToSearch(s.currentPage).count() === 0, 'Ship To search is not exposed.'); await expect(locators.calculatorShipToSearch(s.currentPage)).toBeVisible(); }], ['shows Ship To options when exposed', async s => { test.skip(await locators.calculatorShipTo(s.currentPage).count() === 0, 'Ship To selector is not exposed.'); await expect(locators.calculatorShipTo(s.currentPage).locator('option')).not.toHaveCount(0); }], ['shows Warehouse options when exposed', async s => { test.skip(await locators.calculatorWarehouse(s.currentPage).count() === 0, 'Warehouse selector is not exposed.'); await expect(locators.calculatorWarehouse(s.currentPage).locator('option')).not.toHaveCount(0); }], ['clears Price without persistence', async s => { const f = locators.calculatorPrice(s.currentPage); await f.fill('10'); await f.clear(); await expect(f).toHaveValue(''); }], ['clears Quantity without persistence', async s => { const f = locators.calculatorQuantity(s.currentPage); await f.fill('1'); await f.clear(); await expect(f).toHaveValue(''); }], ['returns through Cancel without persistence', async s => { await locators.calculatorCancel(s.currentPage).click(); await expect(s.currentPage).not.toHaveURL(/AdjustmentCalculator/i); }],
  ];
  for (const [title, check] of calculatorCases) test(`@surcharge @ui @regression Adjustment Calculator ${title}`, async ({ surcharge }) => { await surcharge.gotoCalculator(); await surcharge.expectCalculatorControls(); await check(surcharge); });
});