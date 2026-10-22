import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '../../../fixtures/pricing.fixture';
import {
  getPriceCodeCategoryData,
  getPriceCodeCreateData,
  getPriceCodeDuplicateCode,
  getPriceCodeDuplicateExpectation,
  getPriceCodeExistingUpdateData,
  getPriceCodeInvalidData,
  getPriceCodeSearchData,
  getPriceCodeSearchAttempts,
  getPriceCodeMutationData,
  hasPriceCodeCategoryData,
  hasPriceCodeDuplicateData,
  hasPriceCodeExistingMutationData,
  hasPriceCodeInvalidData,
  hasPriceCodeSearchData,
  hasPriceCodeMutationData,
} from '../../../config/price-code-data';
import { runtimeConfig } from '../../../config/runtime-config';

test.describe('Price Codes maintenance', () => {
  test.describe.configure({ mode: 'default' });

  test.afterEach(async ({ sharedPage }, testInfo) => {
    if (sharedPage.isClosed()) return;
    const status = testInfo.status ?? 'unknown';
    const result = status === 'passed'
      ? 'PASS'
      : status === 'skipped'
        ? 'SKIPPED'
        : `FAIL: ${status.toUpperCase()}`;
    await sharedPage.evaluate((label) => {
      const existing = document.getElementById('playwright-result-banner');
      existing?.remove();
      const banner = document.createElement('div');
      banner.id = 'playwright-result-banner';
      banner.textContent = `AUTOMATION RESULT: ${label}`;
      Object.assign(banner.style, {
        position: 'fixed',
        top: '8px',
        right: '8px',
        zIndex: '2147483647',
        padding: '10px 16px',
        background: label === 'PASS' ? '#137333' : label === 'SKIPPED' ? '#8a6d1d' : '#b3261e',
        color: '#ffffff',
        font: 'bold 16px Arial, sans-serif',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,.35)',
      });
      document.body.appendChild(banner);
    }, result);
    const screenshotPath = testInfo.outputPath('final-state.png');
    await sharedPage.screenshot({ path: screenshotPath, fullPage: true });
    await testInfo.attach('final-state', { path: screenshotPath, contentType: 'image/png' });
    await sharedPage.evaluate(() => document.getElementById('playwright-result-banner')?.remove());
    await sharedPage.goto(runtimeConfig.priceCodesPath, { waitUntil: 'domcontentloaded' });
  });

  test('@price-code @smoke @pricing-regression @functional Price Codes page loads', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
  });

  test('@price-code @smoke @pricing-regression @functional Price Codes exposes core maintenance controls', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.expectCoreControlsVisible();
  });

  test('@price-code @smoke @pricing-regression @navigation Price Codes breadcrumb identifies the module', async ({ sharedPage, priceCodes }) => {
    await priceCodes.expectLoaded();
    await expect(sharedPage.getByRole('link', { name: 'Price Codes', exact: true })).toBeVisible();
  });

  test('@price-code @regression @functional active Price Code rows expose editable fields', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.expectActivePriceCodeRows();
  });

  test('@price-code @regression @functional Add New exposes the create, submit, and cancel workflow', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.expectAddNewWorkflowControls();
  });

  test('@price-code @regression @functional Copy Price Code opens a cancellable copy workflow', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.expectCopyPriceCodeWorkflow();
  });

  test('@price-code @regression @validation blank Add New submission stays on the form', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.expectBlankAddNewSubmissionValidation();
  });

  test('@price-code @regression @validation invalid Add New values stay on the form', async ({ priceCodes }) => {
    test.skip(
      !runtimeConfig.mutationEnabled || !hasPriceCodeMutationData() || !hasPriceCodeInvalidData(),
      'Requires approved Add New values and invalid test data.',
    );
    await priceCodes.expectLoaded();
    await priceCodes.expectInvalidAddNewSubmissionValidation(getPriceCodeInvalidData(), getPriceCodeMutationData());
  });

  test('@price-code @e2e @regression @search random item and category search displays matching Price List results', async ({ priceCodes }) => {
    if (hasPriceCodeCategoryData() && getPriceCodeCategoryData().toLowerCase() === 'unasn') {
      await priceCodes.expectLoaded();
      const item = await priceCodes.discoverRandomItemFromCategoryPriceCode(getPriceCodeCategoryData());
      await priceCodes.searchByItemAndCategory(item, getPriceCodeCategoryData());
      await priceCodes.expectItemSearchResults(item);
      return;
    }
    test.skip(!hasPriceCodeSearchData(), 'Set an item CSV/list and approved category code values to run the combined search.');
    await priceCodes.expectLoaded();
    const attempts = getPriceCodeSearchAttempts();
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const data = getPriceCodeSearchData();
      const category = await priceCodes.searchByItemAndCategories(data.item, [data.categoryCode, ...data.categoryCodes]);
      if (!category) continue;
      await priceCodes.expectItemSearchResults(data.item);
      return;
    }

    throw new Error(`No matching item/category combination was found after ${attempts} random item attempts.`);
  });

  test('@price-code @e2e @regression @navigation formula navigation returns to Price Codes', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.openFirstFormulaAndReturn();
  });

  test('@price-code @e2e @regression @navigation Price Code navigation returns to the maintenance page', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.openFirstPriceCodeAndReturn();
  });

  test('@price-code @regression @cancel Cancel discards an unsaved description change', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.cancelUnsavedFirstDescriptionEdit();
  });

  test('@price-code @mutation @regression description can be saved and restored', async ({ priceCodes }, testInfo) => {
    testInfo.setTimeout(8 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Requires approved create data and mutation authorization.');
    // The configured existing Price Code (PRICE_CODE_TEST_CODE) is asterisked
    // in the grid, meaning it has associated Price Lists; AshleyNET silently
    // discards description edits to asterisked codes on save (confirmed via
    // network inspection: the postback succeeds with HTTP 200 but the server
    // does not persist the field). A freshly created, non-asterisk Price Code
    // is required to exercise the description save/restore flow.
    const data = getPriceCodeCreateData();
    let created = false;
    try {
      await priceCodes.expectLoaded();
      await priceCodes.createPriceCode(data);
      created = true;
      await priceCodes.expectPriceCodeRow(data.code, data.description);
      await priceCodes.editDescriptionSaveAndRestore(data);
    } finally {
      if (created) await priceCodes.archivePriceCode(data.code).catch(() => undefined);
    }
  });

  test('@price-code @mutation @regression category and VAT persist while base price saves checked then unchecked and restores', async ({ priceCodes }) => {
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeExistingMutationData(), 'Requires an explicit existing Price Code and approved mutation data.');
    await priceCodes.expectLoaded();
    await priceCodes.updateExistingPriceCode(getPriceCodeExistingUpdateData());
  });

  test('@price-code @e2e @mutation @regression approved Price Code can be archived, found inactive, reactivated, and found active again', async ({ priceCodes }, testInfo) => {
    testInfo.setTimeout(30 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Price Code mutations are disabled or required create data is missing.');
    // Scanning the live grid for a pre-existing active Price Code with an
    // enabled delete checkbox is unreliable: every currently active code on
    // stage may already have Price Lists/items attached, which disables its
    // delete checkbox and leaves nothing "disposable" to find. Instead,
    // create a brand-new Price Code here (which starts with no items
    // attached, so its delete checkbox is guaranteed enabled) and use that.
    const data = getPriceCodeCreateData();
    await priceCodes.expectLoaded();
    await priceCodes.createPriceCode(data);
    await priceCodes.archiveAndReactivatePriceCode(data.code);
    await priceCodes.expectActivePriceCodeOccursOnce(data.code);
  });

  test('@price-code @e2e @mutation @archive cancel archive keeps a disposable Price Code active', async ({ priceCodes }, testInfo) => {
    testInfo.setTimeout(30 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Price Code mutations are disabled or required create data is missing.');
    const base = getPriceCodeCreateData();
    const data = { ...base, code: `${base.code.slice(0, 5)}C`, description: `${base.code.slice(0, 5)}C DESCRIPTION` };
    await priceCodes.expectLoaded();
    await priceCodes.createPriceCode(data);
    await priceCodes.cancelArchivePriceCode(data.code);
    await priceCodes.expectActivePriceCodeOccursOnce(data.code);
  });

  test('@price-code @e2e @mutation @archive continue archive moves a disposable Price Code to inactive', async ({ priceCodes }, testInfo) => {
    testInfo.setTimeout(30 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Price Code mutations are disabled or required create data is missing.');
    const base = getPriceCodeCreateData();
    const data = { ...base, code: `${base.code.slice(0, 5)}D`, description: `${base.code.slice(0, 5)}D DESCRIPTION` };
    await priceCodes.expectLoaded();
    await priceCodes.createPriceCode(data);
    await priceCodes.archiveAndReactivatePriceCode(data.code);
    await priceCodes.expectActivePriceCodeOccursOnce(data.code);
  });

  test('@price-code @e2e @mutation @regression create archive reactivate lifecycle completes end to end', async ({ priceCodes }, testInfo) => {
    testInfo.setTimeout(30 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Requires approved create data and mutation authorization.');
    const data = getPriceCodeCreateData();
    let created = false;
    let active = false;
    try {
      await priceCodes.expectLoaded();
      await priceCodes.createPriceCode(data);
      created = true;
      active = true;
      await priceCodes.expectPriceCodeRow(data.code, data.description);
      await priceCodes.archivePriceCode(data.code);
      active = false;
      await priceCodes.reactivatePriceCode(data.code);
      active = true;
      await priceCodes.expectActivePriceCodeOccursOnce(data.code);
    } finally {
      if (created) {
        if (!active) await priceCodes.reactivatePriceCode(data.code).catch(() => undefined);
        await priceCodes.archivePriceCode(data.code).catch(() => undefined);
      }
    }
  });

  test('@price-code @e2e @mutation @regression create Price Code covers without-tax VAT scenario', async ({ priceCodes }, testInfo) => {
    testInfo.setTimeout(30 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Requires approved create data and mutation authorization.');
    const base = getPriceCodeCreateData();
    const data = {
      ...base,
      code: `${base.code.slice(0, 5)}A`,
      description: `${base.code.slice(0, 5)}A DESCRIPTION`,
      vatOption: 'NO TAX - 0.00',
      includeVat: false,
    };
    let created = false;
    try {
      await priceCodes.goto();
      await priceCodes.expectLoaded();
      await priceCodes.createPriceCode(data);
      created = true;
      await priceCodes.expectPriceCodeRow(data.code, data.description);
    } finally {
      if (created) await priceCodes.archivePriceCode(data.code).catch(() => undefined);
      await priceCodes.goto().catch(() => undefined);
    }
  });

  test('@price-code @e2e @mutation @regression create Price Code covers with-tax VAT scenario', async ({ priceCodes }, testInfo) => {
    testInfo.setTimeout(30 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Requires approved create data and mutation authorization.');
    const base = getPriceCodeCreateData();
    const data = {
      ...base,
      code: `${base.code.slice(0, 5)}B`,
      description: `${base.code.slice(0, 5)}B DESCRIPTION`,
      vatOption: 'VAT06 - 0.06',
      includeVat: true,
    };
    let created = false;
    try {
      await priceCodes.goto();
      await priceCodes.expectLoaded();
      await priceCodes.createPriceCode(data);
      created = true;
      await priceCodes.expectPriceCodeRow(data.code, data.description);
    } finally {
      if (created) await priceCodes.archivePriceCode(data.code).catch(() => undefined);
      await priceCodes.goto().catch(() => undefined);
    }
  });

  test('@price-code @e2e @mutation @regression create Price Code then upload a price spreadsheet against it', async ({ priceCodes, priceList }) => {
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Requires approved create data and mutation authorization.');
    const uploadFile = process.env.PRICE_LIST_UPLOAD_FILE?.trim();
    test.skip(!uploadFile, 'Requires PRICE_LIST_UPLOAD_FILE pointing at an approved upload spreadsheet.');
    const data = getPriceCodeCreateData();
    let created = false;
    try {
      // The priceList fixture navigates the shared page to the Price List
      // screen as part of its setup, so explicitly return to Price Code
      // Maintenance before relying on it being loaded here.
      await priceCodes.goto();
      await priceCodes.expectLoaded();
      await priceCodes.createPriceCode(data);
      created = true;
      await priceCodes.expectPriceCodeRow(data.code, data.description);
      await priceCodes.openPriceListForCode(data.code);
      const target = await priceList.openUploadWorkflow();
      try {
        await priceList.uploadApprovedSpreadsheet(target);
      } finally {
        await priceList.closeUploadTarget(target);
      }
    } finally {
      if (created) await priceCodes.archivePriceCode(data.code).catch(() => undefined);
    }
  });

  test('@price-code @e2e @mutation @regression complete upload functionality covers valid, duplicate, and header-variant scenarios', async ({ priceCodes, priceList }, testInfo) => {
    testInfo.setTimeout(15 * 60_000);
    test.skip(!runtimeConfig.mutationEnabled || !hasPriceCodeMutationData(), 'Requires approved create data and mutation authorization.');
    const generatedDir = join(__dirname, '..', '..', '..', 'test-data', 'generated');
    test.skip(!existsSync(generatedDir), `Generated upload fixtures were not found at ${generatedDir}. Run scripts/generate-price-upload-excels.py first.`);

    const scenarios: Array<{ label: string; files: string[]; expectNotUploaded: boolean }> = [
      {
        label: 'positive: valid small item batches',
        files: Array.from({ length: 5 }, (_, i) => join(generatedDir, `valid-items-small-${String(i + 1).padStart(2, '0')}.xlsx`)),
        expectNotUploaded: false,
      },
      {
        label: 'negative: duplicate items within the same file',
        files: Array.from({ length: 5 }, (_, i) => join(generatedDir, `duplicate-check-${String(i + 1).padStart(2, '0')}.xlsx`)),
        expectNotUploaded: true,
      },
      {
        label: 'header-variant: differing header row spellings/casing',
        files: Array.from({ length: 5 }, (_, i) => join(generatedDir, `header-variant-${String(i + 1).padStart(2, '0')}.xlsx`)),
        expectNotUploaded: false,
      },
    ];

    const data = getPriceCodeCreateData();
    let created = false;
    try {
      // The `priceList` fixture navigates through Price Code Maintenance and
      // into a Price List page as part of its own setup, so `sharedPage` may
      // already be sitting on a Price List page here rather than Price Code
      // Maintenance. Re-navigate explicitly before asserting/creating.
      await priceCodes.goto();
      await priceCodes.expectLoaded();
      await priceCodes.createPriceCode(data);
      created = true;
      await priceCodes.expectPriceCodeRow(data.code, data.description);
      await priceCodes.openPriceListForCode(data.code);

      for (const scenario of scenarios) {
        for (const file of scenario.files) {
          test.skip(!existsSync(file), `Missing generated fixture: ${file}`);
          const target = await priceList.openUploadWorkflow();
          try {
            await priceList.uploadSpreadsheetFile(target, file);
            await priceList.expectUploadStatus(target);
            if (scenario.expectNotUploaded) await priceList.expectNotUploadedList(target);
          } finally {
            await priceList.closeUploadTarget(target);
          }
        }
      }
    } finally {
      if (created) await priceCodes.archivePriceCode(data.code).catch(() => undefined);
    }
  });

  test('@price-code @mutation @regression duplicate Add New Price Code is rejected or warned', async ({ priceCodes }, testInfo) => {
    test.skip(
      !runtimeConfig.mutationEnabled || !hasPriceCodeMutationData() || !hasPriceCodeDuplicateData(),
      'Requires an approved existing/duplicate Price Code and documented duplicate outcome.',
    );
    await priceCodes.expectLoaded();
    const evidenceCaptured = await priceCodes.expectDuplicatePriceCodeRejected(
      getPriceCodeMutationData(),
      getPriceCodeDuplicateCode(),
      getPriceCodeDuplicateExpectation(),
      testInfo.outputPath('duplicate-detected.png'),
    );
    if (evidenceCaptured) {
      await testInfo.attach('duplicate-detected', {
        path: testInfo.outputPath('duplicate-detected.png'),
        contentType: 'image/png',
      });
    }
  });

  test('@price-code @regression @functional grid can scroll to the last loaded row', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.expectGridCanScrollToLastRow();
  });

  test('@price-code @regression @functional @ui-ux available row display and Previous/Next controls work', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    test.skip(!(await priceCodes.hasRowDisplayOrPaginationControls()), 'Stage does not expose Show All Rows or Previous/Next pagination controls.');
    await priceCodes.expectRowDisplayAndPaginationControls();
  });

  test('@price-code @e2e @regression @navigation customer navigation is available from a Price Code row', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    test.skip(!(await priceCodes.hasCustomerNavigation()), 'No customer navigation link is exposed by the current stage Price Code grid.');
    await priceCodes.openFirstCustomerAndReturn();
  });

  test('@price-code @regression @archive inactive Price Code view is available', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    await priceCodes.openInactiveView();
    await priceCodes.expectInactiveLoaded();
  }); 

  test('@price-code @e2e @regression @reporting Excel export downloads a file', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    const filename = await priceCodes.exportAndReturnDownload();
    expect(filename.toLowerCase()).toMatch(/\.(xls|xlsx|csv)$/);
  });

  test('@price-code @regression @reporting @ui-ux Excel upload control accepts an approved file when available', async ({ priceCodes }) => {
    await priceCodes.expectLoaded();
    test.skip(!(await priceCodes.hasExcelUploadControl()), 'Stage does not expose an Excel upload/import control on Price Code Maintenance.');
    await priceCodes.expectExcelUploadControl();
  });

  test('@price-code @regression @pricing-regression @search category-code filter can be used', async ({ priceCodes }) => {
    test.skip(!hasPriceCodeCategoryData(), 'Set an approved PRICE_CODE_TEST_CATEGORY value.');
    await priceCodes.expectLoaded();
    await priceCodes.selectCategory(getPriceCodeCategoryData());
    await priceCodes.search();
    await priceCodes.expectLoaded();
    await priceCodes.expectCategorySelected(getPriceCodeCategoryData());
  });
});