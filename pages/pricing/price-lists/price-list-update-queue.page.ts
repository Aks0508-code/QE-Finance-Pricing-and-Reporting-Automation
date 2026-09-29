import { expect, type Page } from '@playwright/test';
import { runtimeConfig } from '../../../config/runtime-config';
import { getPriceListUpdateQueueData, type PriceListUpdateQueueData } from '../../../config/price-list-update-queue-data';
import { priceListUpdateQueueLocators } from '../../../locators/pricing/price-list-update-queue.locators';

export class PriceListUpdateQueuePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    const data = getPriceListUpdateQueueData();
    const query = new URLSearchParams({
      envSelected: data.environment,
      curr: data.currency,
      PriceCode: data.priceCode,
      basePrice: data.basePrice,
    });
    await this.page.goto(`${runtimeConfig.priceListUpdateQueuePath}?${query.toString()}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(priceListUpdateQueueLocators.heading(this.page)).toBeVisible();
  }

  async expectCoreControls(): Promise<void> {
    await this.expectLoaded();
    await expect(priceListUpdateQueueLocators.search(this.page)).toBeVisible();
    await expect(priceListUpdateQueueLocators.save(this.page)).toBeVisible();
    await expect(priceListUpdateQueueLocators.cancel(this.page)).toBeVisible();
  }

  async hasSearchControls(): Promise<boolean> {
    return await priceListUpdateQueueLocators.itemSearch(this.page).count() > 0 &&
      await priceListUpdateQueueLocators.search(this.page).count() > 0;
  }

  async hasEditablePrice(): Promise<boolean> {
    return await priceListUpdateQueueLocators.priceInputs(this.page).count() > 0;
  }

  async hasEffectiveDate(): Promise<boolean> {
    return await priceListUpdateQueueLocators.effectiveDateInputs(this.page).count() > 0;
  }

  async hasPagination(): Promise<boolean> {
    return await priceListUpdateQueueLocators.previousPage(this.page).count() > 0 ||
      await priceListUpdateQueueLocators.nextPage(this.page).count() > 0 ||
      await priceListUpdateQueueLocators.showAllRows(this.page).count() > 0;
  }

  async expectRows(): Promise<void> {
    await expect(priceListUpdateQueueLocators.rows(this.page).first()).toBeVisible();
  }

  async expectEditablePriceAndEffectiveDate(): Promise<void> {
    await expect(priceListUpdateQueueLocators.priceInputs(this.page).first()).toBeEditable();
    await expect(priceListUpdateQueueLocators.effectiveDateInputs(this.page).first()).toBeEditable();
  }

  async searchByItem(item: string): Promise<void> {
    await priceListUpdateQueueLocators.itemSearch(this.page).fill(item);
    await priceListUpdateQueueLocators.search(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
  }

  async cancelFirstPriceEdit(): Promise<void> {
    const price = priceListUpdateQueueLocators.priceInputs(this.page).first();
    const original = await price.inputValue();
    const candidate = Number.parseFloat(original);
    const changed = Number.isFinite(candidate) ? (candidate + 0.01).toFixed(2) : '0.01';
    await price.fill(changed);
    await priceListUpdateQueueLocators.cancel(this.page).click();
    await expect(priceListUpdateQueueLocators.priceInputs(this.page).first()).toHaveValue(original);
  }

  async savePriceAndRestore(data: PriceListUpdateQueueData, originalPrice: string, testPrice: string): Promise<void> {
    const price = priceListUpdateQueueLocators.priceInputs(this.page).first();
    await price.fill(testPrice);
    await priceListUpdateQueueLocators.save(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.goto();
    await this.expectLoaded();
    await expect(priceListUpdateQueueLocators.priceInputs(this.page).first()).toHaveValue(testPrice);

    await priceListUpdateQueueLocators.priceInputs(this.page).first().fill(originalPrice);
    await priceListUpdateQueueLocators.save(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.goto();
    await this.expectLoaded();
    await expect(priceListUpdateQueueLocators.priceInputs(this.page).first()).toHaveValue(originalPrice);
    void data;
  }

  async exportAndReturnDownload(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await priceListUpdateQueueLocators.exportToExcel(this.page).click();
    return (await downloadPromise).suggestedFilename();
  }
}