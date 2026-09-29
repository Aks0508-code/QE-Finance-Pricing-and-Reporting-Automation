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
    const context = await browser.newContext({
      recordVideo: { dir: `${workerInfo.project.outputDir}/videos` },
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
    await priceCodes.openPriceListViaPriceCode();
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