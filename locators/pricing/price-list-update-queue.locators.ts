import type { Page } from '@playwright/test';

export const priceListUpdateQueueLocators = {
  heading: (page: Page) => page.getByText(/Price List Maintenance\s*-\s*Update Queue/i).first(),
  itemSearch: (page: Page) => page.locator('#txtItemNumber, input[id*="Item" i], input[name*="Item" i]').first(),
  priceCodeSearch: (page: Page) => page.locator('#txtPriceCode, input[id*="PriceCode" i], input[name*="PriceCode" i]').first(),
  search: (page: Page) => page.getByRole('button', { name: /^Search$/i }).first(),
  exportToExcel: (page: Page) => page.getByRole('button', { name: /Export To Excel/i }).first(),
  grid: (page: Page) => page.locator('#grdCode, table').filter({ hasText: /Price|Effective Date/i }).first(),
  priceInputs: (page: Page) => page.locator('#grdCode input[id*="Price" i], #grdCode input[name*="Price" i], table input[id*="Price" i], table input[name*="Price" i]'),
  effectiveDateInputs: (page: Page) => page.locator('#grdCode input[id*="Effective" i], #grdCode input[name*="Effective" i], table input[id*="Effective" i], table input[name*="Effective" i]'),
  overrideInputs: (page: Page) => page.getByRole('checkbox', { name: /effective.*override|override.*effective/i }).or(page.locator('#grdCode input[type="checkbox"], table input[type="checkbox"]')).first(),
  save: (page: Page) => page.getByRole('button', { name: /^Save$/i }).first(),
  cancel: (page: Page) => page.getByRole('button', { name: /^Cancel$/i }).first(),
  previousPage: (page: Page) => page.getByRole('link', { name: /^(prev|previous|<|<<)$/i }).first(),
  nextPage: (page: Page) => page.getByRole('link', { name: /^(next|>|>>)$/i }).first(),
  showAllRows: (page: Page) => page.getByText(/show all rows/i).first(),
  auditColumns: (page: Page) => page.getByText(/change method|user id|change date/i).first(),
  backToPriceList: (page: Page) => page.getByRole('link', { name: /back to price list/i }).first(),
  rows: (page: Page) => priceListUpdateQueueLocators.grid(page).locator('tr:visible'),
};