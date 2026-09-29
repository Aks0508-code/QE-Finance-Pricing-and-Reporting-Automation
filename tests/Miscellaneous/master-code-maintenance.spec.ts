import { expect, test } from '../../fixtures/master-code.fixture';
import { getMasterCodeSearchData, hasMasterCodeSearchData, isMasterCodeAddNewValidationEnabled } from '../../config/master-code-data';

test.describe('Master Code Maintenance', () => {
  test.beforeEach(async ({ masterCode, shell, sharedPage }) => {
    await masterCode.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await masterCode.goto();
  });

  test('@master-code @smoke @functional Master Code route loads', async ({ masterCode }) => {
    await masterCode.expectLoaded();
  });

  test('@master-code @smoke @functional Master Code exposes core maintenance controls', async ({ masterCode }) => {
    await masterCode.expectCoreControls();
  });

  test('@master-code @regression @navigation Master Code breadcrumb identifies the maintenance module', async ({ masterCode, sharedPage }) => {
    await masterCode.expectLoaded();
    const breadcrumb = sharedPage.getByRole('link', { name: /Master Code/i }).first();
    test.skip(await breadcrumb.count() === 0, 'The current page does not expose a Master Code breadcrumb link.');
    await expect(breadcrumb).toBeVisible();
  });

  test('@master-code @search @regression @functional Master Code executes the confirmed Page Name and Type search controls', async ({ masterCode }) => {
    test.skip(!(await masterCode.hasSearchControls()), 'The current page does not expose the confirmed search controls.');
    await masterCode.searchBy('', '');
  });

  test('@master-code @search @regression @functional Master Code searches with approved runtime filter data', async ({ masterCode }) => {
    test.skip(!hasMasterCodeSearchData(), 'Requires MASTER_CODE_TEST_PAGE_NAME or MASTER_CODE_TEST_TYPE approved runtime data.');
    const data = getMasterCodeSearchData();
    await masterCode.searchBy(data.pageName, data.type);
  });

  test('@master-code @regression @functional Master Code grid exposes confirmed headers and rows', async ({ masterCode }) => {
    test.skip(!(await masterCode.hasRows()), 'The current environment exposes no Master Code rows.');
    await masterCode.expectGridHeadersAndRows();
  });

  test('@master-code @regression @functional Master Code rows expose editable Description and Explanation fields', async ({ masterCode }) => {
    test.skip(!(await masterCode.hasRows()), 'The current environment exposes no editable Master Code rows.');
    await masterCode.expectEditableRowFields();
  });

  test('@master-code @regression @functional Master Code rows expose delete selection and metadata cells', async ({ masterCode }) => {
    test.skip(!(await masterCode.hasRows()), 'The current environment exposes no Master Code rows.');
    await masterCode.expectFirstRowMetadataAndDeleteControl();
  });

  test('@master-code @regression @functional Master Code Environment selector exposes options', async ({ masterCode, sharedPage }) => {
    const environment = sharedPage.getByRole('combobox').first();
    test.skip(await environment.count() === 0, 'The current page does not expose an Environment selector.');
    await expect(environment.locator('option')).not.toHaveCount(0);
  });

  test('@master-code @e2e @regression @functional Master Code can select an exposed alternate Environment safely', async ({ masterCode }) => {
    test.skip(!(await masterCode.selectAlternateEnvironmentIfAvailable()), 'The current environment exposes only one Environment option.');
  });

  test('@master-code @e2e @regression @functional Master Code Cancel discards an unsaved row edit', async ({ masterCode }) => {
    test.skip(!(await masterCode.hasRows()), 'The current environment exposes no editable Master Code rows.');
    await masterCode.cancelFirstUnsavedEdit();
  });

  test('@master-code @regression @reporting Master Code Export To Excel produces a download', async ({ masterCode, sharedPage }) => {
    const exportControl = sharedPage.getByRole('button', { name: /Export To Excel/i }).first();
    test.skip(await exportControl.count() === 0, 'The current page does not expose Export To Excel.');
    const filename = await masterCode.exportAndReturnFilename();
    expect(filename.toLowerCase()).toMatch(/\.xls[x]?$/);
  });

  test('@master-code @regression @functional Master Code optional pagination controls are usable when exposed', async ({ masterCode, sharedPage }) => {
    const pagination = sharedPage.getByRole('link', { name: /^(previous|prev|next|>|<|>>|<<)$/i }).first();
    test.skip(await pagination.count() === 0, 'The confirmed Master Code screen does not expose pagination controls.');
    await expect(pagination).toBeVisible();
  });

  test('@master-code @e2e @regression @navigation Add New Master Code opens and safely cancels when exposed', async ({ masterCode }) => {
    const target = await masterCode.openAddNew();
    test.skip(!(await masterCode.hasAddNewForm(target)), 'The current environment does not expose an Add New form surface after activation.');
    await masterCode.cancelAddNew(target);
  });

  test('@master-code @regression @validation Add New Master Code rejects blank input when validation is explicitly enabled', async ({ masterCode }) => {
    test.skip(!isMasterCodeAddNewValidationEnabled(), 'Blank Add New validation is disabled by default.');
    const target = await masterCode.openAddNew();
    test.skip(!(await masterCode.hasAddNewForm(target)), 'The current environment does not expose an Add New form surface.');
    await masterCode.submitBlankAddNew(target);
    await masterCode.cancelAddNew(target);
  });
});