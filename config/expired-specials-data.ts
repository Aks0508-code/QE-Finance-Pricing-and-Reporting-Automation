export interface ExpiredSpecialsData {
  environment: string;
  testOrder: string;
}

export function getExpiredSpecialsData(): ExpiredSpecialsData {
  return {
    environment: process.env.EXPIRED_SPECIALS_ENVIRONMENT?.trim() || 'AFI',
    testOrder: process.env.EXPIRED_SPECIALS_TEST_ORDER?.trim() || '',
  };
}

export function hasExpiredSpecialsMutationData(): boolean {
  return process.env.EXPIRED_SPECIALS_MUTATION_ENABLED?.trim().toLowerCase() === 'true' && Boolean(getExpiredSpecialsData().testOrder);
}

export function isExpiredSpecialsBlankValidationEnabled(): boolean {
  return process.env.EXPIRED_SPECIALS_BLANK_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}