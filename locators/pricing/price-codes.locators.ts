import type { Page } from '@playwright/test';

export const priceCodeLocators = {
  heading: (page: Page) => page.getByText('Price Code Maintenance', { exact: true }),
  inactiveHeading: (page: Page) => page.getByText('Inactive Price Code Maintenance', { exact: true }),
  environment: (page: Page) => page.getByRole('row', { name: /^Environment:/i }).getByRole('combobox'),
  filterRow: (page: Page) => page.getByRole('row', { name: /Item:.*Category Code:.*Search/i }),
  itemSearch: (page: Page) => page.locator('#txtItemNumber'),
  currency: (page: Page) => priceCodeLocators.filterRow(page).getByRole('combobox').nth(0),
  categoryCode: (page: Page) => priceCodeLocators.filterRow(page).getByRole('combobox').nth(1),
  search: (page: Page) => page.getByRole('button', { name: /^Search$/i }).first(),
  viewInactive: (page: Page) => page.getByRole('button', { name: /View Inactive/i }).first(),
  itemAccruals: (page: Page) => page.getByRole('button', { name: /Item Accruals/i }).first(),
  reasonCodesHeading: (page: Page) => page.getByText('Reason Codes', { exact: true }),
  continueReasonCode: (page: Page) => page.getByRole('button', { name: /^Continue$/i }),
  addNew: (page: Page) => page.getByRole('button', { name: /Add New/i }).first(),
  copyPriceCode: (page: Page) => page.getByRole('button', { name: /Copy Price Code/i }).first(),
  save: (page: Page) => page.getByRole('button', { name: /^Save$/i }).first(),
  cancel: (page: Page) => page.getByRole('button', { name: /^Cancel$/i }).first(),
  exportToExcel: (page: Page) => page.getByRole('button', { name: /Export To Excel/i }).first(),
  excelUploadControl: (page: Page) => page.getByRole('button', { name: /upload|import.*excel|excel.*import/i }).first(),
  excelFileInput: (page: Page) => page.locator('input[type="file"]'),
  showAllRows: (page: Page) => page.getByRole('button', { name: /show all|all rows/i }).first(),
  showAllRowsLink: (page: Page) => page.getByRole('link', { name: /show all|all rows/i }).first(),
  previousPage: (page: Page) => page.getByRole('button', { name: /^(previous|prev|previous page|<|<<)$/i }).first(),
  previousPageLink: (page: Page) => page.getByRole('link', { name: /^(previous|prev|previous page|<|<<)$/i }).first(),
  nextPage: (page: Page) => page.getByRole('button', { name: /^(next|next page|>|>>)$/i }).first(),
  nextPageLink: (page: Page) => page.getByRole('link', { name: /^(next|next page|>|>>)$/i }).first(),
  grid: (page: Page) => page.locator('#grdCode'),
  gridRows: (page: Page) => priceCodeLocators.grid(page).locator('tr'),
  priceCodeRows: (page: Page) => priceCodeLocators.gridRows(page).filter({ has: page.locator('input[id$="_hdnPriceCode"]') }),
  descriptionInputs: (page: Page) => priceCodeLocators.grid(page).locator('input[id$="_txtDescrip"]'),
  categoryInputs: (page: Page) => priceCodeLocators.grid(page).locator('select[id$="_lstCatCode"]'),
  currencyInputs: (page: Page) => priceCodeLocators.grid(page).locator('select[id$="_lstCurr"]'),
  vatInputs: (page: Page) => priceCodeLocators.grid(page).locator('select[id$="_lstVAT"]'),
  basePriceInputs: (page: Page) => priceCodeLocators.grid(page).locator('input[id$="_chkBase"]'),
  formulaLinks: (page: Page) => priceCodeLocators.grid(page).locator('a[href*="Formula"]:visible'),
  priceListLinks: (page: Page) => priceCodeLocators.grid(page).locator('a[href*="PriceList"]:visible'),
  customerLinks: (page: Page) => priceCodeLocators.grid(page).locator('a:visible').filter({ hasText: /customer/i }),
  addNewEnvironmentCheckbox: (target: Page, environment: string) => {
    const exact = target.getByRole('checkbox', { name: environment, exact: true });
    const abbreviation = environment.trim().toUpperCase();
    const aliasPattern = abbreviation === 'AFI'
      ? /ASHLEY\s*FURNITURE/i
      : new RegExp(abbreviation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const alias = target.getByRole('checkbox', { name: aliasPattern });
    return exact.or(alias).first();
  },
};