import { test as pricingTest, expect } from './pricing.fixture';
import { CodeXRefMasterPage } from '../pages/code-xref-master/code-xref-master.page';

type CodeXRefMasterFixtures = {
  codeXRefMaster: CodeXRefMasterPage;
};

export const test = pricingTest.extend<CodeXRefMasterFixtures>({
  codeXRefMaster: async ({ sharedPage, shell }, use) => {
    const codeXRefMaster = new CodeXRefMasterPage(sharedPage);
    await codeXRefMaster.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await codeXRefMaster.goto();
    await use(codeXRefMaster);
  },
});

export { expect };