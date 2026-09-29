import { expect, type Page } from '@playwright/test';
import { getPriceExceptionsData } from '../../config/price-exceptions-data';
import { runtimeConfig } from '../../config/runtime-config';
import { priceExceptionsLocators as locators } from '../../locators/price-exceptions.locators';

export class PriceExceptionsPage {
  constructor(private readonly page: Page) {}

  get currentPage(): Page { return this.page; }

  async gotoActive(): Promise<void> {
    await this.gotoRoute(runtimeConfig.priceExceptionsPath, { ssa: '1', envSelected: getPriceExceptionsData().environment });
  }

  async gotoEditNew(target: Page = this.page): Promise<void> {
    await this.gotoOn(target, runtimeConfig.priceExceptionsEditPath, {
      ssa: '1', hlcp: '1', hmt: '1', hm: '1', edit: 'NEW',
      envSelected: getPriceExceptionsData().environment, curr: '',
    });
  }

  async gotoChangeDates(target: Page = this.page): Promise<void> {
    await this.gotoOn(target, runtimeConfig.priceExceptionsChangeDatesPath, {
      ssa: '1', hlcp: '1', hmt: '1', hm: '1', saro: '1',
      envSelected: getPriceExceptionsData().environment, curr: '',
    });
  }

  async gotoInactive(): Promise<void> {
    await this.gotoRoute(runtimeConfig.priceExceptionsInactivePath, {
      envSelected: getPriceExceptionsData().environment, curr: '',
    });
  }

  async gotoImport(target: Page = this.page): Promise<void> {
    await this.gotoOn(target, runtimeConfig.priceExceptionsImportPath, {
      hm: '1', hlcp: '1', Exclude: '1', env: getPriceExceptionsData().environment,
    });
  }

