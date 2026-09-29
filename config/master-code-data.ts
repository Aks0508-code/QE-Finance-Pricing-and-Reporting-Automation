export interface MasterCodeSearchData {
  pageName: string;
  type: string;
}

export function getMasterCodeSearchData(): MasterCodeSearchData {
  return {
    pageName: process.env.MASTER_CODE_TEST_PAGE_NAME?.trim() || '',
    type: process.env.MASTER_CODE_TEST_TYPE?.trim() || '',
  };
}

export function hasMasterCodeSearchData(): boolean {
  const data = getMasterCodeSearchData();
  return Boolean(data.pageName || data.type);
}

export function isMasterCodeAddNewValidationEnabled(): boolean {
  return process.env.MASTER_CODE_ADD_NEW_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}