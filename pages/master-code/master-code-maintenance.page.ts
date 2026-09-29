import { expect, type Page } from '@playwright/test';
import { runtimeConfig } from '../../config/runtime-config';
import { masterCodeLocators } from '../../locators/master-code.locators';

export class MasterCodeMaintenancePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(runtimeConfig.masterCodePath, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/MasterCode\.aspx/i);
    await expect(masterCodeLocators.heading(this.page)).toBeVisible();
  }

  async expectCoreControls(): Promise<void> {
    await this.expectLoaded();
    await expect(masterCodeLocators.environment(this.page)).toBeVisible();
    await expect(masterCodeLocators.pageNameSearch(this.page)).toBeVisible();
    await expect(masterCodeLocators.typeSearch(this.page)).toBeVisible();
    await expect(masterCodeLocators.search(this.page)).toBeVisible();
    await expect(masterCodeLocators.exportToExcel(this.page)).toBeVisible();
    await expect(masterCodeLocators.addNew(this.page)).toBeVisible();
    await expect(masterCodeLocators.save(this.page)).toBeVisible();
    await expect(masterCodeLocators.cancel(this.page)).toBeVisible();
  }

  async hasSearchControls(): Promise<boolean> {
    return await masterCodeLocators.pageNameSearch(this.page).count() > 0 &&
      await masterCodeLocators.typeSearch(this.page).count() > 0 &&
      await masterCodeLocators.search(this.page).count() > 0;
  }

  async hasRows(): Promise<boolean> {
    return await masterCodeLocators.dataRows(this.page).count() > 0;
  }

  async expectGridHeadersAndRows(): Promise<void> {
    const grid = masterCodeLocators.grid(this.page);
    for (const header of ['Delete', 'Initial', 'PageName', 'Type', 'Code', 'Description', 'Explanation', 'InUse']) {
      await expect(grid.getByText(header, { exact: true }).first()).toBeVisible();
    }
    await expect(masterCodeLocators.dataRows(this.page).first()).toBeVisible();
  }

  async expectEditableRowFields(): Promise<void> {
    const rows = masterCodeLocators.dataRows(this.page);
    const inputs = rows.first().locator('input[type="text"]:visible');
    expect(await rows.count()).toBeGreaterThan(0);
    expect(await inputs.count()).toBeGreaterThanOrEqual(2);
    await expect(inputs.first()).toBeEditable();
    await expect(inputs.nth(1)).toBeEditable();
  }

  async expectFirstRowMetadataAndDeleteControl(): Promise<void> {
    const row = masterCodeLocators.dataRows(this.page).first();
    await expect(row.locator('input[type="checkbox"]:visible').first()).toBeVisible();
    expect(await row.locator('td:visible').count()).toBeGreaterThanOrEqual(8);
    await expect(row).toContainText(/\S+/);
  }

  async searchBy(pageName: string, type: string): Promise<void> {
    await masterCodeLocators.pageNameSearch(this.page).fill(pageName);
    await masterCodeLocators.typeSearch(this.page).fill(type);
    await masterCodeLocators.search(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
  }

  async selectAlternateEnvironmentIfAvailable(): Promise<boolean> {
    const environment = masterCodeLocators.environment(this.page);
    if (await environment.locator('option').count() < 2) return false;
    await environment.selectOption({ index: 1 });
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expect(masterCodeLocators.environment(this.page).locator('option:checked')).toHaveCount(1);
    return true;
  }

  async cancelFirstUnsavedEdit(): Promise<void> {
    const input = masterCodeLocators.editableInputs(this.page).first();
    const original = await input.inputValue();
    await input.fill(`${original} AUTOMATION_ONLY`);
    await masterCodeLocators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
    await expect(masterCodeLocators.editableInputs(this.page).first()).toHaveValue(original);
  }

  async exportAndReturnFilename(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await masterCodeLocators.exportToExcel(this.page).click();
    return (await downloadPromise).suggestedFilename();
  }

  async openAddNew(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: 5_000 }).catch(() => undefined);
    await masterCodeLocators.addNew(this.page).click();
    const popup = await popupPromise;
    const target = popup || this.page;
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    return target;
  }

  async hasAddNewForm(target: Page): Promise<boolean> {
    return target !== this.page || await target.getByRole('dialog').count() > 0 ||
      await target.getByRole('heading', { name: /Add New/i }).count() > 0;
  }

  async cancelAddNew(target: Page): Promise<void> {
    await masterCodeLocators.cancel(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (target !== this.page && !target.isClosed()) await target.close();
    await this.expectLoaded();
  }

  async submitBlankAddNew(target: Page): Promise<void> {
    await masterCodeLocators.save(target).click();
    await expect(masterCodeLocators.validationMessage(target)).toBeVisible();
  }
}