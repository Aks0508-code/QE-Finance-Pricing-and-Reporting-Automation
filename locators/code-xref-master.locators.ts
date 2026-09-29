import type { Page } from '@playwright/test';

const visibleText = 'input[type="text"]:visible';

export const codeXRefMasterLocators = {
  heading: (page: Page) => page.getByText('Code Cross Reference Master Maintenance', { exact: true }),
  breadcrumb: (page: Page) => page.getByRole('link', { name: /Code Cross Reference Master/i }).first(),
  environment: (page: Page) => page.getByRole('row', { name: /^Environment:/i }).getByRole('combobox').first()
    .or(page.locator('select:visible').first()).first(),
  filterRow: (page: Page) => page.getByRole('row', { name: /Base Code.*Search/i }).first(),
  baseCodeSearch: (page: Page) => page.locator('#txtBaseCodeSearch').first()
    .or(codeXRefMasterLocators.filterRow(page).locator(visibleText)).first(),
  search: (page: Page) => page.locator('#btnSearch').first()
    .or(codeXRefMasterLocators.filterRow(page).getByRole('button', { name: /^Search$/i }))
    .or(codeXRefMasterLocators.filterRow(page).locator('input[value="Search"]')).first(),
  grid: (page: Page) => page.locator('#grdXrefMaster').first(),
  dataRows: (page: Page) => codeXRefMasterLocators.grid(page).locator('tr:has(input[type="text"]:visible)'),
  safeRows: (page: Page) => codeXRefMasterLocators.dataRows(page).filter({ hasNotText: /FOBARC|\*/i }),
  exportToExcel: (page: Page) => page.getByRole('button', { name: /Export To Excel/i }).first()
    .or(page.locator('input[value*="Export"]')).first(),
  addNew: (page: Page) => page.getByRole('button', { name: /Add New/i }).first()
    .or(page.locator('input[value*="Add New"]')).first(),
  save: (page: Page) => page.getByRole('button', { name: /^Save$/i }).first()
    .or(page.locator('input[value="Save"]')).first(),
  cancel: (page: Page) => page.getByRole('button', { name: /^Cancel$/i }).first()
    .or(page.locator('input[value="Cancel"]')).first(),
  pagination: (page: Page) => page.getByRole('link', { name: /^(previous|prev|next|>|<|>>|<<)$/i })
    .or(page.getByRole('button', { name: /^(previous|prev|next|>|<|>>|<<)$/i })),
  entryHeading: (page: Page) => page.getByText('Code Cross Reference Entry', { exact: true }),
  entryType: (page: Page) => page.locator('#ddlType, select[name="ddlType"]').first(),
  entryBaseCode: (page: Page) => page.locator('#txtBaseCode, input[name="txtBaseCode"]').first(),
  entryXRefCode: (page: Page) => page.locator('#txtXrefCode, input[name="txtXrefCode"]').first(),
  entrySave: (page: Page) => page.locator('#btnSave, input[value="Save"]').first(),
  entryCancel: (page: Page) => page.locator('#btnCancel, input[value="Cancel"]').first(),
  validationMessage: (page: Page) => page.getByText(/required|must enter|please enter|invalid|already exists/i).first(),
};