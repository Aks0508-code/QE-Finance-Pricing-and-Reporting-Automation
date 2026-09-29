import type { Page } from '@playwright/test';

const filterRowPattern = /Page\s*name.*Type.*Search/i;
const visibleTextInput = 'input[type="text"]:visible';

export const masterCodeLocators = {
  heading: (page: Page) => page.getByText('Master Code Maintenance', { exact: true }),
  breadcrumb: (page: Page) => page.getByRole('link', { name: /Master Code Maintenance/i }).first(),
  environment: (page: Page) => page.getByRole('row', { name: /^Environment:/i }).getByRole('combobox').first()
    .or(page.locator('select:visible').first()).first(),
  filterRow: (page: Page) => page.getByRole('row', { name: filterRowPattern }).first(),
  pageNameSearch: (page: Page) => masterCodeLocators.filterRow(page).locator(visibleTextInput).nth(0),
  typeSearch: (page: Page) => masterCodeLocators.filterRow(page).locator(visibleTextInput).nth(1),
  search: (page: Page) => masterCodeLocators.filterRow(page).getByRole('button', { name: /^Search$/i }).first()
    .or(masterCodeLocators.filterRow(page).locator('input[value="Search"]')).first(),
  exportToExcel: (page: Page) => page.getByRole('button', { name: /Export To Excel/i }).first()
    .or(page.locator('input[value*="Export"]').first()).first(),
  grid: (page: Page) => page.locator('#grdMasterCode, table:visible')
    .filter({ hasText: /Initial.*PageName.*Type.*Code.*Description.*Explanation.*InUse/i }).last(),
  dataRows: (page: Page) => masterCodeLocators.grid(page).locator('tr:has(input:not([type="hidden"]):visible)'),
  editableInputs: (page: Page) => masterCodeLocators.dataRows(page).first().locator(visibleTextInput),
  addNew: (page: Page) => page.getByRole('button', { name: /Add New/i }).first()
    .or(page.locator('input[value*="Add New"]').first()).first(),
  save: (page: Page) => page.getByRole('button', { name: /^Save$/i }).first()
    .or(page.locator('input[value="Save"]').first()).first(),
  cancel: (page: Page) => page.getByRole('button', { name: /^Cancel$/i }).first()
    .or(page.locator('input[value="Cancel"]').first()).first(),
  pagination: (page: Page) => page.getByRole('link', { name: /^(previous|prev|next|>|<|>>|<<)$/i })
    .or(page.getByRole('button', { name: /^(previous|prev|next|>|<|>>|<<)$/i })),
  validationMessage: (page: Page) => page.getByText(/required|must enter|please enter|invalid/i).first(),
};