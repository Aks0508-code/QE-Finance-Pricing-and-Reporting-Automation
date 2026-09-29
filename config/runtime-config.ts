export interface RuntimeConfig {
  baseURL: string;
  priceCodesPath: string;
  priceListPath: string;
  priceListUpdateQueuePath: string;
  buyerGroupsPath: string;
  buyerGroupPricingPath: string;
  buyerGroupInactivePath: string;
  buyerGroupDefaultsPath: string;
  rateValidationLimitsPath: string;
  roundingCodesPath: string;
  masterCodePath: string;
  codeXRefMasterPath: string;
  orderEntrySpecialsBaseURL: string;
  orderEntrySpecialsPath: string;
  specialsAddEditPath: string;
  specialsDetailPath: string;
  specialsItemAddEditPath: string;
  expiredSpecialDiscountRemovalPath: string;
  expiredSpecialsDeferListPath: string;
  expiredSpecialsDeferListNewPath: string;
  excludedItemsPath: string;
  excludedItemAddNewPath: string;
  priceExceptionsBaseURL: string;
  priceExceptionsPath: string;
  priceExceptionsEditPath: string;
  priceExceptionsChangeDatesPath: string;
  priceExceptionsInactivePath: string;
  priceExceptionsImportPath: string;
  surchargeBaseURL: string;
  globalAdjustmentHeaderPath: string;
  globalAdjustmentCalculatorPath: string;
  globalAdjustmentDetailPath: string;
  newAdjustmentHeaderPath: string;
  username?: string;
  password?: string;
  manualAuth: boolean;
  mutationEnabled: boolean;
  orderEntryMutationEnabled: boolean;
  ignoreHTTPSErrors: boolean;
}

function optional(value: string | undefined): string | undefined {
  return value?.trim() || undefined;
}

function asBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

const username = optional(process.env.STAGE_USERNAME);
const password = optional(process.env.STAGE_PASSWORD);

export const runtimeConfig: RuntimeConfig = {
  baseURL: process.env.STAGE_BASE_URL?.trim() || 'https://stage.ashleynet.com',
  priceCodesPath: '/PriceMaintenance_Net/PriceCodes.aspx',
  priceListPath: '/PriceMaintenance_Net/PriceList.aspx',
  priceListUpdateQueuePath: '/PriceMaintenance_Net/PriceList_UQ.aspx',
  buyerGroupsPath: '/PriceMaintenance_Net/BuyerGroups.aspx',
  buyerGroupPricingPath: '/PriceMaintenance_Net/BuyerGroupPricing.aspx',
  buyerGroupInactivePath: '/PriceMaintenance_Net/BuyerGroupsInActive.aspx',
  buyerGroupDefaultsPath: '/PriceMaintenance_Net/BuyerGroupDefaults.aspx',
  rateValidationLimitsPath: '/PriceMaintenance_Net/RateValidationLimits.aspx',
  roundingCodesPath: '/PriceMaintenance_Net/RoundingCodes.aspx',
  masterCodePath: '/PriceMaintenance_Net/MasterCode.aspx',
  codeXRefMasterPath: '/PriceMaintenance_Net/CodeXRefMaster.aspx',
  orderEntrySpecialsBaseURL: 'https://stage.ashleynet.com',
  orderEntrySpecialsPath: '/OrderEntrySpecials/Specials.aspx',
  specialsAddEditPath: '/OrderEntrySpecials/SpecialsAddEdit.aspx',
  specialsDetailPath: '/OrderEntrySpecials/SpecialsDetail.aspx',
  specialsItemAddEditPath: '/OrderEntrySpecials/SpecialsItemAddEdit.aspx',
  expiredSpecialDiscountRemovalPath: '/PriceMaintenance_Net/ExpiredSpecialDiscountRemoval.aspx',
  expiredSpecialsDeferListPath: '/PriceMaintenance_Net/ExpiredSpecialsDeferList.aspx',
  expiredSpecialsDeferListNewPath: '/PriceMaintenance_Net/ExpiredSpecialsDeferListNew.aspx',
  excludedItemsPath: '/OrderEntrySpecials/ExcludedItems.aspx',
  excludedItemAddNewPath: '/OrderEntrySpecials/ExcludedItemAddNew.aspx',
  priceExceptionsBaseURL: 'https://stage.ashleynet.com',
  priceExceptionsPath: '/CustomerMaintenance/PriceExceptions.aspx',
  priceExceptionsEditPath: '/CustomerMaintenance/PriceExceptionsEdit.aspx',
  priceExceptionsChangeDatesPath: '/CustomerMaintenance/PriceExceptionsChangeDates.aspx',
  priceExceptionsInactivePath: '/CustomerMaintenance/InActivePriceExceptions.aspx',
  priceExceptionsImportPath: '/CustomerMaintenance/ExcelImport.aspx',
  surchargeBaseURL: 'https://stage.ashleynet.com',
  globalAdjustmentHeaderPath: '/AdjustmentMaintenance/GlobalAdjustmentHeader',
  globalAdjustmentCalculatorPath: '/AdjustmentMaintenance/AdjustmentCalculator',
  globalAdjustmentDetailPath: '/AdjustmentMaintenance/GlobalAdjustmentdetail.aspx',
  newAdjustmentHeaderPath: '/AdjustmentMaintenance/NewAdjustmentHeader',
  manualAuth: asBoolean(process.env.STAGE_MANUAL_AUTH),
  mutationEnabled: asBoolean(process.env.PRICE_CODE_MUTATION_ENABLED),
  orderEntryMutationEnabled: asBoolean(process.env.ORDER_ENTRY_SPECIALS_MUTATION_ENABLED),
  ignoreHTTPSErrors: asBoolean(process.env.IGNORE_HTTPS_ERRORS),
  ...(username ? { username } : {}),
  ...(password ? { password } : {}),
};

export function hasRuntimeCredentials(): boolean {
  return Boolean(runtimeConfig.username && runtimeConfig.password);
}