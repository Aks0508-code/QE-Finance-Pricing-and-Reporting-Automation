import { expect, type Page } from '@playwright/test';
import { getExpiredSpecialsData } from '../../config/expired-specials-data';
import { runtimeConfig } from '../../config/runtime-config';
import { expiredSpecialsLocators as locators } from '../../locators/expired-specials.locators';

export class ExpiredSpecialsPage {
  constructor(private readonly page: Page) {}

  get currentPage(): Page { return this.page; }

  async gotoDiscounts(): Promise<void> { await this.gotoRoute(runtimeConfig.expiredSpecialDiscountRemovalPath); }
  async gotoDeferList(): Promise<void> { await this.gotoRoute(runtimeConfig.expiredSpecialsDeferListPath); }
  async gotoDeferListNew(): Promise<void> {
    await this.gotoRoute(runtimeConfig.expiredSpecialsDeferListNewPath, {
      hlcp: '1', hmt: '1', hm: '1', envSelected: getExpiredSpecialsData().environment,
    });
  }

  async expectDiscountsLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/ExpiredSpecialDiscountRemoval\.aspx/i);
    await expect(locators.discountHeading(this.page)).toBeVisible();
    this.assertStageHost();
  }

  async expectDiscountCoreControls(): Promise<void> {
    await this.expectDiscountsLoaded();
    await expect(locators.customerSearch(this.page)).toBeVisible();
    await expect(locators.mustShipBySearch(this.page)).toBeVisible();
    await expect(locators.approvedEndSearch(this.page)).toBeVisible();
    await expect(locators.discountSearch(this.page)).toBeVisible();
  }

  async expectDiscountActions(): Promise<void> {
    await expect(locators.update(this.page)).toBeVisible();
    await expect(locators.execute(this.page)).toBeVisible();
    await expect(locators.cancel(this.page)).toBeVisible();
  }

  async hasDiscountRows(): Promise<boolean> { return await locators.discountRows(this.page).count() > 0; }

  async hasApprovedDiscountRow(): Promise<boolean> {
    const order = getExpiredSpecialsData().testOrder;
    return Boolean(order) && await locators.discountRows(this.page).filter({ hasText: order }).count() > 0;
  }

  async expectDiscountGrid(): Promise<void> {
    const grid = locators.discountGrid(this.page);
    for (const header of ['Customer', 'Ship To', 'Specials', 'Order#', 'Must Ship By', 'Approved End Date']) {
      await expect(grid.getByText(header, { exact: true }).first()).toBeVisible();
    }
    await expect(locators.discountRows(this.page).first()).toBeVisible();
  }

  async searchDiscounts(): Promise<void> {
    await locators.discountSearch(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectDiscountsLoaded();
  }

  async cancelSelectedDiscounts(): Promise<void> {
    const checkbox = locators.discountSelection(this.page).first();
    await checkbox.check();
    await locators.cancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await expect(checkbox).not.toBeChecked();
  }

  async updateApprovedDiscount(): Promise<void> {
    const row = this.approvedDiscountRow();
    await row.locator('input[type="checkbox"]:visible').first().check();
    await locators.update(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectDiscountsLoaded();
  }

  async executeApprovedDiscount(): Promise<void> {
    const row = this.approvedDiscountRow();
    await row.locator('input[type="checkbox"]:visible').first().check();
    await locators.execute(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectDiscountsLoaded();
  }

  async expectDeferLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/\/ExpiredSpecialsDeferList\.aspx/i);
    await expect(locators.deferHeading(this.page)).toBeVisible();
    this.assertStageHost();
  }

  async expectDeferCoreControls(): Promise<void> {
    await this.expectDeferLoaded();
    await expect(locators.environment(this.page)).toBeVisible();
    await expect(locators.customerSearch(this.page)).toBeVisible();
    await expect(locators.mustShipBySearch(this.page)).toBeVisible();
    await expect(locators.approvedEndSearch(this.page)).toBeVisible();
    await expect(locators.deferSearch(this.page)).toBeVisible();
    await expect(locators.deferAddNew(this.page)).toBeVisible();
    await expect(locators.deferUpdate(this.page)).toBeVisible();
    await expect(locators.deferCancel(this.page)).toBeVisible();
  }

  async hasDeferRows(): Promise<boolean> { return await locators.deferRows(this.page).count() > 0; }

  async expectDeferGrid(): Promise<void> {
    const grid = locators.deferGrid(this.page);
    for (const header of ['Customer', 'All Shipto', 'Ship To', 'Specials', 'All Orders', 'Order#', 'Must Ship By', 'Approved End Date']) {
      await expect(grid.getByText(header, { exact: true }).first()).toBeVisible();
    }
    await expect(locators.deferRows(this.page).first()).toBeVisible();
  }

  async cancelFirstDeferEdit(): Promise<void> {
    const input = locators.deferEditableInputs(this.page).first();
    const original = await input.inputValue();
    await input.fill(`${original} AUTOMATION_ONLY`);
    await locators.deferCancel(this.page).click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => undefined);
    await this.expectDeferLoaded();
    await expect(locators.deferEditableInputs(this.page).first()).toHaveValue(original);
  }

  async openDeferListNew(): Promise<Page> {
    const popupPromise = this.page.context().waitForEvent('page', { timeout: 5_000 }).catch(() => undefined);
    await locators.deferAddNew(this.page).click();
    const popup = await popupPromise;
    const target = popup || await this.page.context().newPage();
    if (!popup) await this.gotoNewOn(target);
    await this.reenterStageIfRedirected(target);
    return target;
  }

  async expectNewLoaded(target: Page = this.page): Promise<void> {
    await expect(target).toHaveURL(/\/ExpiredSpecialsDeferListNew\.aspx/i);
    await expect(locators.newHeading(target)).toBeVisible();
    await this.expectNewFields(target);
  }

  async expectNewFields(target: Page = this.page): Promise<void> {
    for (const control of [locators.newCustomer(target), locators.newShipTo(target), locators.newSpecial(target), locators.newOrder(target), locators.newApprovedEnd(target)]) {
      await expect(control).toBeVisible();
    }
  }

  async expectNewActions(target: Page = this.page): Promise<void> {
    await expect(locators.newSaveAdd(target)).toBeVisible();
    await expect(locators.newSaveClose(target)).toBeVisible();
    await expect(locators.newCancel(target)).toBeVisible();
  }

  async cancelNew(target: Page = this.page): Promise<void> {
    await locators.newCancel(target).click();
    await target.waitForLoadState('domcontentloaded').catch(() => undefined);
    if (target !== this.page && !target.isClosed()) await target.close();
  }

  private async gotoRoute(path: string, query?: Record<string, string>): Promise<void> {
    const url = this.makeURL(path, query);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.reenterStageIfRedirected(this.page, url);
    await this.page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
  }

  private async gotoNewOn(target: Page): Promise<void> {
    const url = this.makeURL(runtimeConfig.expiredSpecialsDeferListNewPath, {
      hlcp: '1', hmt: '1', hm: '1', envSelected: getExpiredSpecialsData().environment,
    });
    await target.goto(url, { waitUntil: 'domcontentloaded' });
  }

  private makeURL(path: string, query?: Record<string, string>): string {
    const url = new URL(path, runtimeConfig.orderEntrySpecialsBaseURL);
    for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, value);
    return url.toString();
  }

  private async reenterStageIfRedirected(target: Page, expectedURL?: string): Promise<void> {
    if (new URL(target.url()).hostname.toLowerCase() !== 'stage.ashleynet.com') {
      if (!expectedURL) throw new Error('Expired Specials left the Stage host without a known recovery URL.');
      await target.goto(expectedURL, { waitUntil: 'domcontentloaded' });
    }
    if (new URL(target.url()).hostname.toLowerCase() !== 'stage.ashleynet.com') {
      throw new Error(`Expired Specials continued on non-Stage host ${new URL(target.url()).hostname}.`);
    }
  }

  private assertStageHost(): void {
    const hostname = new URL(this.page.url()).hostname.toLowerCase();
    if (hostname !== 'stage.ashleynet.com') throw new Error(`Expired Specials requires Stage, but the current host is ${hostname}.`);
  }

  private approvedDiscountRow() {
    const order = getExpiredSpecialsData().testOrder;
    return locators.discountRows(this.page).filter({ hasText: order }).first();
  }
}