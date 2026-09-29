import { expect, type Page } from '@playwright/test';
import { getOrderEntrySpecialsData } from '../../config/order-entry-specials-data';
import { runtimeConfig } from '../../config/runtime-config';
import { orderEntrySpecialsLocators as locators } from '../../locators/order-entry-specials.locators';

export class OrderEntrySpecialsPage {
  constructor(private readonly page: Page) {}

  get currentPage(): Page { return this.page; }

  async goto(): Promise<void> {
    await this.gotoRoute(runtimeConfig.orderEntrySpecialsPath);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/OrderEntrySpecials\/Specials\.aspx/i);
    await expect(locators.mainHeading(this.page)).toBeVisible();
    this.assertStageHost();
  }

  async expectCoreControls(): Promise<void> {
    await this.expectLoaded();
    await expect(locators.environment(this.page)).toBeVisible();
    await expect(locators.exportToExcel(this.page)).toBeVisible();
    await expect(locators.addNew(this.page)).toBeVisible();
    await expect(locators.save(this.page)).toBeVisible();
    await expect(locators.cancel(this.page)).toBeVisible();
  }

  async hasMainRows(): Promise<boolean> {
    return await locators.specialsRows(this.page).count() > 0;
  }

  async expectMainGrid(): Promise<void> {
    const grid = locators.specialsGrid(this.page);
    for (const header of ['Code', 'Description', 'Special Type', 'Currency', 'Start Date', 'End Date']) {
      await expect(grid.getByText(header, { exact: true }).first()).toBeVisible();
    }
    await expect(locators.specialsRows(this.page).first()).toBeVisible();
  }

  async expectEnvironmentOptions(): Promise<void> {
    await expect(locators.environment(this.page).locator('option')).not.toHaveCount(0);
  }

  async selectAlternateEnvironmentIfAvailable(): Promise<boolean> {
    const environment = locators.environment(this.page);
    if (await environment.locator('option').count() < 2) return false;
    await environment.selectOption({ index: 1 });
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expect(locators.environment(this.page).locator('option:checked')).toHaveCount(1);
    return true;
  }

  async cancelFirstUnsavedMainEdit(): Promise<void> {
    const input = locators.mainEditableInputs(this.page).first();
    const original = await input.inputValue();
    await input.fill(`${original} AUTOMATION_ONLY`);
    await locators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectLoaded();
    await expect(locators.mainEditableInputs(this.page).first()).toHaveValue(original);
  }

  async exportAndReturnFilename(): Promise<string> {
    const downloadPromise = this.page.waitForEvent('download');
    await locators.exportToExcel(this.page).click();
    return (await downloadPromise).suggestedFilename();
  }

  async openAddEdit(): Promise<Page> {
    return await this.openChild(locators.addNew(this.page), runtimeConfig.specialsAddEditPath, {
      env: getOrderEntrySpecialsData().environment,
    });
  }

  async openExcludedItems(): Promise<Page> {
    return await this.openChild(locators.excludedItems(this.page), runtimeConfig.excludedItemsPath, {
      hm: '1',
      hlcp: '1',
      env: getOrderEntrySpecialsData().environment,
    });
  }

  async openDetail(): Promise<Page> {
    const detailLink = locators.detailLinks(this.page).first();
    if (await detailLink.count() > 0) {
      return await this.openChild(detailLink, runtimeConfig.specialsDetailPath, {
        hm: '1',
        hlcp: '1',
        env: getOrderEntrySpecialsData().environment,
        code: getOrderEntrySpecialsData().specialCode,
      });
    }
    return await this.openRouteInNewPage(runtimeConfig.specialsDetailPath, {
      hm: '1',
      hlcp: '1',
      env: getOrderEntrySpecialsData().environment,
      code: getOrderEntrySpecialsData().specialCode,
    });
  }

  async openItemEdit(): Promise<Page> {
    return await this.openRouteInNewPage(runtimeConfig.specialsItemAddEditPath, {
      hm: '1',
      hlcp: '1',
      env: getOrderEntrySpecialsData().environment,
      code: getOrderEntrySpecialsData().specialCode,
    });
  }

  async openDeferListNew(): Promise<Page> {
    return await this.openRouteInNewPage(runtimeConfig.expiredSpecialsDeferListNewPath, { hlcp: '1', hmt: '1', hm: '1', envSelected: getOrderEntrySpecialsData().environment });
  }

  async openExcludedItemNew(): Promise<Page> {
    return await this.openRouteInNewPage(runtimeConfig.excludedItemAddNewPath, { env: getOrderEntrySpecialsData().environment });
  }

  async gotoAddEdit(): Promise<void> { await this.gotoRoute(runtimeConfig.specialsAddEditPath, { env: getOrderEntrySpecialsData().environment }); }
  async gotoDetail(): Promise<void> { await this.gotoRoute(runtimeConfig.specialsDetailPath, { hm: '1', hlcp: '1', env: getOrderEntrySpecialsData().environment, code: getOrderEntrySpecialsData().specialCode }); }
  async gotoItemEdit(): Promise<void> { await this.gotoRoute(runtimeConfig.specialsItemAddEditPath, { hm: '1', hlcp: '1', env: getOrderEntrySpecialsData().environment, code: getOrderEntrySpecialsData().specialCode }); }
  async gotoExpiredRemoval(): Promise<void> { await this.gotoRoute(runtimeConfig.expiredSpecialDiscountRemovalPath); }
  async gotoDeferList(): Promise<void> { await this.gotoRoute(runtimeConfig.expiredSpecialsDeferListPath); }
  async gotoDeferListNew(): Promise<void> { await this.gotoRoute(runtimeConfig.expiredSpecialsDeferListNewPath, { hlcp: '1', hmt: '1', hm: '1', envSelected: getOrderEntrySpecialsData().environment }); }
  async gotoExcludedItems(): Promise<void> { await this.gotoRoute(runtimeConfig.excludedItemsPath, { hm: '1', hlcp: '1', env: getOrderEntrySpecialsData().environment }); }
  async gotoExcludedItemNew(): Promise<void> { await this.gotoRoute(runtimeConfig.excludedItemAddNewPath, { env: getOrderEntrySpecialsData().environment }); }

  async expectAddEditForm(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/OrderEntrySpecials\/SpecialsAddEdit\.aspx/i);
    await expect(locators.formHeading(target)).toBeVisible();
    await expect(locators.visibleInputs(target).first()).toBeVisible();
    await expect(locators.cancel(target)).toBeVisible();
  }

  async expectDetailForm(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/OrderEntrySpecials\/SpecialsDetail\.aspx/i);
    await expect(locators.formHeading(target)).toBeVisible();
    await expect(locators.visibleInputs(target).first()).toBeVisible();
  }

  async expectItemForm(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/OrderEntrySpecials\/SpecialsItemAddEdit\.aspx/i);
    await expect(locators.formHeading(target)).toBeVisible();
    await expect(locators.visibleInputs(target).first()).toBeVisible();
  }

  async expectExpiredRemovalLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/ExpiredSpecialDiscountRemoval\.aspx/i);
    await expect(locators.expiredRemovalHeading(this.page)).toBeVisible();
  }

  async expectDeferListLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/ExpiredSpecialsDeferList\.aspx/i);
    await expect(locators.deferHeading(this.page)).toBeVisible();
  }

  async expectDeferListCoreControls(): Promise<void> {
    await this.expectDeferListLoaded();
    await expect(locators.deferEnvironment(this.page)).toBeVisible();
    await expect(locators.deferSearch(this.page)).toBeVisible();
    await expect(locators.deferAddNew(this.page)).toBeVisible();
    await expect(locators.deferUpdate(this.page)).toBeVisible();
    await expect(locators.deferCancel(this.page)).toBeVisible();
  }

  async expectDeferRows(): Promise<void> {
    const grid = locators.deferGrid(this.page);
    for (const header of ['Customer', 'Ship To', 'Specials', 'All Orders', 'Approved End Date']) {
      await expect(grid.getByText(header, { exact: true }).first()).toBeVisible();
    }
    await expect(locators.deferRows(this.page).first()).toBeVisible();
  }

  async expectDeferNewForm(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/ExpiredSpecialsDeferListNew\.aspx/i);
    await expect(target.getByText('Add New', { exact: true }).first()).toBeVisible();
    for (const control of [locators.deferNewCustomer(target), locators.deferNewShipTo(target), locators.deferNewSpecial(target), locators.deferNewOrder(target), locators.deferNewApprovedEnd(target)]) {
      await expect(control).toBeVisible();
    }
    await expect(locators.deferNewSaveAdd(target)).toBeVisible();
    await expect(locators.deferNewSaveClose(target)).toBeVisible();
    await expect(locators.deferNewCancel(target)).toBeVisible();
  }

  async expectExcludedLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/OrderEntrySpecials\/ExcludedItems\.aspx/i);
    await expect(locators.excludedHeading(target)).toBeVisible();
  }

  async expectExcludedCoreControls(): Promise<void> {
    await this.expectExcludedLoaded();
    await expect(locators.excludedImport(this.page)).toBeVisible();
    await expect(locators.excludedExport(this.page)).toBeVisible();
    await expect(locators.excludedAddNew(this.page)).toBeVisible();
    await expect(locators.excludedSave(this.page)).toBeVisible();
    await expect(locators.excludedCancel(this.page)).toBeVisible();
  }

  async expectExcludedRows(): Promise<void> {
    const grid = locators.excludedGrid(this.page);
    for (const header of ['Item Number', 'Is Series?', 'Last User', 'Delete?']) {
      await expect(grid.getByText(header, { exact: true }).first()).toBeVisible();
    }
    await expect(locators.excludedRows(this.page).first()).toBeVisible();
  }

  async expectExcludedNewForm(): Promise<void> {
    await expect(this.page).toHaveURL(/\/OrderEntrySpecials\/ExcludedItemAddNew\.aspx/i);
    await expect(locators.excludedNewItem(this.page)).toBeVisible();
    await expect(locators.excludedNewSeries(this.page)).toBeVisible();
    await expect(locators.excludedNewSave(this.page)).toBeVisible();
    await expect(locators.excludedNewCancel(this.page)).toBeVisible();
  }

  async cancelTarget(target: Page): Promise<void> {
    await locators.cancel(target).click().catch(async () => {
      await locators.excludedNewCancel(target).click();
    });
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (target !== this.page && !target.isClosed()) await target.close();
  }

  async hasRows(locator: (page: Page) => ReturnType<typeof locators.specialsRows>): Promise<boolean> {
    return await locator(this.page).count() > 0;
  }

  private async gotoRoute(path: string, query?: Record<string, string>): Promise<void> {
    const url = this.makeURL(path, query);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.reenterStageIfRedirected(url, this.page);
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  private async openChild(trigger: ReturnType<typeof locators.addNew>, fallbackPath: string, query: Record<string, string>): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 5_000 }).catch(() => undefined);
    await trigger.click();
    const popup = await popupPromise;
    const target = popup || this.page;
    if (target === this.page && !new URL(target.url()).pathname.includes(fallbackPath.split('/').pop() || '')) {
      await target.goto(this.makeURL(fallbackPath, query), { waitUntil: 'domcontentloaded' });
    }
    await this.reenterStageIfRedirected(this.makeURL(fallbackPath, query), target);
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    return target;
  }

  private async openRouteInNewPage(path: string, query: Record<string, string>): Promise<Page> {
    const target = await this.page.context().newPage();
    const url = this.makeURL(path, query);
    await target.goto(url, { waitUntil: 'domcontentloaded' });
    await this.reenterStageIfRedirected(url, target);
    await target.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    return target;
  }

  private makeURL(path: string, query?: Record<string, string>): string {
    const url = new URL(path, runtimeConfig.orderEntrySpecialsBaseURL);
    for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, value);
    return url.toString();
  }

  private assertStageHost(): void {
    const hostname = new URL(this.page.url()).hostname.toLowerCase();
    if (hostname !== 'stage.ashleynet.com') throw new Error(`Order Entry Specials requires Stage, but the current host is ${hostname}.`);
  }

  private async reenterStageIfRedirected(url: string, target: Page): Promise<void> {
    const hostname = new URL(target.url()).hostname.toLowerCase();
    if (hostname === 'stage.ashleynet.com') return;
    await target.goto(url, { waitUntil: 'domcontentloaded' });
    const finalHostname = new URL(target.url()).hostname.toLowerCase();
    if (finalHostname !== 'stage.ashleynet.com') {
      throw new Error(`AshleyNET redirected away from Stage (${finalHostname}). Re-entering Stage did not recover the page.`);
    }
  }
}