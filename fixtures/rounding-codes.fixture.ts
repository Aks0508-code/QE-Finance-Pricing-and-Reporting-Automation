import { test as pricingTest, expect } from './pricing.fixture';
import { RoundingCodesPage } from '../pages/rounding-codes/rounding-codes.page';

type RoundingCodesFixtures = { roundingCodes: RoundingCodesPage };

export const test = pricingTest.extend<RoundingCodesFixtures>({
  roundingCodes: async ({ sharedPage, shell }, use) => {
    const roundingCodes = new RoundingCodesPage(sharedPage);
    await roundingCodes.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await roundingCodes.goto();
    await use(roundingCodes);
  },
});

export { expect };