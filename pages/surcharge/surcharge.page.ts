import { expect, type Page } from '@playwright/test';
import { getSurchargeData } from '../../config/surcharge-data';
import { runtimeConfig } from '../../config/runtime-config';
import { surchargeLocators as locators } from '../../locators/surcharge.locators';

export class SurchargePage {
  constructor(private readonly page: Page) {}

  get currentPage(): Page { return this.page; }

  async gotoHeader(): Promise<void> { await this.gotoOn(this.page, runtimeConfig.globalAdjustmentHeaderPath); }
  async gotoCalculator(): Promise<void> { await this.gotoOn(this.page, runtimeConfig.globalAdjustmentCalculatorPath); }

  async expectHeaderLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/AdjustmentMaintenance\/GlobalAdjustmentHeader/i);
    await expect(locators.headerHeading(target)).toBeVisible();
    this.assertStage(target);
  }

  async expectHeaderControls(target: Page = this.page): Promise<void> {
    await this.expectHeaderLoaded(target);
    for (const control of [locators.environment(target), locators.addNew(target), locators.save(target), locators.cancel(target)]) {
      await expect(control).toBeVisible();
    }
  }

  async expectHeaderColumns(target: Page = this.page): Promise<void> {
    await this.expectHeaderLoaded(target);
    for (const name of ['Credit Code', 'Adjustment ID', 'Description', 'Primary Level', 'Secondary Level', 'Invoice Level', 'Commissionable', 'Taxable', 'Refundable', 'Charge', 'AdjustmentType', 'Unit Type', 'Rounding', 'Active Code']) {
      await expect(locators.headerColumn(target, name)).toBeVisible();
    }
  }

  async hasHeaderRows(target: Page = this.page): Promise<boolean> { return await locators.headerDetailLinks(target).count() > 0; }
  async expectHeaderRows(target: Page = this.page): Promise<void> { await expect(locators.headerDetailLinks(target).first()).toBeVisible(); }

  async selectAlternateEnvironment(target: Page = this.page): Promise<void> {
    const select = locators.environment(target);
    await expect(select).toBeEnabled();
    const options = select.locator('option');
    if (await options.count() < 2) throw new Error('Surcharge Environment selector does not expose a second option.');
    await select.selectOption({ index: 1 });
    await expect(select).toHaveValue(await options.nth(1).getAttribute('value') || '');
    await select.selectOption({ index: 0 });
  }

  async openDetail(index = 0): Promise<Page> {
    const link = locators.headerDetailLinks(this.page).nth(index);
    await expect(link).toBeVisible();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    return this.page;
  }

  async openAddNew(): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 5_000 }).catch(() => undefined);
    await locators.addNew(this.page).click();
    const popup = await popupPromise;
    const target = popup || this.page;
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    return target;
  }

  async expectNewLoaded(target: Page): Promise<void> {
    await expect(target).toHaveURL(/\/AdjustmentMaintenance\/NewAdjustmentHeader/i);
    await expect(locators.newHeading(target)).toBeVisible();
    this.assertStage(target);
  }

  async expectNewFields(target: Page): Promise<void> {
    await this.expectNewLoaded(target);
    for (const control of [locators.newEnvironment(target), locators.newCreditCode(target), locators.newCalculationLevel(target), locators.newCharge(target), locators.newAdjustmentType(target), locators.newUnitType(target), locators.newRounding(target)]) await expect(control).toBeVisible();
  }

  async expectNewActions(target: Page): Promise<void> {
    for (const control of [locators.newSubmitClose(target), locators.newSubmitAdd(target), locators.newCancel(target)]) await expect(control).toBeVisible();
  }

  async cancelNew(target: Page): Promise<void> {
    await locators.newCancel(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (target !== this.page && !target.isClosed()) await target.close();
  }

  async expectDetailLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/AdjustmentMaintenance\/GlobalAdjustmentdetail/i);
    await expect(locators.detailHeading(target)).toBeVisible();
    this.assertStage(target);
  }

  async expectDetailControls(target: Page = this.page): Promise<void> {
    await this.expectDetailLoaded(target);
    for (const control of [locators.detailEnvironment(target), locators.detailLevelValue(target), locators.detailOrderDateTo(target), locators.detailActive(target), locators.detailSearch(target), locators.detailAddNew(target), locators.detailSave(target), locators.detailCancel(target), locators.detailUpload(target)]) await expect(control).toBeVisible();
  }

  async expectDetailColumns(target: Page = this.page): Promise<void> {
    for (const name of ['ID', 'Detail ID', 'Calculation Level', 'Value', 'Calculation Type', 'Order Date From', 'Order Date To', 'Invoice Date From', 'Invoice Date To', 'Retroactive Date', 'Active Code']) await expect(locators.detailColumn(target, name)).toBeVisible();
  }

  async hasDetailRows(target: Page = this.page): Promise<boolean> { return await locators.detailRows(target).count() > 0; }
  async expectDetailRows(target: Page = this.page): Promise<void> { await expect(locators.detailRows(target).first()).toBeVisible(); }

  async searchDetail(target: Page = this.page): Promise<void> {
    const data = getSurchargeData();
    if (data.orderDate) await locators.detailOrderDateTo(target).fill(data.orderDate);
    await locators.detailSearch(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectDetailLoaded(target);
  }

  async openDetailAction(name: string, target: Page = this.page): Promise<Page> {
    const action = locators.detailAction(target, name);
    await expect(action).toBeVisible();
    const popupPromise = target.context().waitForEvent('page', { timeout: 5_000 }).catch(() => undefined);
    await action.click();
    const popup = await popupPromise;
    const next = popup || target;
    await next.waitForLoadState('domcontentloaded').catch(() => undefined);
    return next;
  }

  async expectActionSurface(name: string, target: Page = this.page): Promise<void> {
    const action = locators.detailAction(target, name);
    if (await action.count() === 0) throw new Error(`${name} is not exposed by the current Stage detail page.`);
    await expect(action).toBeVisible();
  }

  async safeCancelDetail(target: Page = this.page): Promise<void> {
    const editable = locators.detailEditable(target).first();
    if (await editable.count() && await editable.isEditable()) {
      const original = await editable.inputValue();
      await editable.fill(`${original} AUTOMATION_ONLY`);
    }
    await locators.detailCancel(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectDetailLoaded(target);
  }

  async expectCalculatorLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/AdjustmentMaintenance\/AdjustmentCalculator/i);
    await expect(locators.calculatorHeading(target)).toBeVisible();
    this.assertStage(target);
  }

  async expectCalculatorControls(target: Page = this.page): Promise<void> {
    await this.expectCalculatorLoaded(target);
    for (const control of [locators.calculatorEnvironment(target), locators.calculatorCustomer(target), locators.calculatorOrderDate(target), locators.calculatorItem(target), locators.calculatorPrice(target), locators.calculatorQuantity(target), locators.calculate(target), locators.calculatorCancel(target)]) await expect(control).toBeVisible();
  }

  async fillCalculator(target: Page = this.page): Promise<void> {
    const data = getSurchargeData();
    for (const [control, value] of [[locators.calculatorCustomer(target), data.customer], [locators.calculatorOrderDate(target), data.orderDate], [locators.calculatorItem(target), data.item], [locators.calculatorPrice(target), data.price], [locators.calculatorQuantity(target), data.quantity || '1']] as const) if (value && await control.count()) await control.fill(value);
  }

  async safeCalculate(target: Page = this.page): Promise<void> {
    await this.fillCalculator(target);
    await locators.calculate(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
  }

  async expectCalculatorResult(target: Page = this.page): Promise<void> { await expect(locators.calculatorResult(target)).toBeVisible(); }

  async expectValidation(target: Page = this.page): Promise<void> { await expect(locators.validation(target)).toBeVisible(); }

  private async gotoOn(target: Page, path: string): Promise<void> {
    const expected = new URL(path, runtimeConfig.surchargeBaseURL).toString();
    await target.goto(expected, { waitUntil: 'domcontentloaded' });
    if (new URL(target.url()).hostname.toLowerCase() !== 'stage.ashleynet.com') await target.goto(expected, { waitUntil: 'domcontentloaded' });
    this.assertStage(target);
    await target.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  private assertStage(target: Page): void {
    const host = new URL(target.url()).hostname.toLowerCase();
    if (host !== 'stage.ashleynet.com') throw new Error(`Surcharge automation requires Stage; current host is ${host}.`);
  }
}