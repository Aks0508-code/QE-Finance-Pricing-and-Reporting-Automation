export interface OrderEntrySpecialsData {
  environment: string;
  specialCode: string;
}

export function getOrderEntrySpecialsData(): OrderEntrySpecialsData {
  return {
    environment: process.env.ORDER_ENTRY_SPECIALS_ENVIRONMENT?.trim() || 'AFI',
    specialCode: process.env.ORDER_ENTRY_SPECIALS_TEST_CODE?.trim() || '01',
  };
}

export function isOrderEntrySpecialsMutationEnabled(): boolean {
  return process.env.ORDER_ENTRY_SPECIALS_MUTATION_ENABLED?.trim().toLowerCase() === 'true';
}

export function isOrderEntrySpecialsBlankValidationEnabled(): boolean {
  return process.env.ORDER_ENTRY_SPECIALS_BLANK_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}