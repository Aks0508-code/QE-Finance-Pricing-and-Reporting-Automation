import { test as pricingTest, expect } from './pricing.fixture';
import { SurchargePage } from '../pages/surcharge/surcharge.page';

type SurchargeFixtures = { surcharge: SurchargePage };

export const test = pricingTest.extend<SurchargeFixtures>({
  surcharge: async ({ sharedPage, shell }, use) => {
    const surcharge = new SurchargePage(sharedPage);
    await surcharge.gotoHeader();
    await shell.loginIfRequired();
    await surcharge.gotoHeader();
    await use(surcharge);
  },
});

export { expect };