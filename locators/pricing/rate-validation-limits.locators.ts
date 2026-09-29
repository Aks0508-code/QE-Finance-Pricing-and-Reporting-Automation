import type { Page } from '@playwright/test';

const gridSelector = 'table:visible';
const inputSelector = 'input:not([type="hidden"]):visible';

export const rateValidationLimitsLocators = {
  heading: (page: Page) => page.getByText('Rate Validation Limits Maintenance', { exact: true }),
  environment: (page: Page) => page.locator('#lstEnvironment, select[name*="Environment" i], select:visible').first(),
  grid: (page: Page) => page.locator(gridSelector).filter({ has: page.getByRole('columnheader', { name: 'PageName', exact: true }) }).last(),
  limitRows: (page: Page) => rateValidationLimitsLocators.grid(page).locator(`tr:has(${inputSelector})`),
  limitInputs: (page: Page) => rateValidationLimitsLocators.grid(page).locator(inputSelector),
  save: (page: Page) => page.getByRole('button', { name: /^Save$/i }).first().or(page.locator('input[value="Save"]').first()),
  cancel: (page: Page) => page.getByRole('button', { name: /^Cancel$/i }).first().or(page.locator('input[value="Cancel"]').first()),
  validationMessage: (page: Page) => page.getByText(/Upper Limit.*greater than Lower Limit|Lower Limit.*Upper Limit|invalid.*limit/i).first(),
  successMessage: (page: Page) => page.getByText(/Rate Limit[s]? (is|are) updated/i).first(),
};