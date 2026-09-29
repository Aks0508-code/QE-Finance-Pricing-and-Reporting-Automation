export function getCodeXRefMasterBaseCode(): string {
  return process.env.CODE_XREF_MASTER_TEST_BASE_CODE?.trim() || '';
}

export function hasCodeXRefMasterBaseCode(): boolean {
  return Boolean(getCodeXRefMasterBaseCode());
}

export function isCodeXRefMasterAddNewValidationEnabled(): boolean {
  return process.env.CODE_XREF_MASTER_ADD_NEW_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}