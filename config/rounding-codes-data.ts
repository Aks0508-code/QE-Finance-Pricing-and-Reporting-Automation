export interface RoundingCodesData {
  createCode: string;
  createDescription: string;
  deleteCode: string;
  updatedDescription: string;
}

const protectedCodes = new Set(['0', '*', 'FOBARC']);

export function getRoundingCodesData(): RoundingCodesData {
  return {
    createCode: process.env.ROUNDING_CODES_TEST_CREATE_CODE?.trim() || '',
    createDescription: process.env.ROUNDING_CODES_TEST_CREATE_DESCRIPTION?.trim() || '',
    deleteCode: process.env.ROUNDING_CODES_TEST_DELETE_CODE?.trim() || '',
    updatedDescription: process.env.ROUNDING_CODES_TEST_UPDATED_DESCRIPTION?.trim() || 'AUTOMATION_ONLY',
  };
}

export function isProtectedRoundingCode(code: string): boolean {
  return protectedCodes.has(code.trim().toUpperCase()) || code.includes('*');
}

export function isRoundingCodesMutationEnabled(): boolean {
  return process.env.ROUNDING_CODES_MUTATION_ENABLED?.trim().toLowerCase() === 'true' &&
    (process.env.STAGE_BASE_URL?.trim().toLowerCase() || 'https://stage.ashleynet.com').includes('stage.ashleynet.com');
}

export function hasRoundingCodesCreateData(): boolean {
  const data = getRoundingCodesData();
  return isRoundingCodesMutationEnabled() && Boolean(data.createCode && data.createDescription) && !isProtectedRoundingCode(data.createCode);
}

export function hasRoundingCodesDeleteData(): boolean {
  const data = getRoundingCodesData();
  return isRoundingCodesMutationEnabled() && Boolean(data.deleteCode) && !isProtectedRoundingCode(data.deleteCode);
}

export function isRoundingCodesValidationEnabled(): boolean {
  return process.env.ROUNDING_CODES_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}