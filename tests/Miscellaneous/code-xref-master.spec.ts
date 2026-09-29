import { expect, test } from '../../fixtures/code-xref-master.fixture';
import type { Page } from '@playwright/test';
import { getCodeXRefMasterBaseCode, hasCodeXRefMasterBaseCode, isCodeXRefMasterAddNewValidationEnabled } from '../../config/code-xref-master-data';

test.describe('Code Cross Reference Master Maintenance', () => {
  test.beforeEach(async ({ codeXRefMaster, shell, sharedPage }) => {
    await codeXRefMaster.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await codeXRefMaster.goto();
  });

  test('@code-xref-master @smoke @functional Code Cross Reference route loads', async ({ codeXRefMaster }) => {
    await codeXRefMaster.expectLoaded();
  });

  test('@code-xref-master @smoke @functional Code Cross Reference exposes core controls', async ({ codeXRefMaster }) => {
    await codeXRefMaster.expectCoreControls();
  });

  test('@code-xref-master @regression @navigation Code Cross Reference breadcrumb identifies the module', async ({ codeXRefMaster, sharedPage }) => {
    await codeXRefMaster.expectLoaded();
    const breadcrumb = sharedPage.getByRole('link', { name: /Code Cross Reference Master/i }).first();
    test.skip(await breadcrumb.count() === 0, 'The current page does not expose a Code Cross Reference breadcrumb.');
    await expect(breadcrumb).toBeVisible();
  });

  test('@code-xref-master @search @regression @functional Code Cross Reference executes the Base Code search', async ({ codeXRefMaster }) => {
    test.skip(!(await codeXRefMaster.hasSearchControls()), 'The confirmed Base Code search controls are not exposed.');
    await codeXRefMaster.searchByBaseCode('');
  });

  test('@code-xref-master @search @regression @functional Code Cross Reference searches with approved Base Code data', async ({ codeXRefMaster }) => {
    test.skip(!hasCodeXRefMasterBaseCode(), 'Requires CODE_XREF_MASTER_TEST_BASE_CODE approved runtime data.');
    await codeXRefMaster.searchByBaseCode(getCodeXRefMasterBaseCode());
  });

  test('@code-xref-master @regression @functional Code Cross Reference exposes confirmed grid headers and rows', async ({ codeXRefMaster }) => {
    test.skip(!(await codeXRefMaster.hasRows()), 'The current environment exposes no Code Cross Reference rows.');
    await codeXRefMaster.expectGridHeadersAndRows();
  });

  test('@code-xref-master @regression @functional Code Cross Reference protects approved rows and exposes editable fields', async ({ codeXRefMaster }) => {
    test.skip(!(await codeXRefMaster.hasRows()), 'The current environment exposes no Code Cross Reference rows.');
    await codeXRefMaster.expectSafeEditableRow();
  });

  test('@code-xref-master @regression @functional Code Cross Reference Environment selector exposes options', async ({ codeXRefMaster }) => {
    await codeXRefMaster.expectEnvironmentOptions();
  });

  test('@code-xref-master @e2e @regression @functional Code Cross Reference can select an exposed alternate Environment safely', async ({ codeXRefMaster }) => {
    test.skip(!(await codeXRefMaster.selectAlternateEnvironmentIfAvailable()), 'The current environment exposes only one Environment option.');
  });

  test('@code-xref-master @e2e @regression @functional Code Cross Reference Cancel discards a safe unsaved row edit', async ({ codeXRefMaster }) => {
    test.skip(!(await codeXRefMaster.hasRows()), 'The current environment exposes no editable Code Cross Reference rows.');
    await codeXRefMaster.cancelFirstSafeUnsavedEdit();
  });

  test('@code-xref-master @regression @reporting Code Cross Reference export produces a spreadsheet download when exposed', async ({ codeXRefMaster, sharedPage }) => {
    test.skip(await codeXRefMasterLocatorsExportCount(sharedPage) === 0, 'The current Code Cross Reference page does not expose an export control.');
    const filename = await codeXRefMaster.exportAndReturnFilename();
    expect(filename.toLowerCase()).toMatch(/\.xls[x]?$/);
  });

  test('@code-xref-master @regression @functional Code Cross Reference optional pagination is usable when exposed', async ({ codeXRefMaster, sharedPage }) => {
    const pagination = sharedPage.getByRole('link', { name: /^(previous|prev|next|>|<|>>|<<)$/i }).first();
    test.skip(await pagination.count() === 0, 'The confirmed screen uses an inner grid and exposes no pagination controls.');
    await expect(pagination).toBeVisible();
  });

  test('@code-xref-master @e2e @regression @navigation Add New Code Cross Reference opens and safely cancels', async ({ codeXRefMaster }) => {
    const target = await codeXRefMaster.openAddNew();
    test.skip(!(await codeXRefMaster.hasEntryForm(target)), 'The current environment does not expose the confirmed entry form.');
    await codeXRefMaster.expectEntryForm(target);
    await codeXRefMaster.cancelEntry(target);
  });

  test('@code-xref-master @regression @functional Code Cross Reference entry form exposes type options and code fields', async ({ codeXRefMaster }) => {
    const target = await codeXRefMaster.openAddNew();
    test.skip(!(await codeXRefMaster.hasEntryForm(target)), 'The current environment does not expose the confirmed entry form.');
    await codeXRefMaster.expectEntryForm(target);
    await expect(target.locator('#ddlType option')).not.toHaveCount(0);
    await codeXRefMaster.cancelEntry(target);
  });

  test('@code-xref-master @regression @validation Add New Code Cross Reference rejects blank input when explicitly enabled', async ({ codeXRefMaster }) => {
    test.skip(!isCodeXRefMasterAddNewValidationEnabled(), 'Blank Add New validation is disabled by default.');
    const target = await codeXRefMaster.openAddNew();
    test.skip(!(await codeXRefMaster.hasEntryForm(target)), 'The current environment does not expose the confirmed entry form.');
    await codeXRefMaster.submitBlankEntry(target);
    await codeXRefMaster.cancelEntry(target);
  });
});

async function codeXRefMasterLocatorsExportCount(page: Page): Promise<number> {
  return await page.getByRole('button', { name: /Export To Excel/i }).count() + await page.locator('input[value*="Export"]').count();
}