  async expectActiveLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/CustomerMaintenance\/PriceExceptions\.aspx/i);
    await expect(locators.activeHeading(this.page)).toBeVisible();
    this.assertStageHost(this.page);
  }

  async expectActiveCoreControls(): Promise<void> {
    await this.expectActiveLoaded();
    for (const control of [
      locators.environment(this.page), locators.itemSearch(this.page), locators.search(this.page),
      locators.reports(this.page), locators.viewInactive(this.page), locators.addNew(this.page),
      locators.save(this.page), locators.changeAllDates(this.page), locators.importExcel(this.page),
      locators.exportExcel(this.page), locators.cancel(this.page), locators.bottomSave(this.page),
      locators.bottomCancel(this.page), locators.deleteAll(this.page),
    ]) await expect(control).toBeVisible();
  }

  async expectEnvironmentOptions(): Promise<void> {
    await expect(locators.environment(this.page).locator('option')).toHaveCount(2);
  }

  async searchActive(): Promise<void> {
    const item = getPriceExceptionsData().item;
    if (item) await locators.itemSearch(this.page).fill(item);
    await locators.search(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectActiveLoaded();
  }

  async selectFirstReport(): Promise<void> {
    const option = locators.reports(this.page).locator('option').first();
    const value = await option.getAttribute('value');
    if (value === null) throw new Error('Price Exceptions report list has no selectable option.');
    await locators.reports(this.page).selectOption(value);
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectActiveLoaded();
  }

  async hasActiveRows(): Promise<boolean> { return await locators.activeRows(this.page).count() > 0; }

  async expectActiveGrid(): Promise<void> {
    const grid = locators.activeGrid(this.page);
    await expect(grid).toBeVisible();
    for (const header of ['Item', 'Whse', 'Price', 'Std Disc', '-Disc', 'Misc Disc', 'COOP Ad', 'DFI Disc', '+Disc', 'From', 'To', 'Cmsn']) {
      await expect(grid).toContainText(header);
    }
    await expect(locators.activeRows(this.page).first()).toBeVisible();
  }

  async cancelUnsavedActiveEdit(): Promise<void> {
    const field = locators.activeEditableFields(this.page).first();
    const original = await field.inputValue();
    const marker = `${original} AUTOMATION_ONLY`;
    await field.fill(marker);
    await locators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectActiveLoaded();
    if (await locators.activeEditableFields(this.page).count()) {
      await expect(locators.activeEditableFields(this.page).first()).not.toHaveValue(marker);
    }
  }

  async toggleDeleteAllSafely(): Promise<void> {
    const checkbox = locators.deleteAll(this.page);
    await checkbox.check();
    await expect(checkbox).toBeChecked();
    await checkbox.uncheck();
    await expect(checkbox).not.toBeChecked();
  }

  async exportToExcel(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await locators.exportExcel(this.page).click();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }

  async openAddNew(): Promise<Page> {
    return await this.openChild(locators.addNew(this.page), runtimeConfig.priceExceptionsEditPath, {
      ssa: '1', hlcp: '1', hmt: '1', hm: '1', edit: 'NEW',
      envSelected: getPriceExceptionsData().environment, curr: '',
    });
  }

  async openChangeDates(): Promise<Page> {
    return await this.openChild(locators.changeAllDates(this.page), runtimeConfig.priceExceptionsChangeDatesPath, {
      ssa: '1', hlcp: '1', hmt: '1', hm: '1', saro: '1',
      envSelected: getPriceExceptionsData().environment, curr: '',
    });
  }

  async openImport(): Promise<Page> {
    return await this.openChild(locators.importExcel(this.page), runtimeConfig.priceExceptionsImportPath, {
      hm: '1', hlcp: '1', Exclude: '1', env: getPriceExceptionsData().environment,
    });
  }

  async expectEditLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/CustomerMaintenance\/PriceExceptionsEdit\.aspx/i);
    await expect(locators.editHeading(target)).toBeVisible();
    await this.expectEditFields(target);
    this.assertStageHost(target);
  }

  async expectEditFields(target: Page = this.page): Promise<void> {
    for (const control of [
      locators.editItem(target), locators.editDfiDiscount(target), locators.editWarehouse(target),
      locators.editPlusDiscount(target), locators.editPrice(target), locators.editFreight(target),
      locators.editStdDiscount(target), locators.editOrderFrom(target), locators.editOrderTo(target),
      locators.editMinusDiscount(target), locators.editMiscDiscount(target), locators.editCommission(target),
      locators.editCoopAdd(target), locators.editBaseAdjustment(target), locators.editMiscDiscount2(target),
      locators.editReductionTable(target),
    ]) await expect(control).toBeVisible();
  }

  async expectEditActions(target: Page = this.page): Promise<void> {
    for (const control of [locators.editSaveNew(target), locators.editSaveClose(target), locators.editSave(target), locators.editCancel(target)]) {
      await expect(control).toBeVisible();
    }
  }

  async expectEditAdjustmentControls(target: Page = this.page): Promise<void> {
    for (const control of [
      locators.commissionCode(target), locators.commissionAmount(target), locators.volumeCode(target),
      locators.volumePercent(target), locators.coopCode(target), locators.coopPercent(target),
    ]) await expect(control).toBeVisible();
  }

  async expectEditDateControls(target: Page = this.page): Promise<void> {
    for (const control of [
      locators.editOrderFrom(target), locators.editOrderTo(target),
      locators.editStartCalendar(target), locators.editEndCalendar(target),
    ]) await expect(control).toBeVisible();
  }

  async expectEditSelectionControls(target: Page = this.page): Promise<void> {
    for (const control of [locators.editWarehouse(target), locators.editFreight(target), locators.editReductionTable(target)]) {
      await expect(control).toBeVisible();
      await expect(control).toBeEnabled();
    }
  }

  async expectDatesLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/CustomerMaintenance\/PriceExceptionsChangeDates\.aspx/i);
    await expect(locators.datesHeading(target)).toBeVisible();
    this.assertStageHost(target);
  }

  async expectDatesFields(target: Page = this.page): Promise<void> {
    for (const control of [locators.datesFrom(target), locators.datesTo(target), locators.datesFromCalendar(target), locators.datesToCalendar(target)]) {
      await expect(control).toBeVisible();
    }
    await expect(locators.datesSubmit(target)).toBeVisible();
    await expect(locators.datesCancel(target)).toBeVisible();
  }

  async expectInactiveLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/CustomerMaintenance\/InActivePriceExceptions\.aspx/i);
    await expect(locators.inactiveHeading(this.page)).toBeVisible();
    this.assertStageHost(this.page);
  }

  async expectInactiveCoreControls(): Promise<void> {
    await this.expectInactiveLoaded();
    for (const control of [locators.inactiveReturn(this.page), locators.inactiveEnvironment(this.page), locators.inactiveItemSearch(this.page), locators.inactiveSearch(this.page)]) {
      await expect(control).toBeVisible();
    }
  }

  async searchInactive(): Promise<void> {
    const item = getPriceExceptionsData().item;
    if (item) await locators.inactiveItemSearch(this.page).fill(item);
    await locators.inactiveSearch(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectInactiveLoaded();
  }

  async hasInactiveRows(): Promise<boolean> { return await locators.inactiveRows(this.page).count() > 0; }

  async expectInactiveGrid(): Promise<void> {
    const grid = locators.inactiveGrid(this.page);
    await expect(grid).toBeVisible();
    await expect(grid).toContainText(/Item|Price|From|To/i);
    await expect(locators.inactiveRows(this.page).first()).toBeVisible();
  }

  async returnToActive(): Promise<void> {
    await locators.inactiveReturn(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectActiveLoaded();
  }

  async expectImportLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/CustomerMaintenance\/ExcelImport\.aspx/i);
    await expect(locators.importHeading(target)).toBeVisible();
    this.assertStageHost(target);
  }

  async expectImportControls(target: Page = this.page): Promise<void> {
    for (const control of [
      locators.importHeader(target), locators.importFile(target), locators.importSelectAll(target),
      locators.importStdDisc(target), locators.importMinusDisc(target), locators.importMiscDisc(target),
      locators.importCoopAd(target), locators.importMiscDisc2(target), locators.importDfiDisc(target),
      locators.importPlusDisc(target), locators.importFreight(target), locators.importCommission(target),
      locators.importUpload(target), locators.importCancel(target),
    ]) await expect(control).toBeVisible();
  }

  async selectImportDefaults(target: Page = this.page): Promise<void> {
    await locators.importSelectAll(target).check();
    for (const control of [
      locators.importStdDisc(target), locators.importMinusDisc(target), locators.importMiscDisc(target),
      locators.importCoopAd(target), locators.importMiscDisc2(target), locators.importDfiDisc(target),
      locators.importPlusDisc(target), locators.importFreight(target), locators.importCommission(target),
    ]) await expect(control).toBeChecked();
  }

  async uploadApprovedFile(target: Page = this.page): Promise<void> {
    const file = getPriceExceptionsData().uploadFile;
    await locators.importFile(target).setInputFiles(file);
    await locators.importUpload(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
  }

  async cancelTarget(target: Page): Promise<void> {
    const cancel = target.url().includes('PriceExceptionsEdit') ? locators.editCancel(target)
      : target.url().includes('ChangeDates') ? locators.datesCancel(target)
        : locators.importCancel(target);
    await cancel.click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (target !== this.page && !target.isClosed()) await target.close();
  }

  private async openChild(trigger: ReturnType<typeof locators.addNew>, path: string, query: Record<string, string>): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 5_000 }).catch(() => undefined);
    await trigger.click();
    const popup = await popupPromise;
    const target = popup || await this.page.context().newPage();
    if (!popup) await this.gotoOn(target, path, query);
    await this.reenterStage(target, this.makeURL(path, query));
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    return target;
  }

  private async gotoRoute(path: string, query: Record<string, string>): Promise<void> {
    await this.gotoOn(this.page, path, query);
  }

  private async gotoOn(target: Page, path: string, query: Record<string, string>): Promise<void> {
    const url = this.makeURL(path, query);
    await target.goto(url, { waitUntil: 'domcontentloaded' });
    await this.reenterStage(target, url);
    await target.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  private makeURL(path: string, query: Record<string, string>): string {
    const url = new URL(path, runtimeConfig.priceExceptionsBaseURL);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    return url.toString();
  }

  private async reenterStage(target: Page, expectedURL: string): Promise<void> {
    if (new URL(target.url()).hostname.toLowerCase() !== 'stage.ashleynet.com') {
      await target.goto(expectedURL, { waitUntil: 'domcontentloaded' });
    }
    this.assertStageHost(target);
  }

  private assertStageHost(target: Page): void {
    const hostname = new URL(target.url()).hostname.toLowerCase();
    if (hostname !== 'stage.ashleynet.com') throw new Error(`Price Exceptions requires Stage, but the current host is ${hostname}.`);
  }
}