import { test as pricingTest, expect } from './pricing.fixture';
import { ExpiredSpecialsPage } from '../pages/expired-specials/expired-specials.page';

type ExpiredSpecialsFixtures = {
  expiredSpecials: ExpiredSpecialsPage;
};

export const test = pricingTest.extend<ExpiredSpecialsFixtures>({
  expiredSpecials: async ({ sharedPage, shell }, use) => {
    const expiredSpecials = new ExpiredSpecialsPage(sharedPage);
    await expiredSpecials.gotoDiscounts();
    await shell.loginIfRequired();
    await expiredSpecials.gotoDiscounts();
    await use(expiredSpecials);
  },
});

export { expect };