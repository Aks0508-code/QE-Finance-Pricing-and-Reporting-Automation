import { expect, type Page } from '@playwright/test';
import { runtimeConfig } from '../../../config/runtime-config';
import { buyerGroupLocators } from '../../../locators/pricing/buyer-groups.locators';

export class BuyerGroupMaintenancePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(runtimeConfig.buyerGroupsPath, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(buyerGroupLocators.heading(this.page)).toBeVisible();
  }

  async expectCoreControls(): Promise<void> {
    await this.expectLoaded();
    await expect(buyerGroupLocators.environment(this.page)).toBeVisible();
    await expect(buyerGroupLocators.itemSearch(this.page)).toBeVisible();
    await expect(buyerGroupLocators.customerSearch(this.page)).toBeVisible();
    await expect(buyerGroupLocators.categorySearch(this.page)).toBeVisible();
    await expect(buyerGroupLocators.addNewItem(this.page)).toBeVisible();
    await expect(buyerGroupLocators.viewInactive(this.page)).toBeVisible();
    await expect(buyerGroupLocators.addNew(this.page)).toBeVisible();
    await expect(buyerGroupLocators.save(this.page)).toBeVisible();
    await expect(buyerGroupLocators.cancel(this.page)).toBeVisible();
    await expect(buyerGroupLocators.exportToExcel(this.page)).toBeVisible();
  }

  async hasActiveRows(): Promise<boolean> {
    return await buyerGroupLocators.activeRows(this.page).count() > 0;
  }

  async expectActiveRowsEditable(): Promise<void> {
    await expect(buyerGroupLocators.activeRows(this.page).first()).toBeVisible();
    await expect(buyerGroupLocators.descriptionInputs(this.page).first()).toBeEditable();
    await expect(buyerGroupLocators.categoryInputs(this.page).first()).toBeEditable();
  }

  async hasSearchControls(): Promise<boolean> {
    return await buyerGroupLocators.itemSearch(this.page).count() > 0 &&
      await buyerGroupLocators.customerSearch(this.page).count() > 0 &&
      await buyerGroupLocators.categorySearch(this.page).count() > 0 &&
      await buyerGroupLocators.search(this.page).count() > 0;
  }

  async searchByItem(item: string): Promise<void> {
    await buyerGroupLocators.itemSearch(this.page).fill(item);
    await this.submitSearch();
  }

  async searchByCustomer(customer: string): Promise<void> {
    await buyerGroupLocators.customerSearch(this.page).fill(customer);
    await this.submitSearch();
  }

  async searchByCategory(category: string): Promise<void> {
    await buyerGroupLocators.categorySearch(this.page).selectOption({ label: category });
    await this.submitSearch();
  }

  async openInactiveView(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await buyerGroupLocators.viewInactive(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  }

  async expectInactiveLoaded(): Promise<void> {
    await expect(buyerGroupLocators.inactiveHeading(this.page)).toBeVisible();
  }

  async hasInactiveRows(): Promise<boolean> {
    return await buyerGroupLocators.inactiveRows(this.page).count() > 0;
  }

  async openAddNew(): Promise<Page> {
    return await this.openPopupOrCurrent(buyerGroupLocators.addNew(this.page));
  }

  async openAddNewItem(): Promise<Page> {
    return await this.openPopupOrCurrent(buyerGroupLocators.addNewItem(this.page));
  }

  async openDefaults(): Promise<Page> {
    return await this.openPopupOrCurrent(buyerGroupLocators.defaults(this.page));
  }

  async openFirstCustomerMembers(): Promise<void> {
    const link = buyerGroupLocators.customerLinks(this.page).first();
    await expect(link).toBeVisible();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
  }

  async openFirstPricing(): Promise<void> {
    const link = buyerGroupLocators.pricingLinks(this.page).first();
    await expect(link).toBeVisible();
    await link.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
  }

  async exportAndReturnFilename(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await buyerGroupLocators.exportToExcel(this.page).click();
    return (await downloadPromise).suggestedFilename();
  }

  private async submitSearch(): Promise<void> {
    const navigation = this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await buyerGroupLocators.search(this.page).click();
    await navigation;
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    await this.expectLoaded();
  }

  private async openPopupOrCurrent(trigger: ReturnType<typeof buyerGroupLocators.addNew>): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: 5_000 }).catch(() => undefined);
    await trigger.click();
    const popup = await popupPromise;
    const target = popup || this.page;
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    await target.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    return target;
  }
}