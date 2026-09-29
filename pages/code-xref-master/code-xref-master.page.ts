import { expect, type Locator, type Page } from '@playwright/test';
import { runtimeConfig } from '../../config/runtime-config';
import { codeXRefMasterLocators } from '../../locators/code-xref-master.locators';

export class CodeXRefMasterPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    const query = new URLSearchParams({ envSelected: process.env.CODE_XREF_MASTER_ENVIRONMENT?.trim() || 'AFI' });
    await this.page.goto(`${runtimeConfig.codeXRefMasterPath}?${query.toString()}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/CodeXRefMaster\.aspx/i);
    await expect(codeXRefMasterLocators.heading(this.page)).toBeVisible();
  }

  async expectCoreControls(): Promise<void> {
    await this.expectLoaded();
    await expect(codeXRefMasterLocators.environment(this.page)).toBeVisible();
    await expect(codeXRefMasterLocators.baseCodeSearch(this.page)).toBeVisible();
    await expect(codeXRefMasterLocators.search(this.page)).toBeVisible();
    await expect(codeXRefMasterLocators.addNew(this.page)).toBeVisible();
    await expect(codeXRefMasterLocators.save(this.page)).toBeVisible();
    await expect(codeXRefMasterLocators.cancel(this.page)).toBeVisible();
  }

  async hasSearchControls(): Promise<boolean> {
    return await codeXRefMasterLocators.baseCodeSearch(this.page).count() > 0 &&
      await codeXRefMasterLocators.search(this.page).count() > 0;
  }

  async hasRows(): Promise<boolean> {
    return await codeXRefMasterLocators.dataRows(this.page).count() > 0;
  }

  async expectGridHeadersAndRows(): Promise<void> {
    const grid = codeXRefMasterLocators.grid(this.page);
    for (const header of ['Delete', 'Type', 'Base Code', 'Xref Code']) {
      await expect(grid.getByText(header, { exact: true }).first()).toBeVisible();
    }
    await expect(codeXRefMasterLocators.dataRows(this.page).first()).toBeVisible();
  }

  async expectSafeEditableRow(): Promise<void> {
    const row = await this.findSafeRow();
    await expect(row.locator('input[type="checkbox"]:visible').first()).toBeVisible();
    await expect(row.locator('input[type="text"]:visible').first()).toBeEditable();
    await expect(row.locator('input[type="text"]:visible').nth(1)).toBeEditable();
  }

  async searchByBaseCode(baseCode: string): Promise<void> {
    await codeXRefMasterLocators.baseCodeSearch(this.page).fill(baseCode);
    await codeXRefMasterLocators.search(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
  }

  async expectEnvironmentOptions(): Promise<void> {
    await expect(codeXRefMasterLocators.environment(this.page).locator('option')).not.toHaveCount(0);
  }

  async selectAlternateEnvironmentIfAvailable(): Promise<boolean> {
    const environment = codeXRefMasterLocators.environment(this.page);
    if (await environment.locator('option').count() < 2) return false;
    await environment.selectOption({ index: 1 });
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expect(environment.locator('option:checked')).toHaveCount(1);
    return true;
  }

  async cancelFirstSafeUnsavedEdit(): Promise<void> {
    const row = await this.findSafeRow();
    const input = row.locator('input[type="text"]:visible').first();
    const original = await input.inputValue();
    await input.fill(`${original} AUTOMATION_ONLY`);
    await codeXRefMasterLocators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
    const restoredRow = await this.findSafeRow();
    await expect(restoredRow.locator('input[type="text"]:visible').first()).toHaveValue(original);
  }

  async exportAndReturnFilename(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await codeXRefMasterLocators.exportToExcel(this.page).click();
    return (await downloadPromise).suggestedFilename();
  }

  async openAddNew(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: 5_000 }).catch(() => undefined);
    await codeXRefMasterLocators.addNew(this.page).click();
    const popup = await popupPromise;
    const target = popup || await this.page.context().newPage();
    if (!popup) await target.goto(`${runtimeConfig.baseURL}/PriceMaintenance_Net/CodeXRefMasterNew.aspx?envSelected=AFI`, { waitUntil: 'domcontentloaded' });
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    return target;
  }

  async hasEntryForm(target: Page): Promise<boolean> {
    return /CodeXRefMasterNew\.aspx/i.test(target.url()) && await codeXRefMasterLocators.entryHeading(target).count() > 0;
  }

  async expectEntryForm(target: Page): Promise<void> {
    await expect(codeXRefMasterLocators.entryHeading(target)).toBeVisible();
    await expect(codeXRefMasterLocators.entryType(target)).toBeVisible();
    await expect(codeXRefMasterLocators.entryBaseCode(target)).toBeVisible();
    await expect(codeXRefMasterLocators.entryXRefCode(target)).toBeVisible();
    await expect(codeXRefMasterLocators.entrySave(target)).toBeVisible();
    await expect(codeXRefMasterLocators.entryCancel(target)).toBeVisible();
  }

  async cancelEntry(target: Page): Promise<void> {
    await codeXRefMasterLocators.entryCancel(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (target !== this.page && !target.isClosed()) await target.close();
    await this.expectLoaded();
  }

  async submitBlankEntry(target: Page): Promise<void> {
    await codeXRefMasterLocators.entryBaseCode(target).fill('');
    await codeXRefMasterLocators.entryXRefCode(target).fill('');
    await codeXRefMasterLocators.entrySave(target).click();
    await expect(codeXRefMasterLocators.validationMessage(target)).toBeVisible();
  }

  private async findSafeRow(): Promise<Locator> {
    const rows = codeXRefMasterLocators.dataRows(this.page);
    for (let index = 0; index < await rows.count(); index += 1) {
      const row = rows.nth(index);
      const inputs = row.locator('input[type="text"]:visible');
      const values: string[] = [];
      for (let inputIndex = 0; inputIndex < await inputs.count(); inputIndex += 1) {
        values.push(await inputs.nth(inputIndex).inputValue());
      }
      if (!/FOBARC|\*/i.test(values.join(' '))) return row;
    }
    throw new Error('No safe Code Cross Reference row was found after excluding FOBARC and asterisk-marked records.');
  }
}