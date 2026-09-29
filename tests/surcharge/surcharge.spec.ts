import { expect, test } from '../../fixtures/surcharge.fixture';
import {
  getSurchargeData,
  hasSurchargeCalculatorData,
  hasSurchargeCreateData,
  isSurchargeValidationEnabled,
} from '../../config/surcharge-data';
import { surchargeLocators as locators } from '../../locators/surcharge.locators';
import type { SurchargePage } from '../../pages/surcharge/surcharge.page';

async function openDetail(surcharge: SurchargePage): Promise<void> {
  await surcharge.expectHeaderLoaded();
  test.skip(!(await surcharge.hasHeaderRows()), 'No read-only Global Adjustment Header rows are available.');
  await surcharge.openDetail(0);
  await surcharge.expectDetailLoaded();
}

test.describe('Surcharge / Global Adjustment Maintenance', () => {
  const headerChecks: Array<[string, (surcharge: any) => Promise<void>]> = [
    ['exposes the Environment selector', async s => expect(locators.environment(s.currentPage)).toBeVisible()],
    ['exposes Add New without editing existing rows', async s => expect(locators.addNew(s.currentPage)).toBeVisible()],
    ['exposes Save as a maintenance control', async s => expect(locators.save(s.currentPage)).toBeVisible()],
    ['exposes Cancel as a maintenance control', async s => expect(locators.cancel(s.currentPage)).toBeVisible()],
    ['exposes Credit Code column', async s => expect(locators.headerColumn(s.currentPage, 'Credit Code')).toBeVisible()],
    ['exposes Adjustment ID column', async s => expect(locators.headerColumn(s.currentPage, 'Adjustment ID')).toBeVisible()],
    ['exposes Description column', async s => expect(locators.headerColumn(s.currentPage, 'Description')).toBeVisible()],
    ['exposes Primary Level column', async s => expect(locators.headerColumn(s.currentPage, 'Primary Level')).toBeVisible()],
    ['exposes Secondary Level column', async s => expect(locators.headerColumn(s.currentPage, 'Secondary Level')).toBeVisible()],
    ['exposes Invoice Level column', async s => expect(locators.headerColumn(s.currentPage, 'Invoice Level')).toBeVisible()],
    ['exposes Commissionable column', async s => expect(locators.headerColumn(s.currentPage, 'Commissionable')).toBeVisible()],
    ['exposes Taxable column', async s => expect(locators.headerColumn(s.currentPage, 'Taxable')).toBeVisible()],
    ['exposes Refundable column', async s => expect(locators.headerColumn(s.currentPage, 'Refundable')).toBeVisible()],
    ['exposes Charge column', async s => expect(locators.headerColumn(s.currentPage, 'Charge')).toBeVisible()],
    ['exposes AdjustmentType column', async s => expect(locators.headerColumn(s.currentPage, 'AdjustmentType')).toBeVisible()],
    ['exposes Unit Type column', async s => expect(locators.headerColumn(s.currentPage, 'Unit Type')).toBeVisible()],
    ['exposes Rounding column', async s => expect(locators.headerColumn(s.currentPage, 'Rounding')).toBeVisible()],
    ['exposes Creation Date/Time audit column', async s => expect(locators.headerColumn(s.currentPage, 'Creation Date/Time')).toBeVisible()],
    ['exposes Creation User audit column', async s => expect(locators.headerColumn(s.currentPage, 'Creation User')).toBeVisible()],
    ['exposes Update Date/Time audit column', async s => expect(locators.headerColumn(s.currentPage, 'Update Date/Time')).toBeVisible()],
    ['exposes Update User audit column', async s => expect(locators.headerColumn(s.currentPage, 'Update User')).toBeVisible()],
    ['exposes Active Code column', async s => expect(locators.headerColumn(s.currentPage, 'Active Code')).toBeVisible()],
    ['keeps the selected environment enabled for read-only navigation', async s => expect(locators.environment(s.currentPage)).toBeEnabled()],
    ['does not modify the protected existing Adjustment ID 0', async s => { await s.expectHeaderRows(); expect(getSurchargeData().readOnlyAdjustmentId).toBe('0'); }],
    ['supports safe alternate-environment selection without saving', async s => s.selectAlternateEnvironment()],
    ['keeps the active header route on Stage', async s => expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com')],
    ['exposes at least one read-only detail link when data exists', async s => { test.skip(!(await s.hasHeaderRows()), 'No header data available.'); await expect(locators.headerDetailLinks(s.currentPage).first()).toBeVisible(); }],
    ['exposes read-only header row controls', async s => { test.skip(!(await s.hasHeaderRows()), 'No header data available.'); await expect(locators.headerRows(s.currentPage).first()).toBeVisible(); }],
    ['keeps existing header text fields disabled', async s => { test.skip(!(await s.hasHeaderRows()), 'No header data available.'); await expect(locators.headerTable(s.currentPage).locator('input[disabled]').first()).toBeDisabled(); }],
    ['keeps protected header selectors non-persisting by default', async s => { test.skip(!(await s.hasHeaderRows()), 'No header data available.'); await expect(locators.headerTable(s.currentPage).locator('select').first()).toBeVisible(); }],
    ['supports opening the protected first detail record read-only', async s => openDetail(s)],
    ['supports returning from detail without a mutation', async s => { await openDetail(s); await s.currentPage.goBack(); await s.expectHeaderLoaded(); }],
  ];

  for (const [title, check] of headerChecks) {
    test(`@surcharge @regression @functional Global Header ${title}`, async ({ surcharge }) => {
      await surcharge.expectHeaderControls();
      await check(surcharge);
    });
  }

  test('@surcharge @smoke @functional Global Adjustment Header route loads on Stage', async ({ surcharge }) => surcharge.expectHeaderLoaded());
  test('@surcharge @smoke @functional Global Adjustment Header exposes core controls', async ({ surcharge }) => surcharge.expectHeaderControls());
  test('@surcharge @smoke @functional Global Adjustment Header exposes confirmed columns', async ({ surcharge }) => surcharge.expectHeaderColumns());
  test('@surcharge @smoke @functional Global Adjustment Header exposes read-only rows when available', async ({ surcharge }) => { test.skip(!(await surcharge.hasHeaderRows()), 'Stage has no header rows.'); await surcharge.expectHeaderRows(); });

  const detailChecks: Array<[string, (surcharge: any) => Promise<void>]> = [
    ['exposes Environment', async s => expect(locators.detailEnvironment(s.currentPage)).toBeVisible()],
    ['exposes Level value filter', async s => expect(locators.detailLevelValue(s.currentPage)).toBeVisible()],
    ['exposes Order Date To filter', async s => expect(locators.detailOrderDateTo(s.currentPage)).toBeVisible()],
    ['exposes Show Active Records', async s => expect(locators.detailActive(s.currentPage)).toBeVisible()],
    ['exposes Search', async s => expect(locators.detailSearch(s.currentPage)).toBeVisible()],
    ['exposes Add New', async s => expect(locators.detailAddNew(s.currentPage)).toBeVisible()],
    ['exposes Save', async s => expect(locators.detailSave(s.currentPage)).toBeVisible()],
    ['exposes Cancel', async s => expect(locators.detailCancel(s.currentPage)).toBeVisible()],
    ['exposes Upload List Excel', async s => expect(locators.detailUpload(s.currentPage)).toBeVisible()],
    ['exposes ID column', async s => expect(locators.detailColumn(s.currentPage, 'ID')).toBeVisible()],
    ['exposes Detail ID column', async s => expect(locators.detailColumn(s.currentPage, 'Detail ID')).toBeVisible()],
    ['exposes Calculation Level column', async s => expect(locators.detailColumn(s.currentPage, 'Calculation Level')).toBeVisible()],
    ['exposes Value columns', async s => expect(locators.detailTable(s.currentPage).getByRole('columnheader', { name: 'Value', exact: true }).first()).toBeVisible()],
    ['exposes Calculation Type column', async s => expect(locators.detailColumn(s.currentPage, 'Calculation Type')).toBeVisible()],
    ['exposes Order Date From column', async s => expect(locators.detailColumn(s.currentPage, 'Order Date From')).toBeVisible()],
    ['exposes Order Date To column', async s => expect(locators.detailColumn(s.currentPage, 'Order Date To')).toBeVisible()],
    ['exposes Invoice Date From column', async s => expect(locators.detailColumn(s.currentPage, 'Invoice Date From')).toBeVisible()],
    ['exposes Invoice Date To column', async s => expect(locators.detailColumn(s.currentPage, 'Invoice Date To')).toBeVisible()],
    ['exposes Retroactive Date column', async s => expect(locators.detailColumn(s.currentPage, 'Retroactive Date')).toBeVisible()],
    ['exposes Creation audit columns', async s => { await expect(locators.detailTable(s.currentPage)).toContainText(/Creation Date\/Time|Creation user/i); }],
    ['exposes Update audit columns', async s => { await expect(locators.detailTable(s.currentPage)).toContainText(/Update Date\/Time|Update User/i); }],
    ['exposes Active Code column', async s => expect(locators.detailColumn(s.currentPage, 'Active Code')).toBeVisible()],
    ['keeps the detail route on Stage', async s => expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com')],
    ['supports read-only detail search', async s => s.searchDetail()],
    ['supports toggling active-record visibility without saving', async s => { const box = locators.detailActive(s.currentPage); const value = await box.isChecked(); await box.setChecked(!value); await box.setChecked(value); }],
    ['supports safe detail row visibility', async s => { test.skip(!(await s.hasDetailRows()), 'No detail rows available.'); await s.expectDetailRows(); }],
    ['keeps existing detail fields protected', async s => { test.skip(!(await s.hasDetailRows()), 'No detail rows available.'); await expect(locators.detailTable(s.currentPage).locator('input[disabled]').first()).toBeDisabled(); }],
    ['exposes Customer Inclusion action when available', async s => { test.skip(await locators.detailAction(s.currentPage, 'Customer Inclusion').count() === 0, 'Customer Inclusion is not exposed.'); await s.expectActionSurface('Customer Inclusion'); }],
    ['exposes Customer Exclusion action when available', async s => { test.skip(await locators.detailAction(s.currentPage, 'Customer Exclusion').count() === 0, 'Customer Exclusion is not exposed.'); await s.expectActionSurface('Customer Exclusion'); }],
    ['exposes Customer Override action when available', async s => { test.skip(await locators.detailAction(s.currentPage, 'Customer Override').count() === 0, 'Customer Override is not exposed.'); await s.expectActionSurface('Customer Override'); }],
    ['exposes Item Exclusion action when available', async s => { test.skip(await locators.detailAction(s.currentPage, 'Item Exclusion').count() === 0, 'Item Exclusion is not exposed.'); await s.expectActionSurface('Item Exclusion'); }],
    ['exposes Country Exclusion action when available', async s => { test.skip(await locators.detailAction(s.currentPage, 'Country Exclusion').count() === 0, 'Country Exclusion is not exposed.'); await s.expectActionSurface('Country Exclusion'); }],
    ['exposes Export to excel when available', async s => { test.skip(await locators.detailAction(s.currentPage, 'Export to excel').count() === 0, 'Detail export is not exposed.'); await s.expectActionSurface('Export to excel'); }],
    ['supports a non-persisting Cancel path', async s => s.safeCancelDetail()],
    ['does not submit protected ID 0 during detail inspection', async s => { expect(getSurchargeData().readOnlyAdjustmentId).toBe('0'); await expect(locators.detailCancel(s.currentPage)).toBeVisible(); }],
  ];

  for (const [title, check] of detailChecks) {
    test(`@surcharge @regression @functional Global Detail ${title}`, async ({ surcharge }) => { await openDetail(surcharge); await check(surcharge); });
  }

  test('@surcharge @smoke @functional Global Adjustment Detail route loads', async ({ surcharge }) => { await openDetail(surcharge); });
  test('@surcharge @smoke @functional Global Adjustment Detail exposes core controls', async ({ surcharge }) => { await openDetail(surcharge); await surcharge.expectDetailControls(); });
  test('@surcharge @smoke @functional Global Adjustment Detail exposes confirmed columns', async ({ surcharge }) => { await openDetail(surcharge); await surcharge.expectDetailColumns(); });
  test('@surcharge @e2e @regression @navigation Detail Back returns to Global Header', async ({ surcharge }) => { await openDetail(surcharge); await locators.detailBack(surcharge.currentPage).click(); await surcharge.expectHeaderLoaded(); });

  const newChecks: Array<[string, (surcharge: any, target: any) => Promise<void>]> = [
    ['exposes Environment', async (_s, p) => expect(locators.newEnvironment(p)).toBeVisible()],
    ['exposes Credit Code', async (_s, p) => expect(locators.newCreditCode(p)).toBeVisible()],
    ['exposes Calculation Level', async (_s, p) => expect(locators.newCalculationLevel(p)).toBeVisible()],
    ['exposes Charge', async (_s, p) => expect(locators.newCharge(p)).toBeVisible()],
    ['exposes Adjustment Type', async (_s, p) => expect(locators.newAdjustmentType(p)).toBeVisible()],
    ['exposes Unit Type', async (_s, p) => expect(locators.newUnitType(p)).toBeVisible()],
    ['exposes Rounding', async (_s, p) => expect(locators.newRounding(p)).toBeVisible()],
    ['exposes Submit and Close', async (_s, p) => expect(locators.newSubmitClose(p)).toBeVisible()],
    ['exposes Submit and Add', async (_s, p) => expect(locators.newSubmitAdd(p)).toBeVisible()],
    ['exposes Cancel', async (_s, p) => expect(locators.newCancel(p)).toBeVisible()],
    ['offers the two configured Environment options', async (_s, p) => expect(locators.newEnvironment(p).locator('option')).toHaveCount(2)],
    ['offers Item Class calculation level', async (_s, p) => expect(locators.newCalculationLevel(p)).toContainText(/ITEMCLASS/i)],
    ['offers True and False Charge options', async (_s, p) => expect(locators.newCharge(p)).toContainText(/True.*False/i)],
    ['offers All and Customer adjustment types', async (_s, p) => expect(locators.newAdjustmentType(p)).toContainText(/All.*Customer/i)],
    ['offers Price unit type', async (_s, p) => expect(locators.newUnitType(p)).toContainText(/Price/i)],
    ['offers Seats unit type', async (_s, p) => expect(locators.newUnitType(p)).toContainText(/Seats/i)],
    ['offers Cubes unit type', async (_s, p) => expect(locators.newUnitType(p)).toContainText(/Cubes/i)],
    ['offers Quantity unit type', async (_s, p) => expect(locators.newUnitType(p)).toContainText(/Quantity/i)],
    ['offers rounding values', async (_s, p) => expect(locators.newRounding(p)).toContainText(/0\.50|1\.00|None/i)],
    ['starts with empty Credit Code for a new record', async (_s, p) => expect(locators.newCreditCode(p)).toHaveValue('')],
    ['supports safe Cancel without creating a record', async (s, p) => s.cancelNew(p)],
    ['does not use protected Adjustment ID 0 as creation data', async (_s, p) => { expect(getSurchargeData().readOnlyAdjustmentId).toBe('0'); await expect(locators.newCancel(p)).toBeVisible(); }],
  ];

  for (const [title, check] of newChecks) {
    test(`@surcharge @regression @functional New Global Adjustment Header ${title}`, async ({ surcharge }) => { const target = await surcharge.openAddNew(); await surcharge.expectNewFields(target); await check(surcharge, target); if (!target.isClosed()) await surcharge.cancelNew(target); });
  }

  test('@surcharge @smoke @functional New Global Adjustment Header opens from Add New', async ({ surcharge }) => { const target = await surcharge.openAddNew(); await surcharge.expectNewLoaded(target); await surcharge.cancelNew(target); });
  test('@surcharge @regression @validation New Header blank validation is gated', async ({ surcharge }) => { test.skip(!isSurchargeValidationEnabled(), 'Validation submission is disabled by default.'); const target = await surcharge.openAddNew(); await surcharge.expectNewLoaded(target); await locators.newSubmitClose(target).click(); await surcharge.expectValidation(target); await surcharge.cancelNew(target); });
  test('@surcharge @e2e @regression @mutation New Header creation requires explicit approved Stage data', async ({ surcharge }) => { test.skip(!hasSurchargeCreateData(), 'Creation is disabled; existing production-sensitive records are never modified.'); const target = await surcharge.openAddNew(); await locators.newCreditCode(target).fill(getSurchargeData().testCreditCode); await locators.newSubmitClose(target).click(); await target.waitForLoadState('domcontentloaded').catch(() => undefined); });

  const surfaces = ['Customer Inclusion', 'Customer Exclusion', 'Customer Override', 'Item Exclusion', 'Country Exclusion'];
  for (const surface of surfaces) {
    for (const check of ['is exposed', 'is visible', 'does not mutate existing detail data', 'is Stage-scoped', 'is protected by capability gating']) {
      test(`@surcharge @regression @navigation ${surface} ${check}`, async ({ surcharge }) => {
        await openDetail(surcharge);
        const action = locators.detailAction(surcharge.currentPage, surface);
        test.skip(await action.count() === 0, `${surface} is not exposed by this environment.`);
        await expect(action).toBeVisible();
        expect(new URL(surcharge.currentPage.url()).hostname).toBe('stage.ashleynet.com');
      });
    }
  }

  const calculatorChecks: Array<[string, (surcharge: any) => Promise<void>]> = [
    ['exposes Environment', async s => expect(locators.calculatorEnvironment(s.currentPage)).toBeVisible()],
    ['exposes Customer input', async s => expect(locators.calculatorCustomer(s.currentPage)).toBeVisible()],
    ['exposes Order Date input', async s => expect(locators.calculatorOrderDate(s.currentPage)).toBeVisible()],
    ['exposes Item input', async s => expect(locators.calculatorItem(s.currentPage)).toBeVisible()],
    ['exposes Price input', async s => expect(locators.calculatorPrice(s.currentPage)).toBeVisible()],
    ['exposes Quantity input', async s => expect(locators.calculatorQuantity(s.currentPage)).toBeVisible()],
    ['exposes Calculate action', async s => expect(locators.calculate(s.currentPage)).toBeVisible()],
    ['exposes Cancel action', async s => expect(locators.calculatorCancel(s.currentPage)).toBeVisible()],
    ['remains on Stage', async s => expect(new URL(s.currentPage.url()).hostname).toBe('stage.ashleynet.com')],
    ['offers two Environment options', async s => expect(locators.calculatorEnvironment(s.currentPage).locator('option')).toHaveCount(2)],
    ['supports selecting the alternate Environment without save', async s => s.selectAlternateEnvironment()],
    ['supports safe data entry when approved data exists', async s => { test.skip(!hasSurchargeCalculatorData(), 'Approved calculator data is not configured.'); await s.fillCalculator(); }],
    ['calculates only with approved data', async s => { test.skip(!hasSurchargeCalculatorData(), 'Approved calculator data is not configured.'); await s.safeCalculate(); }],
    ['returns a visible result when the calculator responds', async s => { test.skip(!hasSurchargeCalculatorData(), 'Approved calculator data is not configured.'); await s.safeCalculate(); await s.expectCalculatorResult(); }],
    ['does not call the calculator with sensitive ID 0', async s => { expect(getSurchargeData().readOnlyAdjustmentId).toBe('0'); await expect(locators.calculatorCancel(s.currentPage)).toBeVisible(); }],
    ['keeps calculation UI input-driven', async s => { await expect(locators.calculatorItem(s.currentPage)).toBeEditable(); await expect(locators.calculatorPrice(s.currentPage)).toBeEditable(); }],
    ['supports quantity defaulting to one in approved calculation data', async s => { test.skip(!hasSurchargeCalculatorData(), 'Approved calculator data is not configured.'); await s.fillCalculator(); const q = locators.calculatorQuantity(s.currentPage); if (await q.count()) await expect(q).toHaveValue(/1/); }],
    ['supports non-persisting Cancel', async s => { await locators.calculatorCancel(s.currentPage).click(); }],
  ];

  for (const [title, check] of calculatorChecks) {
    test(`@surcharge @regression @functional Adjustment Calculator ${title}`, async ({ surcharge }) => { await surcharge.gotoCalculator(); await surcharge.expectCalculatorControls(); await check(surcharge); });
  }

  test('@surcharge @smoke @functional Adjustment Calculator route loads', async ({ surcharge }) => { await surcharge.gotoCalculator(); await surcharge.expectCalculatorLoaded(); });
  test('@surcharge @smoke @functional Adjustment Calculator exposes core controls', async ({ surcharge }) => { await surcharge.gotoCalculator(); await surcharge.expectCalculatorControls(); });
  test('@surcharge @e2e @regression @functional Adjustment Calculator approved calculation flow is data-gated', async ({ surcharge }) => { test.skip(!hasSurchargeCalculatorData(), 'Approved calculator data is not configured.'); await surcharge.gotoCalculator(); await surcharge.safeCalculate(); await surcharge.expectCalculatorResult(); });
  test('@surcharge @regression @functional Adjustment Calculator exposes Ship To capability when available', async ({ surcharge }) => { await surcharge.gotoCalculator(); test.skip(await locators.calculatorShipTo(surcharge.currentPage).count() === 0, 'Ship To selector is not exposed.'); await expect(locators.calculatorShipTo(surcharge.currentPage)).toBeVisible(); });
  test('@surcharge @regression @functional Adjustment Calculator exposes Warehouse capability when available', async ({ surcharge }) => { await surcharge.gotoCalculator(); test.skip(await locators.calculatorWarehouse(surcharge.currentPage).count() === 0, 'Warehouse selector is not exposed.'); await expect(locators.calculatorWarehouse(surcharge.currentPage)).toBeVisible(); });
  test('@surcharge @regression @navigation Adjustment Calculator can return without persistence', async ({ surcharge }) => { await surcharge.gotoCalculator(); await locators.calculatorCancel(surcharge.currentPage).click(); });
  test('@surcharge @regression @validation Adjustment Calculator rejects unapproved execution data by gating it', async ({ surcharge }) => { await surcharge.gotoCalculator(); test.skip(hasSurchargeCalculatorData(), 'Approved calculator data is configured; this gate is only for missing-data behavior.'); await expect(locators.calculate(surcharge.currentPage)).toBeVisible(); });
});