import { expect, test } from '../../fixtures/expired-specials.fixture';
import { hasExpiredSpecialsMutationData, isExpiredSpecialsBlankValidationEnabled } from '../../config/expired-specials-data';
import { expiredSpecialsLocators as locators } from '../../locators/expired-specials.locators';

test.describe('Expired Specials - Order Maintenance', () => {
  test('@expired-specials @smoke @functional Expired Special Discounts route loads', async ({ expiredSpecials }) => {
    await expiredSpecials.expectDiscountsLoaded();
  });
  test('@expired-specials @smoke @functional Expired Special Discounts exposes search controls', async ({ expiredSpecials }) => {
    await expiredSpecials.expectDiscountCoreControls();
  });
  test('@expired-specials @smoke @functional Expired Special Discounts exposes Update, Execute, and Cancel', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDiscounts();
    await expiredSpecials.expectDiscountActions();
  });
  test('@expired-specials @regression @navigation Expired Special Discounts stays on Stage', async ({ expiredSpecials }) => {
    await expiredSpecials.expectDiscountsLoaded();
    expect(new URL(expiredSpecials.currentPage.url()).hostname).toBe('stage.ashleynet.com');
  });
  test('@expired-specials @regression @search Expired Special Discounts executes the search', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDiscounts();
    await expiredSpecials.searchDiscounts();
  });
  test('@expired-specials @e2e @regression @functional Expired Special Discounts exposes its result grid', async ({ expiredSpecials }) => {
    test.skip(!(await expiredSpecials.hasDiscountRows()), 'The environment exposes no expired discount rows.');
    await expiredSpecials.expectDiscountGrid();
  });
  test('@expired-specials @e2e @regression @functional Expired Special Discounts rows expose selection controls', async ({ expiredSpecials }) => {
    test.skip(!(await expiredSpecials.hasDiscountRows()), 'The environment exposes no expired discount rows.');
    await expect(locators.discountSelection(expiredSpecials.currentPage).first()).toBeVisible();
  });
  test('@expired-specials @e2e @regression @functional Expired Special Discounts supports safe Cancel selection handling', async ({ expiredSpecials }) => {
    test.skip(!(await expiredSpecials.hasDiscountRows()), 'The environment exposes no expired discount rows.');
    await expiredSpecials.cancelSelectedDiscounts();
  });
  test('@expired-specials @e2e @regression @mutation Update is available for an approved expired discount', async ({ expiredSpecials }) => {
    test.skip(!hasExpiredSpecialsMutationData(), 'Update requires explicit mutation enablement and an approved test order.');
    await expiredSpecials.gotoDiscounts();
    test.skip(!(await expiredSpecials.hasApprovedDiscountRow()), 'The approved expired discount row is not available.');
    await expiredSpecials.updateApprovedDiscount();
  });
  test('@expired-specials @e2e @regression @mutation Execute is available for an approved expired discount', async ({ expiredSpecials }) => {
    test.skip(!hasExpiredSpecialsMutationData(), 'Execute requires explicit mutation enablement and an approved test order.');
    await expiredSpecials.gotoDiscounts();
    test.skip(!(await expiredSpecials.hasApprovedDiscountRow()), 'The approved expired discount row is not available.');
    await expiredSpecials.executeApprovedDiscount();
  });
  test('@expired-specials @regression @search Expired Special Discounts exposes Customer, Must Ship By, and Approved End Date filters', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDiscounts();
    await expect(locators.customerSearch(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.mustShipBySearch(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.approvedEndSearch(expiredSpecials.currentPage)).toBeVisible();
  });
  test('@expired-specials @regression @functional Expired Special Discounts exposes documented date columns when populated', async ({ expiredSpecials }) => {
    test.skip(!(await expiredSpecials.hasDiscountRows()), 'The environment exposes no expired discount rows.');
    await expiredSpecials.expectDiscountGrid();
  });

  test('@expired-specials @smoke @functional Expired Specials Defer List route loads', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferList();
    await expiredSpecials.expectDeferLoaded();
  });
  test('@expired-specials @smoke @functional Expired Specials Defer List exposes core controls', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferList();
    await expiredSpecials.expectDeferCoreControls();
  });
  test('@expired-specials @regression @navigation Expired Specials Defer List stays on Stage', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferList();
    expect(new URL(expiredSpecials.currentPage.url()).hostname).toBe('stage.ashleynet.com');
  });
  test('@expired-specials @regression @search Expired Specials Defer List executes its search', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferList();
    await expiredSpecials.searchDiscounts();
  });
  test('@expired-specials @e2e @regression @functional Expired Specials Defer List exposes its result grid', async ({ expiredSpecials }) => {
    test.skip(!(await expiredSpecials.hasDeferRows()), 'The environment exposes no defer-list rows.');
    await expiredSpecials.expectDeferGrid();
  });
  test('@expired-specials @e2e @regression @functional Expired Specials Defer List rows expose editable fields', async ({ expiredSpecials }) => {
    test.skip(!(await expiredSpecials.hasDeferRows()), 'The environment exposes no defer-list rows.');
    await expect(locators.deferEditableInputs(expiredSpecials.currentPage).first()).toBeEditable();
  });
  test('@expired-specials @e2e @regression @mutation Expired Specials Defer List Cancel discards an unsaved edit', async ({ expiredSpecials }) => {
    test.skip(!hasExpiredSpecialsMutationData(), 'Unsaved defer-list edit coverage requires explicit enablement.');
    test.skip(!(await expiredSpecials.hasDeferRows()), 'The environment exposes no defer-list rows.');
    await expiredSpecials.cancelFirstDeferEdit();
  });
  test('@expired-specials @e2e @regression @navigation Expired Specials Defer List opens Add New', async ({ expiredSpecials }) => {
    const target = await expiredSpecials.openDeferListNew();
    await expiredSpecials.expectNewLoaded(target);
    await expiredSpecials.cancelNew(target);
  });
  test('@expired-specials @regression @functional Expired Specials Defer List exposes Environment and date filters', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferList();
    await expect(locators.environment(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.mustShipBySearch(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.approvedEndSearch(expiredSpecials.currentPage)).toBeVisible();
  });

  test('@expired-specials @smoke @functional Add New Expired Specials Defer List route loads', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expiredSpecials.expectNewLoaded();
  });
  test('@expired-specials @smoke @functional Add New Expired Specials Defer List exposes fields', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expiredSpecials.expectNewFields();
  });
  test('@expired-specials @regression @functional Add New Expired Specials Defer List exposes Save and Cancel actions', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expiredSpecials.expectNewActions();
  });
  test('@expired-specials @e2e @regression @navigation Add New Expired Specials Defer List supports non-persisting Cancel', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expiredSpecials.cancelNew();
  });
  test('@expired-specials @regression @functional Add New Expired Specials Defer List exposes Ship To and Order scope controls', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expect(locators.newShipTo(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.newOrder(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.newAllShipTo(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.newAllOrders(expiredSpecials.currentPage)).toBeVisible();
  });
  test('@expired-specials @regression @functional Add New Expired Specials Defer List exposes Special and Approved End Date fields', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expect(locators.newSpecial(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.newApprovedEnd(expiredSpecials.currentPage)).toBeVisible();
  });
  test('@expired-specials @regression @functional Add New Expired Specials Defer List exposes Save & Add and Save & Close', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expect(locators.newSaveAdd(expiredSpecials.currentPage)).toBeVisible();
    await expect(locators.newSaveClose(expiredSpecials.currentPage)).toBeVisible();
  });
  test('@expired-specials @regression @validation Add New Expired Specials Defer List rejects blank input when explicitly enabled', async ({ expiredSpecials }) => {
    test.skip(!isExpiredSpecialsBlankValidationEnabled(), 'Blank validation is disabled by default.');
    await expiredSpecials.gotoDeferListNew();
    await locators.newSaveClose(expiredSpecials.currentPage).click();
    await expect(locators.validationMessage(expiredSpecials.currentPage)).toBeVisible();
  });
  test('@expired-specials @regression @navigation Add New Expired Specials Defer List returns through Cancel', async ({ expiredSpecials }) => {
    await expiredSpecials.gotoDeferListNew();
    await expect(locators.newCancel(expiredSpecials.currentPage)).toBeVisible();
    await expiredSpecials.cancelNew();
  });
});