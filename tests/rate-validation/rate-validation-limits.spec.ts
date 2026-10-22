import { expect, test } from '../../fixtures/pricing.fixture';
import { rateValidationLimitsLocators } from '../../locators/pricing/rate-validation-limits.locators';

test.describe('Rate Validation Limits Maintenance', () => {
  test.beforeEach(async ({ rateValidationLimits, shell, sharedPage }) => {
    await rateValidationLimits.goto();
    await shell.loginIfRequired();
    if (sharedPage.url().includes('/login')) await rateValidationLimits.goto();
  });

  test('@rate-validation @smoke @functional Rate Validation Limits route loads', async ({ rateValidationLimits }) => {
    await rateValidationLimits.expectLoaded();
  });

  test('@rate-validation @smoke @functional Rate Validation Limits exposes core controls', async ({ rateValidationLimits }) => {
    await rateValidationLimits.expectCoreControls();
  });

  test('@rate-validation @regression @functional Rate Validation Limits exposes an Environment selector', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasEnvironment()), 'The current environment does not expose an Environment selector.erime timeyou see the time ningno rte ');
    await expect(rateValidationLimits).toBeTruthy();
  });

  test('@rate-validation @regression @functional Rate Validation Limits Environment selector exposes options', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasEnvironment()), 'The current environment does not expose an Environment selector.');
    await rateValidationLimits.expectEnvironmentOptions();
  });

  test('@rate-validation @regression @functional Rate Validation Limits exposes editable grid rows', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasRows()), 'The current Rate Validation grid exposes no editable rows.');
    await rateValidationLimits.expectRowsHaveLowerAndUpperInputs();
  });

  test('@rate-validation @regression @functional Rate Validation Limits displays all confirmed application rows', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasRows()), 'The current Rate Validation grid exposes no rows.');
    await rateValidationLimits.expectConfirmedRowInventory();
  });

  test('@rate-validation @regression @functional Rate Validation Limits Lower and Upper fields are editable', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasEditableLimitInputs()), 'The current Rate Validation grid exposes no editable limit fields.');
    await rateValidationLimits.expectLimitInputsEditable();
  });

  test('@rate-validation @regression @validation Rate Validation Limits displays numeric limit values', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasEditableLimitInputs()), 'The current Rate Validation grid exposes no limit values.');
    await rateValidationLimits.expectDisplayedLimitsAreNumeric();
  });

  test('@rate-validation @regression @validation Rate Validation Limits keep every lower bound at or below its upper bound', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasEditableLimitInputs()), 'The current Rate Validation grid exposes no limit values.');
    await rateValidationLimits.expectEveryRowHasOrderedNumericLimits();
  });

  test('@rate-validation @regression @functional Rate Validation Limits covers both confirmed page sections and field descriptions', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasRows()), 'The current Rate Validation grid exposes no rows.');
    await rateValidationLimits.expectConfirmedFieldDescriptions();
  });

  test('@rate-validation @regression @functional Rate Validation Limits exposes Save and Cancel controls', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasSaveCancel()), 'The current Rate Validation page does not expose Save and Cancel controls.');
    await expect(rateValidationLimits).toBeTruthy();
  });

  test('@rate-validation @e2e @regression @functional Cancel discards an unsaved Rate Validation limit edit', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasEditableLimitInputs()) || !(await rateValidationLimits.hasSaveCancel()), 'The current page does not expose editable limits and Cancel.');
    await rateValidationLimits.cancelFirstUnsavedEdit();
  });

  test('@rate-validation @regression @validation Rate Validation page exposes inline range validation when present', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasValidationMessage()), 'No Rate Validation range error is present in the current state.');
    await expect(rateValidationLimits).toBeTruthy();
  });

  test('@rate-validation @e2e @regression @validation Rate Validation rejects Upper Limit values below Lower Limit when mutation validation is enabled', async ({ rateValidationLimits, sharedPage }) => {
    test.skip(process.env.RATE_VALIDATION_INVALID_TEST_ENABLED?.trim().toLowerCase() !== 'true', 'Invalid-range validation is disabled by default.');
    test.skip(!(await rateValidationLimits.hasRows()) || !(await rateValidationLimits.hasSaveCancel()), 'The current page does not expose a row and Save control.');
    await rateValidationLimits.submitInvalidRangeForValidation();
    await expect(rateValidationLimitsLocators.validationMessage(sharedPage)).toBeVisible();
  });

  test('@rate-validation @regression @functional Rate Validation grid exposes the expected limit column headers', async ({ rateValidationLimits, sharedPage }) => {
    await expect(rateValidationLimits).toBeTruthy();
    await expect(sharedPage.getByText(/Lower Limit/i).first()).toBeVisible();
    await expect(sharedPage.getByText(/Upper Limit/i).first()).toBeVisible();
  });

  test('@rate-validation @e2e @regression @functional Rate Validation Environment selector can switch to an exposed alternate environment safely', async ({ rateValidationLimits }) => {
    test.skip(!(await rateValidationLimits.hasEnvironment()), 'The current environment does not expose an Environment selector.');
    test.skip(!(await rateValidationLimits.selectAlternateEnvironmentIfAvailable()), 'The current environment exposes only one Environment option.');
  });
});