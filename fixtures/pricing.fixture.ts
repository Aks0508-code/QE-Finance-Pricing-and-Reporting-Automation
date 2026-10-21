import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import { AshleyNetShellPage } from '../pages/pricing/common/ashley-net-shell.page';
import { PriceCodeMaintenancePage } from '../pages/pricing/price-codes/price-code-maintenance.page';
import { PriceListMaintenancePage } from '../pages/pricing/price-lists/price-list-maintenance.page';
import { PriceListUpdateQueuePage } from '../pages/pricing/price-lists/price-list-update-queue.page';
import { BuyerGroupMaintenancePage } from '../pages/pricing/price-lists/buyer-group-maintenance.page';
import { BuyerGroupPricingPage } from '../pages/pricing/price-lists/buyer-group-pricing.page';
import { RateValidationLimitsPage } from '../pages/pricing/rate-validation/rate-validation-limits.page';

type PricingFixtures = {
  shell: AshleyNetShellPage;
  priceCodes: PriceCodeMaintenancePage;
  priceList: PriceListMaintenancePage;
  updateQueue: PriceListUpdateQueuePage;
  buyerGroups: BuyerGroupMaintenancePage;
  buyerGroupPricing: BuyerGroupPricingPage;
  rateValidationLimits: RateValidationLimitsPage;
};

type PricingWorkerFixtures = {
  sharedContext: BrowserContext;
  sharedPage: Page;
};

export const test = base.extend<PricingFixtures, PricingWorkerFixtures>({
  sharedContext: [async ({ browser }, use, workerInfo) => {
    // Reuse the same authenticated storage state as the rest of the suite
    // (see playwright.config.ts) so this worker's grid data matches what
    // an authenticated session sees, instead of an anonymous/blank context.
    const storageStatePath = resolve(__dirname, '..', 'auth', 'stage-storage-state.json');
    const storageState = existsSync(storageStatePath) ? storageStatePath : undefined;
    const context = await browser.newContext({
      recordVideo: { dir: `${workerInfo.project.outputDir}/videos` },
      ...(storageState ? { storageState } : {}),
    });
    await use(context);
    await context.close();
  }, { scope: 'worker' }],
  sharedPage: [async ({ sharedContext }, use) => {
    const page = await sharedContext.newPage();
    await use(page);
  }, { scope: 'worker' }],
  shell: async ({ sharedPage }, use) => {
    await use(new AshleyNetShellPage(sharedPage));
  },
  priceCodes: async ({ sharedPage, shell }, use) => {
    const priceCodes = new PriceCodeMaintenancePage(sharedPage);
    await priceCodes.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await priceCodes.goto();
    await use(priceCodes);
  },
  priceList: async ({ sharedPage, shell }, use) => {
    // Price List cannot be opened by navigating directly to PriceList.aspx;
    // the app requires reaching it via a Price Code link from Price Code
    // Maintenance. Go there first, log in if needed, then click through.
    const priceCodes = new PriceCodeMaintenancePage(sharedPage);
    await priceCodes.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await priceCodes.goto();
    // Open the Price List for the explicitly configured Price Code (falls
    // back to the first available link if not configured), so item-search
    // and other data-dependent assertions target the intended code.
    const configuredCode = process.env.PRICE_CODE_TEST_CODE?.trim();
    if (configuredCode && !configuredCode.includes('*')) {
      // The configured code may not have an associated Price List (e.g. a
      // replacement test code picked purely for being unlocked/active). Fall
      // back to the first available Price List link rather than failing the
      // fixture (and every test that depends on it) outright.
      await priceCodes.openPriceListForCode(configuredCode).catch(async () => {
        await priceCodes.goto();
        await priceCodes.expectLoaded();
        await priceCodes.openPriceListViaPriceCode();
      });
    } else {
      await priceCodes.openPriceListViaPriceCode();
    }
    const priceList = new PriceListMaintenancePage(sharedPage);
    await use(priceList);
  },
  updateQueue: async ({ sharedPage }, use) => {
    await use(new PriceListUpdateQueuePage(sharedPage));
  },
  buyerGroups: async ({ sharedPage, shell }, use) => {
    const buyerGroups = new BuyerGroupMaintenancePage(sharedPage);
    await buyerGroups.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroups.goto();
    await use(buyerGroups);
  },
  buyerGroupPricing: async ({ sharedPage, shell }, use) => {
    const buyerGroupPricing = new BuyerGroupPricingPage(sharedPage);
    await buyerGroupPricing.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await buyerGroupPricing.goto();
    await use(buyerGroupPricing);
  },
  rateValidationLimits: async ({ sharedPage, shell }, use) => {
    const rateValidationLimits = new RateValidationLimitsPage(sharedPage);
    await rateValidationLimits.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await rateValidationLimits.goto();
    await use(rateValidationLimits);
  },
});

export { expect };