import { test as pricingTest, expect } from './pricing.fixture';
import { PriceExceptionsPage } from '../pages/price-exceptions/price-exceptions.page';

type PriceExceptionsFixtures = {
  priceExceptions: PriceExceptionsPage;
};

export const test = pricingTest.extend<PriceExceptionsFixtures>({
  priceExceptions: async ({ sharedPage, shell }, use) => {
    const priceExceptions = new PriceExceptionsPage(sharedPage);
    await priceExceptions.gotoActive();
    await shell.loginIfRequired();
    await priceExceptions.gotoActive();
    await use(priceExceptions);
  },
});

export { expect };