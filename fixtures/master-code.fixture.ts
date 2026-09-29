import { test as pricingTest, expect } from './pricing.fixture';
import { MasterCodeMaintenancePage } from '../pages/master-code/master-code-maintenance.page';

type MasterCodeFixtures = {
  masterCode: MasterCodeMaintenancePage;
};

export const test = pricingTest.extend<MasterCodeFixtures>({
  masterCode: async ({ sharedPage, shell }, use) => {
    const masterCode = new MasterCodeMaintenancePage(sharedPage);
    await masterCode.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await masterCode.goto();
    await use(masterCode);
  },
});

export { expect };