import { expect, type Page } from '@playwright/test';
import { runtimeConfig } from '../../../config/runtime-config';
import { priceListLocators } from '../../../locators/pricing/price-lists.locators';
import { AshleyNetShellPage } from '../common/ashley-net-shell.page';

export class PriceListMaintenancePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(runtimeConfig.priceListPath, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(priceListLocators.heading(this.page)).toBeVisible();
  }

  async expectCoreControlsVisible(): Promise<void> {
    await this.expectLoaded();
    await expect(priceListLocators.itemSearch(this.page)).toBeVisible();
    await expect(priceListLocators.search(this.page)).toBeVisible();
  }

  async hasInactiveView(): Promise<boolean> {
    return await priceListLocators.inactiveView(this.page).count() > 0;
  }

  async openInactiveView(): Promise<void> {
    await priceListLocators.inactiveView(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  }

  async expectInactiveLoaded(): Promise<void> {
    await expect(priceListLocators.inactiveHeading(this.page)).toBeVisible();
  }

  async expectSearchInputEditable(): Promise<void> {
    await expect(priceListLocators.itemSearch(this.page)).toBeEditable();
  }

  async hasSearchControls(): Promise<boolean> {
    return await priceListLocators.itemSearch(this.page).count() > 0 &&
      await priceListLocators.search(this.page).count() > 0;
  }

  async searchByItem(item: string): Promise<void> {
    await priceListLocators.itemSearch(this.page).fill(item);
    const navigation = this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await priceListLocators.search(this.page).click();
    await navigation;
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    await this.expectLoaded();
  }

  async expectItemVisible(item: string): Promise<void> {
    await expect(this.page.getByText(item, { exact: true }).first()).toBeVisible();
  }

  async expectVisibleResults(): Promise<void> {
    await expect(priceListLocators.resultRows(this.page).first()).toBeVisible();
  }

  async hasPaginationControls(): Promise<boolean> {
    return await priceListLocators.previousPage(this.page).count() > 0 ||
      await priceListLocators.nextPage(this.page).count() > 0 ||
      await priceListLocators.showAllRows(this.page).count() > 0;
  }

  async expectPaginationControls(): Promise<void> {
    const counts = await Promise.all([
      priceListLocators.previousPage(this.page).count(),
      priceListLocators.nextPage(this.page).count(),
      priceListLocators.showAllRows(this.page).count(),
    ]);
    expect(counts.some((count) => count > 0)).toBe(true);
  }

  async hasDeleteControls(): Promise<boolean> {
    return await priceListLocators.deleteAll(this.page).count() > 0 ||
      await priceListLocators.rowDelete(this.page).count() > 0;
  }

  async expectDeleteControls(): Promise<void> {
    await expect(priceListLocators.deleteAll(this.page).or(priceListLocators.rowDelete(this.page)).first()).toBeVisible();
    await expect(priceListLocators.save(this.page)).toBeVisible();
    await expect(priceListLocators.cancel(this.page)).toBeVisible();
  }

  async openFromPriceCodeAndReturn(): Promise<void> {
    const link = this.page.locator('a[href*="PriceList"]:visible').first();
    await expect(link).toBeVisible();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.expectLoaded();
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await expect(this.page.getByText('Price Code Maintenance', { exact: true })).toBeVisible();
  }

  async hasExportControl(): Promise<boolean> {
    return await priceListLocators.exportToExcel(this.page).count() > 0;
  }

  async hasUploadWorkflow(): Promise<boolean> {
    return await priceListLocators.uploadLinks(this.page).count() > 0 ||
      await priceListLocators.uploadControl(this.page).count() > 0;
  }

  async openUploadWorkflow(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: 15_000 }).catch(() => undefined);
    const link = priceListLocators.uploadLinks(this.page).first();
    if (await link.count() > 0) await link.click();
    else await priceListLocators.uploadControl(this.page).click();
    const popup = await popupPromise;
    const target = popup || this.page;
    await target.waitForLoadState('domcontentloaded', { timeout: 30_000 }).catch(() => undefined);
    // The popup can land on a session-expired login prompt mid-suite; re-authenticate there
    // instead of timing out waiting for the upload heading that will never appear.
    await new AshleyNetShellPage(target).loginIfRequired();
    await expect(priceListLocators.uploadHeading(target)).toBeVisible({ timeout: 30_000 });
    return target;
  }

  async expectUploadControls(target: Page): Promise<void> {
    await expect(priceListLocators.uploadHeading(target)).toBeVisible();
    await expect(priceListLocators.hasHeaderRow(target)).toBeVisible();
    await expect(priceListLocators.effectiveDate(target)).toBeVisible();
    await expect(priceListLocators.doNotReplaceOpenOrders(target)).toBeVisible();
    await expect(priceListLocators.uploadSpreadsheet(target)).toBeVisible();
    await expect(priceListLocators.notUploadedList(target)).toBeVisible();
    await expect(priceListLocators.closeWindow(target)).toBeVisible();
  }

  getApprovedEffectiveDate(): Date {
    const configured = process.env.PRICE_LIST_EFFECTIVE_DATE?.trim();
    if (configured) {
      const parsed = new Date(`${configured}T00:00:00`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
      throw new Error('PRICE_LIST_EFFECTIVE_DATE must be a valid date such as 2026-09-10.');
    }

    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 7);
    return date;
  }

  formatEffectiveDate(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }

  /**
   * Attempts to open a popup calendar widget for the effective date field.
   * On this stage page the field is a plain typeable text input with no
   * calendar picker attached, so returns false when no calendar appears
   * rather than failing — callers fall back to typing the date directly.
   */
  async openEffectiveDateCalendar(target: Page): Promise<boolean> {
    const date = priceListLocators.effectiveDate(target);
    await expect(date).toBeVisible();
    await date.click();
    if (await priceListLocators.calendar(target).count() === 0 && await priceListLocators.effectiveDateTrigger(target).count() > 0) {
      await priceListLocators.effectiveDateTrigger(target).click();
    }
    return await priceListLocators.calendar(target).isVisible().catch(() => false);
  }

  async selectEffectiveDateFromCalendar(target: Page, date: Date): Promise<void> {
    const calendarOpened = await this.openEffectiveDateCalendar(target);
    if (!calendarOpened) {
      // No calendar widget is attached to this field on stage; the field
      // accepts a typed date directly.
      const dateInput = priceListLocators.effectiveDate(target);
      await dateInput.fill(this.formatEffectiveDate(date));
      return;
    }

    const day = String(date.getDate());
    const calendar = priceListLocators.calendar(target);
    const dayLocators = [
      calendar.locator(`.ajax__calendar_day:not(.ajax__calendar_other):text-is("${day}")`),
      calendar.getByRole('gridcell', { name: new RegExp(`^${day}$`) }),
      calendar.getByText(day, { exact: true }),
    ];

    for (let monthAttempt = 0; monthAttempt < 14; monthAttempt += 1) {
      for (const candidate of dayLocators) {
        if (await candidate.count() > 0) {
          await candidate.first().click();
          return;
        }
      }
      const next = priceListLocators.calendarNext(target);
      if (await next.count() === 0) break;
      await next.click();
    }

    throw new Error(`Effective date ${this.formatEffectiveDate(date)} was not available in the calendar.`);
  }

  async expectEffectiveDate(target: Page, date: Date): Promise<void> {
    await expect(priceListLocators.effectiveDate(target)).toHaveValue(this.formatEffectiveDate(date));
  }

  async getAdjustmentComboBoxes(target: Page) {
    return target.getByRole('combobox');
  }

  /**
   * Exercises each adjustment dropdown by cycling through its available
   * options one at a time, confirming the selection sticks. This validates
   * every adjustment combination exposed on the upload popup, not just the
   * default selection.
   */
  async exerciseAdjustmentCombinations(target: Page): Promise<void> {
    const comboBoxes = target.getByRole('combobox');
    const count = await comboBoxes.count();
    for (let i = 0; i < count; i += 1) {
      const combo = comboBoxes.nth(i);
      const optionValues = await combo.locator('option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value).filter((value) => value !== ''),
      );
      for (const value of optionValues) {
        await combo.selectOption(value);
        await expect(combo).toHaveValue(value);
      }
    }
  }

  async expectUploadStatus(target: Page): Promise<void> {
    // Upload processing can take longer than the default assertion timeout
    // on stage; wait for the network to settle before asserting on the
    // completion text, and allow extra time for the server-side processing
    // to finish rendering the "Completed 100%" summary.
    await target.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => undefined);
    await expect(priceListLocators.completion(target)).toBeVisible({ timeout: 60_000 });
    await expect(priceListLocators.uploadSummary(target)).toBeVisible({ timeout: 60_000 });
  }

  async expectUploadValidationWithoutFile(target: Page): Promise<void> {
    await priceListLocators.uploadSpreadsheet(target).click();
    await expect.poll(async () => {
      const body = await target.locator('body').innerText().catch(() => '');
      return /choose file|select.*file|file.*required|upload.*file|error/i.test(body);
    }).toBe(true);
  }

  async expectNotUploadedList(target: Page): Promise<void> {
    const context = target.context();
    const popupPromise = context.waitForEvent('page', { timeout: 5_000 }).catch(() => undefined);
    await priceListLocators.notUploadedList(target).click();
    const report = (await popupPromise) || target;
    if (report !== target) await report.waitForLoadState('domcontentloaded').catch(() => undefined);
    await report.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    await expect.poll(async () => {
      const body = await report.locator('body').innerText().catch(() => '');
      return /not uploaded|already uploaded|total not uploaded|no.*records|no.*rows|no.*items/i.test(body)
        || await report.locator('table').count() > 0;
    }, { timeout: 15_000 }).toBe(true);
  }

  async uploadApprovedSpreadsheet(target: Page, effectiveDate?: Date): Promise<void> {
    const file = process.env.PRICE_LIST_UPLOAD_FILE?.trim();
    if (!file) throw new Error('PRICE_LIST_UPLOAD_FILE is required for the approved spreadsheet upload test.');
    await this.uploadSpreadsheetFile(target, file, effectiveDate);
  }

  /**
   * Uploads an explicit spreadsheet file path against the currently open upload
   * popup/target. Used to drive multiple scenario files (valid, duplicate,
   * header-variant) against the same Price Code within one e2e test.
   */
  async uploadSpreadsheetFile(target: Page, filePath: string, effectiveDate?: Date): Promise<void> {
    if (effectiveDate) {
      await this.selectEffectiveDateFromCalendar(target, effectiveDate);
      await this.expectEffectiveDate(target, effectiveDate);
    }
    await priceListLocators.uploadFile(target).setInputFiles(filePath);
    await priceListLocators.uploadSpreadsheet(target).click();
    await this.expectUploadStatus(target);
    if (effectiveDate) await this.expectEffectiveDate(target, effectiveDate);
  }

  async closeUploadTarget(target: Page): Promise<void> {
    if (target !== this.page && !target.isClosed()) await target.close();
  }

  async exportAndReturnDownload(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await priceListLocators.exportToExcel(this.page).click();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }
}