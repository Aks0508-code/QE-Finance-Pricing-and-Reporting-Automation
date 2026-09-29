import { expect, type Locator, type Page } from '@playwright/test';
import { runtimeConfig } from '../../../config/runtime-config';
import { priceCodeLocators } from '../../../locators/pricing/price-codes.locators';
import type {
  PriceCodeExistingUpdateData,
  PriceCodeInvalidData,
  PriceCodeMutationData,
} from '../../../config/price-code-data';

export class PriceCodeMaintenancePage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto(runtimeConfig.priceCodesPath, { waitUntil: 'domcontentloaded' });
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  async expectLoaded(): Promise<void> {
    await expect(priceCodeLocators.heading(this.page)).toBeVisible();
  }

  async expectCoreControlsVisible(): Promise<void> {
    await expect(priceCodeLocators.environment(this.page)).toBeVisible();
    await expect(priceCodeLocators.currency(this.page)).toBeVisible();
    await expect(priceCodeLocators.categoryCode(this.page)).toBeVisible();
    await expect(priceCodeLocators.search(this.page)).toBeVisible();
    await expect(priceCodeLocators.viewInactive(this.page)).toBeVisible();
    await expect(priceCodeLocators.copyPriceCode(this.page)).toBeVisible();
    await expect(priceCodeLocators.itemAccruals(this.page)).toBeVisible();
    await expect(priceCodeLocators.addNew(this.page)).toBeVisible();
    await expect(priceCodeLocators.save(this.page)).toBeVisible();
    await expect(priceCodeLocators.cancel(this.page)).toBeVisible();
  }

  async selectCurrency(currency: string): Promise<void> {
    await priceCodeLocators.currency(this.page).selectOption({ label: currency });
  }

  async selectCategory(categoryCode: string): Promise<void> {
    await priceCodeLocators.categoryCode(this.page).selectOption({ label: categoryCode });
  }

  async expectCategorySelected(categoryCode: string): Promise<void> {
    await expect(priceCodeLocators.categoryCode(this.page).locator('option:checked')).toHaveText(categoryCode);
  }

  async search(): Promise<void> {
    const navigation = this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await priceCodeLocators.search(this.page).click();
    await navigation;
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  }

  async openAddNew(): Promise<Page> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: 5_000 }).catch(() => undefined);
    await priceCodeLocators.addNew(this.page).click();
    let popup = await popupPromise;
    if (!popup) {
      popup = await this.page.context().newPage();
      await popup.goto(`${runtimeConfig.baseURL}/PriceMaintenance_Net/PriceCodesNew.aspx`, {
        waitUntil: 'domcontentloaded',
      });
    }
    await popup.waitForLoadState('domcontentloaded');
    return popup;
  }

  async expectAddNewWorkflowControls(): Promise<void> {
    const popup = await this.openAddNew();
    try {
      await expect(popup.getByText('New Price Code', { exact: true })).toBeVisible();
      await expect(popup.getByRole('textbox').nth(0)).toBeVisible();
      await expect(popup.getByRole('textbox').nth(1)).toBeVisible();
      await expect(popup.getByRole('combobox').nth(0)).toBeVisible();
      await expect(popup.getByRole('combobox').nth(1)).toBeVisible();
      await expect(popup.getByRole('button', { name: /Submit and Close/i })).toBeVisible();
      await expect(popup.getByRole('button', { name: /Submit and Add/i })).toBeVisible();
      await expect(popup.getByRole('button', { name: /^Cancel$/i })).toBeVisible();
      const closePromise = popup.waitForEvent('close');
      await popup.getByRole('button', { name: /^Cancel$/i }).click();
      await closePromise;
    } finally {
      if (!popup.isClosed()) await popup.close();
    }
  }

  async expectCopyPriceCodeWorkflow(): Promise<void> {
    const popupPromise = this.page.waitForEvent('popup', { timeout: 5_000 }).catch(() => undefined);
    await priceCodeLocators.copyPriceCode(this.page).click();
    const popup = await popupPromise;
    const target = popup || this.page;
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expect(target.getByText(/Copy Price Code|New Price Code/i).first()).toBeVisible();
    const cancel = target.getByRole('button', { name: /^Cancel$/i }).first();
    await expect(cancel).toBeVisible();
    await cancel.click();
    if (popup) {
      await popup.waitForEvent('close').catch(() => undefined);
      if (!popup.isClosed()) await popup.close();
    }
    await this.goto();
    await this.expectLoaded();
  }

  async expectBlankAddNewSubmissionValidation(): Promise<void> {
    const popup = await this.openAddNew();
    try {
      await popup.getByRole('button', { name: /Submit and Close/i }).click();
      expect(popup.isClosed()).toBe(false);
      const validationText = popup.getByText(/required|invalid|select|enter/i).first();
      const browserInvalidField = popup.locator('input:invalid, select:invalid, textarea:invalid').first();
      const hasValidationText = await validationText.count() > 0;
      const hasInvalidField = await browserInvalidField.count() > 0;
      expect(hasValidationText || hasInvalidField).toBe(true);
    } finally {
      if (!popup.isClosed()) await popup.close();
    }
  }

  async expectInvalidAddNewSubmissionValidation(data: PriceCodeInvalidData, mutationData: PriceCodeMutationData): Promise<void> {
    await this.archivePotentialInvalidRecord(data);
    const popup = await this.openAddNew();
    try {
      const textInputs = popup.locator('input[type="text"]:visible, textarea:visible');
      await textInputs.nth(0).fill(data.code);
      if (data.description) await textInputs.nth(1).fill(data.description);
      await popup.getByRole('combobox').nth(0).selectOption({ label: mutationData.categoryCode });
      await popup.getByRole('combobox').nth(1).selectOption({ label: mutationData.vatOption });
      await priceCodeLocators.addNewEnvironmentCheckbox(popup, mutationData.environment).check();
      await popup.getByRole('radio', { name: mutationData.currency, exact: true }).last().check();
      await popup.getByRole('button', { name: /Submit and Close/i }).click();
      if (popup.isClosed()) {
        await this.goto();
        await this.expectLoaded();
        const rows = priceCodeLocators.priceCodeRows(this.page);
        let createdCode: string | undefined;
        const count = await rows.count();
        for (let index = 0; index < count; index += 1) {
          const row = rows.nth(index);
          const code = await row.locator('input[id$="_hdnPriceCode"]').inputValue();
          const description = await row.locator('input[id$="_txtDescrip"]').inputValue();
          if (code === data.code || code === data.code.slice(0, 6) || (data.description && description === data.description)) {
            createdCode = code;
            break;
          }
        }
        if (createdCode) {
          await this.archivePriceCode(createdCode);
          throw new Error(`Invalid Add New data was accepted as Price Code ${createdCode}; the disposable record was archived.`);
        }
        return;
      }
      const validationText = popup.getByText(/invalid|error|required|must|enter|select|length|format/i).first();
      const browserInvalidField = popup.locator('input:invalid, select:invalid, textarea:invalid').first();
      await expect.poll(async () => (await validationText.count() > 0) || (await browserInvalidField.count() > 0)).toBe(true);
    } finally {
      if (!popup.isClosed()) await popup.close();
    }
  }

  async createPriceCode(data: PriceCodeMutationData): Promise<void> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    const popup = await this.openAddNew();
    try {
      const textInputs = popup.locator('input[type="text"]:visible, textarea:visible');
      await textInputs.nth(0).fill(data.code);
      await textInputs.nth(1).fill(data.description);
      await popup.getByRole('combobox').nth(0).selectOption({ label: data.categoryCode });
      await popup.getByRole('combobox').nth(1).selectOption({ label: data.vatOption });
      const includeVat = popup.getByRole('checkbox', { name: /Include VAT/i }).first();
      const noTax = data.vatOption.trim().toUpperCase().startsWith('NO TAX');
      if (await includeVat.count() > 0) await includeVat.setChecked(data.includeVat && !noTax);
      await priceCodeLocators.addNewEnvironmentCheckbox(popup, data.environment).check();
      await popup.getByRole('radio', { name: data.currency, exact: true }).last().check();

      const submitMode = (process.env.PRICE_CODE_TEST_SUBMIT_MODE || 'close').trim().toLowerCase();
      if (submitMode === 'add') {
        await popup.getByRole('button', { name: /Submit and Add/i }).click();
        await popup.waitForLoadState('domcontentloaded').catch(() => undefined);
        const returnButton = popup.getByRole('button', { name: /^(Cancel|Back)$/i }).first();
        const returnLink = popup.getByRole('link', { name: /^(Cancel|Back)$/i }).first();
        if (await returnButton.count() > 0) await returnButton.click();
        else if (await returnLink.count() > 0) await returnLink.click();
        else await popup.close();
        await popup.waitForEvent('close', { timeout: 10_000 }).catch(() => undefined);
      } else {
        const closePromise = popup.waitForEvent('close', { timeout: 15_000 }).catch(() => undefined);
        await popup.getByRole('button', { name: /Submit and Close/i }).click();
        await closePromise;
        if (!popup.isClosed()) {
          const validation = popup.getByText(/error|invalid|required|must|select|enter/i).first();
          const text = await validation.textContent().catch(() => undefined);
          throw new Error(`Add New Price Code ${data.code} was not accepted${text ? `: ${text.trim()}` : '.'}`);
        }
      }
    } finally {
      if (!popup.isClosed()) await popup.close();
    }

    for (let attempt = 0; attempt < 4; attempt += 1) {
      await this.goto();
      await this.expectLoaded();
      await this.setZoomTo75AndScrollToEnd();
      if (await this.findPriceCodeRowByScrolling(data.code, true)) return;
      await this.page.waitForTimeout(1_500);
    }
    throw new Error(`Add New Price Code ${data.code} was submitted but was not found as a deletable active row.`);
  }

  async expectPriceCodeRow(code: string, description: string): Promise<void> {
    const rows = priceCodeLocators.priceCodeRows(this.page);
    const count = await rows.count();
    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      if (await row.locator('input[id$="_hdnPriceCode"]').inputValue() !== code) continue;
      await row.scrollIntoViewIfNeeded();
      await expect(row.locator('input[id$="_txtDescrip"]')).toHaveValue(description);
      return;
    }
    throw new Error(`Created Price Code ${code} was not found in the active grid.`);
  }

  async expectActivePriceCodeOccursOnce(code: string): Promise<void> {
    const rows = priceCodeLocators.priceCodeRows(this.page);
    let matches = 0;
    const count = await rows.count();
    for (let index = 0; index < count; index += 1) {
      if (await rows.nth(index).locator('input[id$="_hdnPriceCode"]').inputValue() === code) matches += 1;
    }
    expect(matches).toBe(1);
  }

  async archivePriceCode(code: string): Promise<void> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    const reasonPage = await this.openArchiveReasonForPriceCode(code);
    await priceCodeLocators.continueReasonCode(reasonPage).click();
    await reasonPage.waitForLoadState('domcontentloaded').catch(() => undefined);
    await reasonPage.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    if (reasonPage !== this.page && !reasonPage.isClosed()) await reasonPage.close();
    await this.page.waitForTimeout(2_000);
    await this.goto();
    await this.expectLoaded();
    await this.openInactiveView();
    await this.expectInactiveLoaded();
    await this.expectInactivePriceCodeRow(code);
    await this.goto();
    await this.expectLoaded();
  }

  async archiveAndReactivatePriceCode(code: string): Promise<void> {
    await this.archivePriceCode(code);
    await this.reactivatePriceCode(code);
  }

  async cancelArchivePriceCode(code: string): Promise<void> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    const reasonPage = await this.openArchiveReasonForPriceCode(code);
    await priceCodeLocators.cancel(reasonPage).click();
    await reasonPage.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (reasonPage !== this.page && !reasonPage.isClosed()) await reasonPage.close();
    await this.goto();
    await this.expectLoaded();
    await this.expectActivePriceCodeOccursOnce(code);
  }

  private async openArchiveReasonForPriceCode(code: string): Promise<Page> {
    await this.goto();
    await this.expectLoaded();
    const row = await this.findPriceCodeRowByScrolling(code, true);
    if (row) {
      await row.locator('input[id$="_chkDelete"]').check();
      const popupPromise = this.page.waitForEvent('popup', { timeout: 15_000 }).catch(() => undefined);
      await priceCodeLocators.save(this.page).click();
      const reasonPage = await popupPromise;
      const targetPage = reasonPage || this.page;
      await targetPage.waitForLoadState('domcontentloaded').catch(() => undefined);
      await expect(priceCodeLocators.reasonCodesHeading(targetPage)).toBeVisible({ timeout: 20_000 });
      return targetPage;
    }
    throw new Error(`Created Price Code ${code} was not found for archive cleanup.`);
  }

  private async findPriceCodeRowByScrolling(code: string, requireDeletable = false): Promise<Locator | undefined> {
    const hiddenCodes = this.page.locator('#grdCode input[id$="_hdnPriceCode"]');
    let previousSignature = '';
    for (let pass = 0; pass < 80; pass += 1) {
      const values = await hiddenCodes.evaluateAll((elements) => elements.map((element) => (
        (element as HTMLInputElement).value
      ))).catch(() => [] as string[]);
      const matchingIndex = values.indexOf(code);
      if (matchingIndex >= 0) {
        const row = hiddenCodes.nth(matchingIndex).locator('xpath=ancestor::tr[1]');
        const deleteControl = row.locator('input[id$="_chkDelete"]');
        if (!requireDeletable || await deleteControl.isEnabled()) return row;
      }

      const count = values.length;
      if (count === 0) break;
      const signature = values.join('|');
      if (signature === previousSignature) break;
      previousSignature = signature;
      await hiddenCodes.last().scrollIntoViewIfNeeded().catch(() => undefined);
      await this.page.waitForTimeout(400);
    }
    return undefined;
  }

  private async setZoomTo75AndScrollToEnd(): Promise<void> {
    await this.page.keyboard.press('Control+0').catch(() => undefined);
    await this.page.keyboard.press('Control+-').catch(() => undefined);
    await this.page.keyboard.press('Control+-').catch(() => undefined);
    await this.page.keyboard.press('Control+-').catch(() => undefined);
    const zoomState = await this.page.evaluate(() => ({
      visualScale: window.visualViewport?.scale ?? 1,
      devicePixelRatio: window.devicePixelRatio,
    }));
    if (zoomState.visualScale > 1.05) {
      throw new Error(`Unexpected browser zoom scale ${zoomState.visualScale}; browser zoom must not exceed 100%.`);
    }
    await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const rows = priceCodeLocators.priceCodeRows(this.page);
    if (await rows.count() > 0) await rows.last().scrollIntoViewIfNeeded().catch(() => undefined);
  }

  async expectInactivePriceCodeRow(code: string): Promise<void> {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      if (await this.findPriceCodeRowByScrolling(code)) return;
      await this.page.waitForTimeout(3_000);
      await this.goto();
      await this.expectLoaded();
      await this.openInactiveView();
      await this.expectInactiveLoaded();
    }
    throw new Error(`Archived Price Code ${code} was not found in the inactive grid.`);
  }

  async reactivatePriceCode(code: string): Promise<void> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    await this.goto();
    await this.expectLoaded();
    await this.openInactiveView();
    await this.expectInactiveLoaded();
    const row = await this.findPriceCodeRowByScrolling(code);
    if (!row) throw new Error(`Archived Price Code ${code} was not found for reactivation.`);

    const checkboxes = row.locator('input[type="checkbox"]');
    let reactivateControl: Locator | undefined;
    for (let index = 0; index < await checkboxes.count(); index += 1) {
      const checkbox = checkboxes.nth(index);
      const id = `${await checkbox.getAttribute('id') || ''} ${await checkbox.getAttribute('name') || ''}`;
      if (/react|activ|restore/i.test(id)) {
        reactivateControl = checkbox;
        break;
      }
    }
    if (!reactivateControl && await checkboxes.count() === 0) {
      const action = row.getByRole('button', { name: /reactivate|activate|restore/i }).first();
      if (await action.count() > 0) reactivateControl = action;
    }
    if (!reactivateControl) {
      throw new Error(`No reactivation control was found for inactive Price Code ${code}.`);
    }
    await expect(reactivateControl).toBeVisible();
    if ((await reactivateControl.getAttribute('type'))?.toLowerCase() === 'checkbox') {
      await reactivateControl.check();
    } else {
      await reactivateControl.click();
    }
    await priceCodeLocators.save(this.page).click();
    await this.page.waitForLoadState('domcontentloaded');

    await this.goto();
    await this.expectLoaded();
    if (!(await this.findPriceCodeRowByScrolling(code))) {
      throw new Error(`Reactivated Price Code ${code} was not found in the active grid.`);
    }
  }

  async searchByItem(item: string): Promise<void> {
    await priceCodeLocators.itemSearch(this.page).fill(item);
    await this.search();
  }

  async searchByItemAndCategory(item: string, categoryCode: string): Promise<void> {
    await this.selectCategory(categoryCode);
    await priceCodeLocators.itemSearch(this.page).fill(item);
    await this.search();
  }

  async searchByItemAndCategories(item: string, categoryCodes: string[]): Promise<string | undefined> {
    const [firstCategory, ...remainingCategories] = categoryCodes;
    const categories = [
      firstCategory,
      ...remainingCategories.filter((category) => category !== firstCategory),
    ].filter((category): category is string => Boolean(category));

    for (const category of categories) {
      await this.goto();
      await this.expectLoaded();
      await this.searchByItemAndCategory(item, category);
      await expect(this.page.getByText('Price List Maintenance', { exact: true })).toBeVisible();
      if (await this.page.getByText(item, { exact: true }).count() > 0) return category;
    }

    return undefined;
  }

  async expectItemSearchResults(item: string): Promise<void> {
    await expect(this.page.getByText('Price List Maintenance', { exact: true })).toBeVisible();
    await expect(this.page.getByText(item, { exact: true }).first()).toBeVisible();
  }

  async discoverRandomItemFromCategoryPriceCode(categoryCode: string): Promise<string> {
    await this.goto();
    await this.expectLoaded();
    await this.selectCategory(categoryCode);
    await this.search();
    await this.expectLoaded();

    const rows = priceCodeLocators.priceCodeRows(this.page);
    const matchingRows: number[] = [];
    for (let index = 0; index < await rows.count(); index += 1) {
      const row = rows.nth(index);
      const selectedCategory = (await row.locator('select[id$="_lstCatCode"] option:checked').textContent() || '').trim();
      const linkCount = await row.locator('a[href*="PriceList"]:visible').count();
      if (selectedCategory.toLowerCase() === categoryCode.toLowerCase() && linkCount > 0) matchingRows.push(index);
    }
    if (matchingRows.length === 0) {
      throw new Error(`No non-empty Price Code links were found for category ${categoryCode}.`);
    }

    const start = Math.floor(Math.random() * matchingRows.length);
    for (let offset = 0; offset < matchingRows.length; offset += 1) {
      const row = rows.nth(matchingRows[(start + offset) % matchingRows.length]!);
      const link = row.locator('a[href*="PriceList"]:visible').first();
      await link.scrollIntoViewIfNeeded();
      await link.click();
      await this.page.waitForLoadState('domcontentloaded');
      await expect(this.page).toHaveURL(/PriceList/i);

      const items = await this.page.locator('table tr, a:visible, td:visible').evaluateAll((elements) => {
        const values = elements.flatMap((element) => (element.textContent || '').trim().split(/\s+/));
        return [...new Set(values)].filter((value) => /^[A-Za-z0-9-]{6,}$/.test(value) && /[0-9]/.test(value));
      });
      await this.goto();
      await this.expectLoaded();
      if (items.length > 0) return items[Math.floor(Math.random() * items.length)]!;

      await this.selectCategory(categoryCode);
      await this.search();
      await this.expectLoaded();
    }

    throw new Error(`Price Code links for ${categoryCode} did not expose any item identifiers on the Price List page.`);
  }

  async exportToExcel(): Promise<void> {
    await priceCodeLocators.exportToExcel(this.page).click();
  }

  async expectActivePriceCodeRows(): Promise<void> {
    await expect(priceCodeLocators.priceCodeRows(this.page).first()).toBeVisible();
    await expect(priceCodeLocators.descriptionInputs(this.page).first()).toBeVisible();
    await expect(priceCodeLocators.categoryInputs(this.page).first()).toBeVisible();
    await expect(priceCodeLocators.currencyInputs(this.page).first()).toBeVisible();
    await expect(priceCodeLocators.vatInputs(this.page).first()).toBeVisible();
    await expect(priceCodeLocators.basePriceInputs(this.page).first()).toBeVisible();
  }

  async openInactiveView(): Promise<void> {
    await priceCodeLocators.viewInactive(this.page).click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    if (await priceCodeLocators.reasonCodesHeading(this.page).isVisible().catch(() => false)) {
      await priceCodeLocators.continueReasonCode(this.page).click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
    }
  }

  async expectInactiveLoaded(): Promise<void> {
    await expect(priceCodeLocators.inactiveHeading(this.page)).toBeVisible();
  }

  async openFirstFormulaAndReturn(): Promise<void> {
    const formula = priceCodeLocators.formulaLinks(this.page).first();
    await expect(formula).toBeVisible();
    await formula.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/Formula/i);
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  async openFirstPriceCodeAndReturn(): Promise<void> {
    const priceCode = priceCodeLocators.priceListLinks(this.page).first();
    await expect(priceCode).toBeVisible();
    await priceCode.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/PriceList/i);
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  /**
   * Price List cannot be opened by navigating directly to its URL - the app
   * requires reaching it via a Price Code link from Price Code Maintenance.
   * This navigates to Price Codes first, then clicks through to Price List
   * and stays there (no goBack).
   */
  async openPriceListViaPriceCode(): Promise<void> {
    await this.goto();
    await this.expectLoaded();
    const priceCode = priceCodeLocators.priceListLinks(this.page).first();
    await expect(priceCode).toBeVisible();
    await priceCode.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/PriceList/i);
  }

  /**
   * Opens the Price List for a specific Price Code (e.g. one just created by
   * createPriceCode) by locating its row's Price List link and clicking it,
   * rather than always following the first available link.
   */
  async openPriceListForCode(code: string): Promise<void> {
    await this.goto();
    await this.expectLoaded();
    const row = await this.findPriceCodeRowByScrolling(code, true);
    if (!row) throw new Error(`Price Code ${code} was not found to open its Price List.`);
    const priceListLink = row.locator('a[href*="PriceList"]:visible').first();
    await expect(priceListLink).toBeVisible();
    await priceListLink.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/PriceList/i);
  }

  async openFirstCustomerAndReturn(): Promise<void> {
    const customer = priceCodeLocators.customerLinks(this.page).first();
    await expect(customer).toBeVisible();
    await customer.click();
    await this.page.waitForLoadState('domcontentloaded');
    await expect(this.page).toHaveURL(/Customer/i);
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  async cancelUnsavedFirstDescriptionEdit(): Promise<void> {
    const description = priceCodeLocators.descriptionInputs(this.page).first();
    const original = await description.inputValue();
    await description.fill(`${original} - unsaved change`);
    await priceCodeLocators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.expectLoaded();
    await expect(priceCodeLocators.descriptionInputs(this.page).first()).toHaveValue(original);
  }

  async editDescriptionSaveAndRestore(data: PriceCodeMutationData): Promise<void> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    const targetCode = data.code.trim();
    if (!targetCode || targetCode.includes('*')) {
      throw new Error('An explicit approved, non-asterisk Price Code is required for mutation. No data was changed.');
    }
    const rows = priceCodeLocators.priceCodeRows(this.page);
    const count = await rows.count();
    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      const code = await row.locator('input[id$="_hdnPriceCode"]').inputValue();
      if (code !== targetCode) continue;

      const description = row.locator('input[id$="_txtDescrip"]');
      const original = await description.inputValue();
      await description.fill(data.description);
      await priceCodeLocators.save(this.page).click();
      await this.page.waitForLoadState('domcontentloaded');
      await expect(row.locator('input[id$="_txtDescrip"]')).toHaveValue(data.description);

      await row.locator('input[id$="_txtDescrip"]').fill(original);
      await priceCodeLocators.save(this.page).click();
      await this.page.waitForLoadState('domcontentloaded');
      await expect(row.locator('input[id$="_txtDescrip"]')).toHaveValue(original);
      return;
    }

    throw new Error(`Approved Price Code row not found for mutation data code ${targetCode}. No data was changed.`);
  }

  async expectGridCanScrollToLastRow(): Promise<void> {
    const rows = priceCodeLocators.priceCodeRows(this.page);
    await expect(rows.first()).toBeVisible();
    await rows.last().scrollIntoViewIfNeeded();
    await expect(rows.last()).toBeVisible();
  }

  async hasRowDisplayOrPaginationControls(): Promise<boolean> {
    const controls = [
      priceCodeLocators.showAllRows(this.page),
      priceCodeLocators.showAllRowsLink(this.page),
      priceCodeLocators.previousPage(this.page),
      priceCodeLocators.previousPageLink(this.page),
      priceCodeLocators.nextPage(this.page),
      priceCodeLocators.nextPageLink(this.page),
    ];
    return (await Promise.all(controls.map(async (control) => await control.count() > 0))).some(Boolean);
  }

  async expectRowDisplayAndPaginationControls(): Promise<void> {
    await expect(priceCodeLocators.priceCodeRows(this.page).first()).toBeVisible();

    const showAll = [priceCodeLocators.showAllRows(this.page), priceCodeLocators.showAllRowsLink(this.page)]
      .find((control) => control.count());
    if (showAll && await showAll.count() > 0) {
      await showAll.click();
      await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
      await expect(priceCodeLocators.priceCodeRows(this.page).first()).toBeVisible();
    }

    const next = [priceCodeLocators.nextPage(this.page), priceCodeLocators.nextPageLink(this.page)]
      .find((control) => control.count());
    const previous = [priceCodeLocators.previousPage(this.page), priceCodeLocators.previousPageLink(this.page)]
      .find((control) => control.count());
    if (next && await next.count() > 0 && await next.isEnabled().catch(() => false)) {
      await next.click();
      await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
      await expect(priceCodeLocators.priceCodeRows(this.page).first()).toBeVisible();
    }
    if (previous && await previous.count() > 0 && await previous.isEnabled().catch(() => false)) {
      await previous.click();
      await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
      await expect(priceCodeLocators.priceCodeRows(this.page).first()).toBeVisible();
    }
  }

  async hasExcelUploadControl(): Promise<boolean> {
    return await priceCodeLocators.excelFileInput(this.page).count() > 0 ||
      await priceCodeLocators.excelUploadControl(this.page).count() > 0;
  }

  async expectExcelUploadControl(): Promise<void> {
    const uploadFile = process.env.PRICE_CODE_TEST_UPLOAD_FILE?.trim();
    if (!uploadFile) {
      throw new Error('PRICE_CODE_TEST_UPLOAD_FILE must point to an approved Excel file when the upload control is available.');
    }

    const fileInput = priceCodeLocators.excelFileInput(this.page).first();
    if (await fileInput.count() > 0) {
      await fileInput.setInputFiles(uploadFile);
      await expect.poll(async () => await fileInput.evaluate((element) => (element as HTMLInputElement).files?.length || 0)).toBe(1);
      return;
    }

    const chooserPromise = this.page.waitForEvent('filechooser');
    await priceCodeLocators.excelUploadControl(this.page).click();
    const chooser = await chooserPromise;
    await chooser.setFiles(uploadFile);
  }

  async hasCustomerNavigation(): Promise<boolean> {
    return (await priceCodeLocators.customerLinks(this.page).count()) > 0;
  }

  async exportAndReturnDownload(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await this.exportToExcel();
    const download = await downloadPromise;
    return download.suggestedFilename();
  }

  async updateExistingPriceCode(data: PriceCodeExistingUpdateData): Promise<void> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    const basePrice = data.basePrice.trim().toLowerCase();
    if (basePrice !== 'true' && basePrice !== 'false') {
      throw new Error('PRICE_CODE_TEST_BASE_PRICE must be true or false because the verified grid control is a checkbox. No data was changed.');
    }

    const targetCode = data.code.trim();
    if (!targetCode || targetCode.includes('*')) {
      throw new Error('An explicit approved, non-asterisk Price Code is required for mutation. No data was changed.');
    }
    const row = await this.findPriceCodeRowByScrolling(targetCode);
    if (row) {

      const description = row.locator('input[id$="_txtDescrip"]');
      const category = row.locator('select[id$="_lstCatCode"]');
      const vat = row.locator('select[id$="_lstVAT"]');
      const basePriceInput = row.locator('input[id$="_chkBase"]');
      const original = {
        description: await description.inputValue(),
        category: await category.inputValue(),
        vat: await vat.inputValue(),
        basePrice: await basePriceInput.isChecked(),
      };
      let saveAttempted = false;

      try {
        await category.selectOption({ label: data.categoryCode });
        await vat.selectOption({ label: data.vatOption });

        await basePriceInput.check();
        saveAttempted = true;
        await this.saveAndWaitForReload();
        await this.expectSavedPriceCodeValues(data, true, targetCode);

        await basePriceInput.uncheck();
        await this.saveAndWaitForReload();
        await this.expectSavedPriceCodeValues(data, false, targetCode);
      } finally {
        if (saveAttempted) {
          await this.restorePriceCodeValues(targetCode, original);
        }
      }
      return;
    }

    throw new Error(`Approved Price Code row not found for mutation data code ${targetCode}. No data was changed.`);
  }

  private async expectSavedPriceCodeValues(
    data: PriceCodeExistingUpdateData,
    expectedBasePrice: boolean,
    code: string,
  ): Promise<void> {
    const row = priceCodeLocators.priceCodeRows(this.page).filter({
      has: this.page.locator(`input[id$="_hdnPriceCode"][value="${code}"]`),
    }).first();
    await expect(row).toBeVisible();
    await expect(row.locator('select[id$="_lstCatCode"] option:checked')).toHaveText(data.categoryCode);
    const selectedVat = (await row.locator('select[id$="_lstVAT"] option:checked').textContent() || '').trim();
    const vatMatches = selectedVat === data.vatOption ||
      (data.vatOption.toUpperCase() === 'NO TAX - 0.00' && selectedVat === '');
    expect(vatMatches).toBe(true);
    await expect.poll(
      async () => await row.locator('input[id$="_chkBase"]').isChecked(),
      { timeout: 15_000 },
    ).toBe(expectedBasePrice);
  }

  private async saveAndWaitForReload(): Promise<void> {
    const navigation = this.page.waitForNavigation({ waitUntil: 'domcontentloaded' }).catch(() => undefined);
    await priceCodeLocators.save(this.page).click();
    await navigation;
    await this.page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => undefined);
  }

  private async restorePriceCodeValues(
    code: string,
    original: { description: string; category: string; vat: string; basePrice: boolean },
  ): Promise<void> {
    await this.goto();
    await this.expectLoaded();
    const row = await this.findPriceCodeRowByScrolling(code);
    if (row) {

      await row.locator('input[id$="_txtDescrip"]').fill(original.description);
      await row.locator('select[id$="_lstCatCode"]').selectOption({ value: original.category });
      await row.locator('select[id$="_lstVAT"]').selectOption({ value: original.vat });
      const basePrice = row.locator('input[id$="_chkBase"]');
      if (original.basePrice) await basePrice.check();
      else await basePrice.uncheck();
      await priceCodeLocators.save(this.page).click();
      await this.page.waitForLoadState('domcontentloaded');
      return;
    }

    throw new Error(`Price Code ${code} disappeared before restoration; manual verification is required.`);
  }

  async expectDuplicatePriceCodeRejected(
    data: PriceCodeMutationData,
    duplicateCode: string,
    _expectedOutcome: 'reject' | 'warning',
    evidencePath?: string,
  ): Promise<boolean> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    const targetDuplicateCode = duplicateCode.trim();
    if (!targetDuplicateCode || targetDuplicateCode.includes('*')) {
      throw new Error('An explicit approved, non-asterisk duplicate Price Code is required. No data was changed.');
    }
    await this.goto();
    await this.expectLoaded();
    const existingCount = await this.activePriceCodeCount(targetDuplicateCode);
    if (existingCount !== 1) {
      throw new Error(`Approved duplicate Price Code ${targetDuplicateCode} must exist exactly once before the duplicate check; found ${existingCount}.`);
    }
    for (let attempt = 0; attempt < 1; attempt += 1) {
      const popup = await this.openAddNew();
      try {
        const textInputs = popup.locator('input[type="text"]:visible, textarea:visible');
        await textInputs.nth(0).fill(targetDuplicateCode);
        await textInputs.nth(1).fill(`${data.description} DUPLICATE CHECK`);
        await popup.getByRole('combobox').nth(0).selectOption({ label: data.categoryCode });
        await popup.getByRole('combobox').nth(1).selectOption({ label: data.vatOption });
        await priceCodeLocators.addNewEnvironmentCheckbox(popup, data.environment).check();
        await popup.getByRole('radio', { name: data.currency, exact: true }).last().check();
        await popup.getByRole('button', { name: /Submit and Close/i }).click();

        const message = /already|duplicate|exists|warning|error|invalid/i;
        const duplicateMessage = popup.getByText(message).first();
        const pageMessage = this.page.getByText(message).first();
        let duplicateDetected = false;
        for (let check = 0; check < 6 && !duplicateDetected; check += 1) {
          duplicateDetected = popup.isClosed()
            ? await pageMessage.count() > 0 && await pageMessage.isVisible()
            : await duplicateMessage.count() > 0 && await duplicateMessage.isVisible();
          if (!duplicateDetected) await this.page.waitForTimeout(500);
        }
        if (duplicateDetected) {
          if (evidencePath) {
            if (!popup.isClosed()) await popup.screenshot({ path: evidencePath });
            else await this.page.screenshot({ path: evidencePath });
          }
          if (!popup.isClosed()) {
            const closePromise = popup.waitForEvent('close').catch(() => undefined);
            const cancel = popup.getByRole('button', { name: /^Cancel$/i });
            if (await cancel.count() > 0) await cancel.click();
            else await popup.close();
            await closePromise;
          }
          return true;
        }

        if (popup.isClosed()) {
          await this.goto();
          await this.expectLoaded();
          const count = await this.activePriceCodeCount(targetDuplicateCode);
          if (count > 1) {
            throw new Error(`Duplicate submission created multiple active rows for ${targetDuplicateCode}; cleanup was not attempted to protect the existing record.`);
          }
          if (count === existingCount) return true;
        }
      } finally {
        if (!popup.isClosed()) {
          const cancel = popup.getByRole('button', { name: /^Cancel$/i });
          if (await cancel.count() > 0) await cancel.click().catch(() => undefined);
          if (!popup.isClosed()) await popup.close();
        }
      }
    }

    throw new Error('No duplicate warning/rejection was detected for the approved duplicate Price Code.');
  }

  async updateEffectiveDateAndRestore(code: string, futureDate: string): Promise<void> {
    if (!runtimeConfig.mutationEnabled) {
      throw new Error('Price Code mutations are disabled. Set PRICE_CODE_MUTATION_ENABLED=true only for approved test data.');
    }

    const dateInput = this.page.locator(
      'input[type="date"]:visible, input[id*="Effective"]:visible, input[name*="Effective"]:visible',
    ).first();
    if (await dateInput.count() === 0) {
      throw new Error('No visible effective-date control is exposed by the current Price Code page. No data was changed.');
    }

    const original = await dateInput.inputValue();
    let saveAttempted = false;
    try {
      await dateInput.fill(futureDate);
      saveAttempted = true;
      await priceCodeLocators.save(this.page).click();
      await this.page.waitForLoadState('domcontentloaded');
      await expect(this.page.locator(
        'input[type="date"]:visible, input[id*="Effective"]:visible, input[name*="Effective"]:visible',
      ).first()).toHaveValue(futureDate);
    } finally {
      if (saveAttempted) {
        await this.goto();
        await this.expectLoaded();
        const restoredDate = this.page.locator(
          'input[type="date"]:visible, input[id*="Effective"]:visible, input[name*="Effective"]:visible',
        ).first();
        await restoredDate.fill(original);
        await priceCodeLocators.save(this.page).click();
        await this.page.waitForLoadState('domcontentloaded');
      }
    }
  }

  private async activePriceCodeCount(code: string): Promise<number> {
    const rows = priceCodeLocators.priceCodeRows(this.page);
    let count = 0;
    for (let index = 0; index < await rows.count(); index += 1) {
      if (await rows.nth(index).locator('input[id$="_hdnPriceCode"]').inputValue() === code) count += 1;
    }
    return count;
  }

  private async archivePotentialInvalidRecord(data: PriceCodeInvalidData): Promise<void> {
    await this.goto();
    await this.expectLoaded();
    const rows = priceCodeLocators.priceCodeRows(this.page);
    const candidates = new Set([data.code, data.code.slice(0, 6)]);
    let found = false;
    const count = await rows.count();
    for (let index = 0; index < count; index += 1) {
      const row = rows.nth(index);
      const code = await row.locator('input[id$="_hdnPriceCode"]').inputValue();
      const description = await row.locator('input[id$="_txtDescrip"]').inputValue();
      if (!candidates.has(code) && (!data.description || description !== data.description)) continue;
      await row.locator('input[id$="_chkDelete"]').check();
      found = true;
    }
    if (found) {
      const popupPromise = this.page.waitForEvent('popup', { timeout: 5_000 }).catch(() => undefined);
      await priceCodeLocators.save(this.page).click();
      const reasonPage = await popupPromise;
      const targetPage = reasonPage || this.page;
      await targetPage.waitForLoadState('domcontentloaded').catch(() => undefined);
      await expect(priceCodeLocators.reasonCodesHeading(targetPage)).toBeVisible();
      await priceCodeLocators.continueReasonCode(targetPage).click();
      await targetPage.waitForLoadState('domcontentloaded').catch(() => undefined);
      if (targetPage !== this.page && !targetPage.isClosed()) await targetPage.close();
      await this.goto();
      await this.expectLoaded();
    }
  }
}