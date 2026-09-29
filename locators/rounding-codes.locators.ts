import type { Page } from '@playwright/test';

export const roundingCodesLocators = {
  heading: (page: Page) => page.getByText('Rounding Codes', { exact: true }).first(),
  breadcrumb: (page: Page) => page.getByRole('link', { name: 'Rounding Codes', exact: true }).first(),
  newCode: (page: Page) => page.locator('#txtNewCode').first(),
  newDescription: (page: Page) => page.locator('#txtNewDescription').first(),
  addCode: (page: Page) => page.locator('#cmdAddNew').first(),
  grid: (page: Page) => page.locator('#grdCode').first(),
  rows: (page: Page) => roundingCodesLocators.grid(page).locator('tr:has(a[id$="_lnkEdit"])'),
  rowByCode: (page: Page, code: string) => roundingCodesLocators.rows(page).filter({ hasText: new RegExp(`(^|\\s)${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\s|$)`) }).first(),
  edit: (page: Page) => page.locator('a[id$="_lnkEdit"]'),
  description: (page: Page) => page.locator('input[id$="_txtDescrip"]'),
  delete: (page: Page) => page.locator('input[id$="_chkDelete"]'),
  save: (page: Page) => page.locator('#cmdSave').first(),
  cancel: (page: Page) => page.locator('#cmdCancel').first(),
  validation: (page: Page) => page.getByText(/required|invalid|already exists|duplicate|must enter|please enter/i).first(),
};