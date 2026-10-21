import type { Page } from '@playwright/test';

export const priceListUpdateQueueLocators = {
  heading: (page: Page) => page.getByText(/Price List Maintenance\s*-\s*Update Queue/i).first(),
  itemSearch: (page: Page) => page.locator('#txtItemNumber, input[id*="Item" i], input[name*="Item" i]').first(),
  priceCodeSearch: (page: Page) => page.locator('#txtPriceCode, input[id*="PriceCode" i], input[name*="PriceCode" i]').first(),
  search: (page: Page) => page.getByRole('button', { name: /^Search$/i }).first(),
  exportToExcel: (page: Page) => page.getByRole('button', { name: /Export To Excel/i }).first(),
  // ASP.NET WebForms nests the real data grid inside an outer page-layout
  // table that also contains sidebar navigation. A plain `.filter().first()`
  // over "#grdCode, table" matches that outer layout table first (DOM order),
  // not the actual grid, which drags in unrelated nav links (e.g. "Employee
  // Party Table User ID Maintenance") into anything scoped off of it. Prefer
  // the explicit #grdCode element when present, and otherwise pick the last
  // (most deeply nested / most specific) matching table rather than the
  // first.
  grid: (page: Page) => {
    const byId = page.locator('#grdCode');
    const byText = page.locator('table').filter({ hasText: /Price|Effective Date/i }).last();
    return byId.or(byText).first();
  },
  priceInputs: (page: Page) => page.locator('#grdCode input[id*="Price" i]:not([type="checkbox"]), #grdCode input[name*="Price" i]:not([type="checkbox"]), table input[id*="Price" i]:not([type="checkbox"]), table input[name*="Price" i]:not([type="checkbox"])'),
  effectiveDateInputs: (page: Page) => page.locator('#grdCode input[id*="Effective" i]:not([type="checkbox"]), #grdCode input[name*="Effective" i]:not([type="checkbox"]), table input[id*="Effective" i]:not([type="checkbox"]), table input[name*="Effective" i]:not([type="checkbox"])'),
  overrideInputs: (page: Page) => page.getByRole('checkbox', { name: /effective.*override|override.*effective/i }).or(page.locator('#grdCode input[type="checkbox"], table input[type="checkbox"]')).first(),
  save: (page: Page) => page.getByRole('button', { name: /^Save$/i }).first(),
  cancel: (page: Page) => page.getByRole('button', { name: /^Cancel$/i }).first(),
  previousPage: (page: Page) => page.getByRole('link', { name: /^(prev|previous|<|<<)$/i }).first(),
  nextPage: (page: Page) => page.getByRole('link', { name: /^(next|>|>>)$/i }).first(),
  showAllRows: (page: Page) => page.getByText(/show all rows/i).first(),
  // Strictly scoped to #grdCode's own column headers. A broader `getByText`
  // fallback over any "table" element is unsafe here: when the grid hasn't
  // rendered any rows for the current Price Code, that fallback can match
  // unrelated sidebar navigation links whose text happens to contain "User
  // Id" (e.g. "Employee Party Table User ID Maintenance"), which are present
  // but hidden in the DOM. Require an actual visible column header cell
  // inside the real grid instead.
  auditColumns: (page: Page) => page.locator('#grdCode')
    .getByRole('columnheader', { name: /^(Change Method|User Id|Change Date)$/i })
    .first(),
  backToPriceList: (page: Page) => page.getByRole('link', { name: /back to price list/i }).first(),
  rows: (page: Page) => priceListUpdateQueueLocators.grid(page).locator('tr:visible'),
};