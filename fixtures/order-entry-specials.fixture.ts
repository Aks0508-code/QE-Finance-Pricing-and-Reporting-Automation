import { test as pricingTest, expect } from './pricing.fixture';
import { OrderEntrySpecialsPage } from '../pages/order-entry-specials/order-entry-specials.page';

type OrderEntrySpecialsFixtures = {
  orderEntrySpecials: OrderEntrySpecialsPage;
};

export const test = pricingTest.extend<OrderEntrySpecialsFixtures>({
  orderEntrySpecials: async ({ sharedPage, shell }, use) => {
    const orderEntrySpecials = new OrderEntrySpecialsPage(sharedPage);
    await orderEntrySpecials.goto();
    await shell.loginIfRequired();
    await orderEntrySpecials.goto();
    await use(orderEntrySpecials);
  },
});

export { expect };