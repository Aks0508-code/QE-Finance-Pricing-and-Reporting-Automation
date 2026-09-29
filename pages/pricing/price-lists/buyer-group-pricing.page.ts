import { expect, type Page } from '@playwright/test';
import { runtimeConfig } from '../../../config/runtime-config';
import { buyerGroupLocators } from '../../../locators/pricing/buyer-groups.locators';

export class BuyerGroupPricingPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    const query = new URLSearchParams({
      envSelected: process.env.BUYER_GROUP_ENVIRONMENT?.trim() || 'AFI',
      curr: process.env.BUYER_GROUP_CURRENCY?.trim() || 'USD',
      BuyingGroup: process.env.BUYER_GROUP_CODE?.trim() || '001',
    });
    await this.page.goto(`${runtimeConfig.buyerGroupPricingPath}?${query.toString()}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectRouteLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/BuyerGroupPricing\.aspx/i);
  }

  async hasHeading(): Promise<boolean> {
    return await buyerGroupLocators.pricingHeading(this.page).count() > 0;
  }

  async hasRows(): Promise<boolean> {
    return await buyerGroupLocators.pricingRows(this.page).count() > 0;
  }

  async hasEditableControls(): Promise<boolean> {
    return await buyerGroupLocators.pricingEditableInputs(this.page).count() > 0;
  }

  async hasPriceFields(): Promise<boolean> {
    return await buyerGroupLocators.pricingPriceInputs(this.page).count() > 0;
  }

  async hasEffectiveDateFields(): Promise<boolean> {
    return await buyerGroupLocators.pricingEffectiveDateInputs(this.page).count() > 0;
  }

  async hasAdjustmentFields(): Promise<boolean> {
    return await buyerGroupLocators.pricingAdjustmentInputs(this.page).count() > 0;
  }

  async hasSaveCancel(): Promise<boolean> {
    return await buyerGroupLocators.pricingSave(this.page).count() > 0 &&
      await buyerGroupLocators.pricingCancel(this.page).count() > 0;
  }

  async hasInactiveView(): Promise<boolean> {
    return await buyerGroupLocators.pricingInactive(this.page).count() > 0;
  }

  async hasUpdateQueue(): Promise<boolean> {
    return await buyerGroupLocators.pricingUpdateQueue(this.page).count() > 0;
  }

  async hasExport(): Promise<boolean> {
    return await buyerGroupLocators.pricingExport(this.page).count() > 0;
  }

  async expectEditableControls(): Promise<void> {
    await expect(buyerGroupLocators.pricingEditableInputs(this.page).first()).toBeVisible();
  }

  async expectPriceAndEffectiveDateEditable(): Promise<void> {
    await expect(buyerGroupLocators.pricingPriceInputs(this.page).first()).toBeEditable();
    await expect(buyerGroupLocators.pricingEffectiveDateInputs(this.page).first()).toBeEditable();
  }

  async cancelFirstPriceEdit(): Promise<void> {
    const price = buyerGroupLocators.pricingPriceInputs(this.page).first();
    const original = await price.inputValue();
    await price.fill(original === '0.00' ? '0.01' : '0.00');
    await buyerGroupLocators.pricingCancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expect(buyerGroupLocators.pricingPriceInputs(this.page).first()).toHaveValue(original);
  }

  async exportAndReturnFilename(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await buyerGroupLocators.pricingExport(this.page).click();
    return (await downloadPromise).suggestedFilename();
  }
}