import type { Page } from '@playwright/test';

export const priceListLocators = {
  heading: (page: Page) => page.getByText('Price List Maintenance', { exact: true }),
  inactiveView: (page: Page) => page.getByRole('button', { name: /view inactive|inactive|archived/i }).or(page.getByRole('link', { name: /view inactive|inactive|archived/i })).first(),
  inactiveHeading: (page: Page) => page.getByText(/Inactive Price List Maintenance|Inactive Price List|Archived Price List/i).first(),
  itemSearch: (page: Page) => page.locator('#txtItemNumber').first(),
  search: (page: Page) => page.getByRole('button', { name: /^Search$/i }).first(),
  exportToExcel: (page: Page) => page.getByRole('button', { name: /Export To Excel/i }).first(),
  uploadLinks: (page: Page) => page.locator('a[href*="PriceListUploadItems"]:visible, a:visible').filter({ hasText: /upload/i }),
  uploadControl: (page: Page) => page.getByRole('button', { name: /upload.*spreadsheet|upload.*excel|upload/i }).first(),
  uploadHeading: (page: Page) => page.getByText(/Update Pricing for Price Code/i).first(),
  uploadFile: (page: Page) => page.locator('input[type="file"]').first(),
  hasHeaderRow: (page: Page) => page.getByRole('checkbox', { name: /header row/i }).first(),
  effectiveDate: (page: Page) => page.locator('input[type="date"], input[id*="Effective" i]:not([type="file"]):not([type="checkbox"]):not([type="button"]):not([type="submit"]):not([type="image"]):not([type="hidden"]), input[name*="Effective" i]:not([type="file"]):not([type="checkbox"]):not([type="button"]):not([type="submit"]):not([type="image"]):not([type="hidden"])')
    .or(page.getByText(/Effective Date:?/i).locator('xpath=following::input[not(@type="file") and not(@type="checkbox") and not(@type="button") and not(@type="submit") and not(@type="image") and not(@type="hidden")][1]'))
    .or(page.getByText(/Effective Date:?/i).locator('xpath=following::*[@role="textbox"][1]'))
    .or(page.getByRole('textbox'))
    .first(),
  effectiveDateTrigger: (page: Page) => page.locator('img[src*="calendar" i], a[href*="calendar" i], input[id*="Effective" i] + img').first(),
  calendar: (page: Page) => page.locator('.ajax__calendar_container:visible, .ajax__calendar:visible, [role="dialog"]:visible').first(),
  calendarNext: (page: Page) => priceListLocators.calendar(page).getByText('>', { exact: true }).first(),
  calendarPrevious: (page: Page) => priceListLocators.calendar(page).getByText('<', { exact: true }).first(),
  calendarDays: (page: Page) => priceListLocators.calendar(page).locator('.ajax__calendar_day:visible, [role="gridcell"]:visible'),
  commonAdjustments: (page: Page) => page.locator('select[id*="Adjustment" i], input[id*="Adjustment" i], select[name*="Adjustment" i], input[name*="Adjustment" i]'),
  doNotReplaceOpenOrders: (page: Page) => page.getByRole('checkbox', { name: /do not re(?:place|price) open orders/i }).first(),
  uploadSpreadsheet: (page: Page) => page.getByRole('button', { name: /Upload Price Spreadsheet/i }).first(),
  notUploadedList: (page: Page) => page.getByRole('button', { name: /Not Uploaded List/i }).first(),
  closeWindow: (page: Page) => page.getByRole('button', { name: /Close Window/i }).first(),
  completion: (page: Page) => page.getByText(/Completed\s*100%/i).first(),
  uploadSummary: (page: Page) => page.getByText(/Total Spreadsheet Rows|Total Uploaded Rows|Total Not Uploaded Rows/i).first(),
  priceListLinks: (page: Page) => page.locator('#grdCode a[href*="PriceList"]:visible'),
  resultRows: (page: Page) => page.locator('table tr:visible'),
  previousPage: (page: Page) => page.getByRole('link', { name: /^(prev|previous|<|<<)$/i }).first(),
  nextPage: (page: Page) => page.getByRole('link', { name: /^(next|>|>>)$/i }).first(),
  showAllRows: (page: Page) => page.getByText(/show all rows/i).first(),
  deleteAll: (page: Page) => page.getByRole('checkbox', { name: /delete all/i }).or(page.locator('input[id*="DeleteAll" i], input[name*="DeleteAll" i]')).first(),
  rowDelete: (page: Page) => page.getByRole('checkbox', { name: /^delete$/i }).or(page.locator('input[id*="Delete" i], input[name*="Delete" i]')).first(),
  save: (page: Page) => page.getByRole('button', { name: /^Save$/i }).first(),
  cancel: (page: Page) => page.getByRole('button', { name: /^Cancel$/i }).first(),
};