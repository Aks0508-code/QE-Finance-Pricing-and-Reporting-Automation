import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface PriceExceptionsData {
  environment: string;
  item: string;
  uploadFile: string;
}

export function getPriceExceptionsData(): PriceExceptionsData {
  return {
    environment: process.env.PRICE_EXCEPTIONS_ENVIRONMENT?.trim() || 'AFI',
    item: process.env.PRICE_EXCEPTIONS_TEST_ITEM?.trim() || '',
    uploadFile: process.env.PRICE_EXCEPTIONS_UPLOAD_FILE?.trim() || '',
  };
}

export function hasPriceExceptionsItemData(): boolean {
  const item = getPriceExceptionsData().item.toUpperCase();
  return Boolean(item) && !item.includes('*') && item !== 'FOBARC';
}

export function hasPriceExceptionsMutationData(): boolean {
  return process.env.PRICE_EXCEPTIONS_MUTATION_ENABLED?.trim().toLowerCase() === 'true' && hasPriceExceptionsItemData();
}

export function hasPriceExceptionsUploadData(): boolean {
  const { uploadFile } = getPriceExceptionsData();
  return hasPriceExceptionsMutationData() && Boolean(uploadFile) && existsSync(resolve(process.cwd(), uploadFile));
}

export function isPriceExceptionsBlankValidationEnabled(): boolean {
  return process.env.PRICE_EXCEPTIONS_BLANK_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}