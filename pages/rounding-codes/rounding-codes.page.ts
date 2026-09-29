import { expect, type Page } from '@playwright/test';
import { getRoundingCodesData, isProtectedRoundingCode } from '../../config/rounding-codes-data';
import { runtimeConfig } from '../../config/runtime-config';
import { roundingCodesLocators as locators } from '../../locators/rounding-codes.locators';

export class RoundingCodesPage {
  constructor(private readonly page: Page) {}

  get currentPage(): Page { return this.page; }

  async goto(): Promise<void> {
    await this.page.goto(new URL(runtimeConfig.roundingCodesPath, runtimeConfig.baseURL).toString(), { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/PriceMaintenance_Net\/RoundingCodes\.aspx/i);
    await expect(locators.heading(this.page)).toBeVisible();
    expect(new URL(this.page.url()).hostname).toBe('stage.ashleynet.com');
  }

  async expectCoreControls(): Promise<void> {
    await this.expectLoaded();
    for (const control of [locators.newCode(this.page), locators.newDescription(this.page), locators.addCode(this.page), locators.grid(this.page), locators.save(this.page), locators.cancel(this.page)]) await expect(control).toBeVisible();
  }

  async hasRows(): Promise<boolean> { return await locators.rows(this.page).count() > 0; }
  async rowCount(): Promise<number> { return locators.rows(this.page).count(); }

  async expectGridHeaders(): Promise<void> {
    for (const header of ['Code', 'Description', 'Delete']) await expect(locators.grid(this.page).getByText(header, { exact: true }).first()).toBeVisible();
  }

  async expectRowsHaveCodesAndDescriptions(): Promise<void> {
    const rows = locators.rows(this.page);
    expect(await rows.count()).toBeGreaterThan(0);
    for (let index = 0; index < await rows.count(); index += 1) {
      const row = rows.nth(index);
      await expect(row.locator('a[id$="_lnkEdit"]')).toBeVisible();
      await expect(row.locator('input[id$="_txtDescrip"]')).toBeVisible();
      await expect(row.locator('input[id$="_chkDelete"]')).toBeVisible();
    }
  }

  async expectProtectedCodeUnselected(code = '0'): Promise<void> {
    const row = locators.rowByCode(this.page, code);
    await expect(row).toBeVisible();
    await expect(row.locator('input[id$="_chkDelete"]')).not.toBeChecked();
    expect(isProtectedRoundingCode(code)).toBe(true);
  }

  async fillAndClearNewCode(): Promise<void> { await locators.newCode(this.page).fill('AUTOMATION_ONLY'); await locators.newCode(this.page).clear(); }
  async fillAndClearNewDescription(): Promise<void> { await locators.newDescription(this.page).fill('AUTOMATION_ONLY'); await locators.newDescription(this.page).clear(); }

  async cancelUnsavedDescriptionEdit(): Promise<void> {
    const description = locators.description(this.page).first();
    const original = await description.inputValue();
    await description.fill(`${original} AUTOMATION_ONLY`);
    await locators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
    if (await locators.description(this.page).count()) await expect(locators.description(this.page).first()).toHaveValue(original);
  }

  async selectApprovedDeleteCode(): Promise<void> {
    const data = getRoundingCodesData();
    const row = locators.rowByCode(this.page, data.deleteCode);
    await expect(row).toBeVisible();
    await expect(row.locator('input[id$="_chkDelete"]')).not.toBeChecked();
    await row.locator('input[id$="_chkDelete"]').check();
    await expect(row.locator('input[id$="_chkDelete"]')).toBeChecked();
  }
}