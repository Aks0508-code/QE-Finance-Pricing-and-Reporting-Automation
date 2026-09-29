import { expect, type Page } from '@playwright/test';
import { runtimeConfig } from '../../../config/runtime-config';
import { rateValidationLimitsLocators } from '../../../locators/pricing/rate-validation-limits.locators';

export class RateValidationLimitsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    const query = new URLSearchParams({
      envSelected: process.env.RATE_VALIDATION_ENVIRONMENT?.trim() || 'AFI',
    });
    await this.page.goto(`${runtimeConfig.rateValidationLimitsPath}?${query.toString()}`, {
      waitUntil: 'domcontentloaded',
    });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/RateValidationLimits\.aspx/i);
    await expect(rateValidationLimitsLocators.heading(this.page)).toBeVisible();
  }

  async expectCoreControls(): Promise<void> {
    await this.expectLoaded();
    await expect(rateValidationLimitsLocators.environment(this.page)).toBeVisible();
    await expect(rateValidationLimitsLocators.save(this.page)).toBeVisible();
    await expect(rateValidationLimitsLocators.cancel(this.page)).toBeVisible();
  }

  async hasEnvironment(): Promise<boolean> {
    return await rateValidationLimitsLocators.environment(this.page).count() > 0;
  }

  async hasRows(): Promise<boolean> {
    return await rateValidationLimitsLocators.limitRows(this.page).count() > 0;
  }

  async hasEditableLimitInputs(): Promise<boolean> {
    return await rateValidationLimitsLocators.limitInputs(this.page).count() > 0;
  }

  async hasSaveCancel(): Promise<boolean> {
    return await rateValidationLimitsLocators.save(this.page).count() > 0 &&
      await rateValidationLimitsLocators.cancel(this.page).count() > 0;
  }

  async expectEnvironmentOptions(): Promise<void> {
    const options = rateValidationLimitsLocators.environment(this.page).locator('option');
    expect(await options.count()).toBeGreaterThan(0);
  }

  async expectLimitInputsEditable(): Promise<void> {
    const inputs = rateValidationLimitsLocators.limitInputs(this.page);
    await expect(inputs.first()).toBeEditable();
    await expect(inputs.nth(1)).toBeEditable();
  }

  async expectRowsHaveLowerAndUpperInputs(): Promise<void> {
    const rows = rateValidationLimitsLocators.limitRows(this.page);
    await expect(rows.first().locator('input:not([type="hidden"]):visible')).toHaveCount(2);
  }

  async expectConfirmedRowInventory(): Promise<void> {
    const rows = rateValidationLimitsLocators.limitRows(this.page);
    await expect(rows).toHaveCount(12);
    await expect(rows.filter({ hasText: 'Price Exceptions' })).toHaveCount(6);
    await expect(rows.filter({ hasText: 'Buyer Group Pricing' })).toHaveCount(6);
  }

  async expectEveryRowHasOrderedNumericLimits(): Promise<void> {
    const rows = rateValidationLimitsLocators.limitRows(this.page);
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    for (let index = 0; index < rowCount; index += 1) {
      const inputs = rows.nth(index).locator('input:not([type="hidden"]):visible');
      await expect(inputs).toHaveCount(2);
      const lower = Number(await inputs.first().inputValue());
      const upper = Number(await inputs.nth(1).inputValue());
      expect(Number.isFinite(lower)).toBe(true);
      expect(Number.isFinite(upper)).toBe(true);
      expect(lower).toBeLessThanOrEqual(upper);
    }
  }

  async expectConfirmedFieldDescriptions(): Promise<void> {
    const rows = rateValidationLimitsLocators.limitRows(this.page);
    for (const description of ['Standard Discount', 'Negative Discount', 'CO OP Add', 'DFI Discount', 'Plus Discount', 'Commission']) {
      await expect(rows.filter({ hasText: description })).toHaveCount(2);
    }
  }

  async selectAlternateEnvironmentIfAvailable(): Promise<boolean> {
    const environment = rateValidationLimitsLocators.environment(this.page);
    const optionCount = await environment.locator('option').count();
    if (optionCount < 2) return false;

    await environment.selectOption({ index: 1 });
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expect(environment.locator('option:checked')).toHaveCount(1);
    return true;
  }

  async expectDisplayedLimitsAreNumeric(): Promise<void> {
    const inputs = rateValidationLimitsLocators.limitInputs(this.page);
    const count = Math.min(await inputs.count(), 4);
    for (let index = 0; index < count; index += 1) {
      const value = await inputs.nth(index).inputValue();
      expect(value.trim()).toMatch(/^-?\d+(\.\d+)?$/);
    }
  }

  async cancelFirstUnsavedEdit(): Promise<void> {
    const input = rateValidationLimitsLocators.limitInputs(this.page).first();
    const original = await input.inputValue();
    await input.fill(original === '0.0000' ? '1.0000' : '0.0000');
    await rateValidationLimitsLocators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
  }

  async submitInvalidRangeForValidation(): Promise<void> {
    const row = rateValidationLimitsLocators.limitRows(this.page).first();
    const inputs = row.locator('input:not([type="hidden"]):visible');
    await inputs.first().fill('1.0000');
    await inputs.nth(1).fill('0.0000');
    await rateValidationLimitsLocators.save(this.page).click();
  }

  async hasValidationMessage(): Promise<boolean> {
    return await rateValidationLimitsLocators.validationMessage(this.page).count() > 0;
  }
}