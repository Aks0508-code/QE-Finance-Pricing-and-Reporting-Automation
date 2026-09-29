import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface PriceCodeMutationData {
  code: string;
  description: string;
  currency: string;
  categoryCode: string;
  includeVat: boolean;
  vatOption: string;
  environment: string;
  basePrice: string;
}

export interface PriceCodeExistingUpdateData {
  code: string;
  categoryCode: string;
  vatOption: string;
  basePrice: string;
}

export interface PriceCodeSearchData {
  item: string;
  categoryCode: string;
  categoryCodes: string[];
}

export interface PriceCodeInvalidData {
  code: string;
  description: string;
}

export interface PriceCodeArchiveCodes {
  archive: string;
  cancel: string;
  continue: string;
}

const names = [
  'PRICE_CODE_TEST_CODE',
  'PRICE_CODE_TEST_DESCRIPTION',
  'PRICE_CODE_TEST_CURRENCY',
  'PRICE_CODE_TEST_CATEGORY',
  'PRICE_CODE_TEST_INCLUDE_VAT',
  'PRICE_CODE_TEST_VAT_OPTION',
  'PRICE_CODE_TEST_ENVIRONMENT',
  'PRICE_CODE_TEST_BASE_PRICE',
] as const;

const requiredMutationNames = names.filter(
  (name) => name !== 'PRICE_CODE_TEST_CODE' && name !== 'PRICE_CODE_TEST_DESCRIPTION',
);

function generatedTestIdentity(): string {
  // AshleyNET stores Price Codes in a six-character field. Keep the generated
  // value at that length so the UI does not silently truncate the code.
  return `Z${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

export function hasPriceCodeMutationData(): boolean {
  return requiredMutationNames.every((name) => Boolean(process.env[name]?.trim()));
}

export function hasPriceCodeDescriptionMutationData(): boolean {
  return hasPriceCodeExistingMutationData();
}

export function hasPriceCodeExistingMutationData(): boolean {
  return hasPriceCodeExistingUpdateData();
}

export function hasPriceCodeCategoryData(): boolean {
  return Boolean(process.env.PRICE_CODE_TEST_CATEGORY?.trim());
}

export function hasPriceCodeItemData(): boolean {
  const files = getConfiguredItemFilePaths();
  return Boolean(
    process.env.PRICE_CODE_TEST_ITEM?.trim() ||
      process.env.PRICE_CODE_TEST_ITEMS?.trim() ||
      files.some((file) => existsSync(resolve(process.cwd(), file))),
  );
}

function randomValue(values: string[], description: string): string {
  if (values.length === 0) throw new Error(`No valid ${description} values were supplied.`);
  return values[Math.floor(Math.random() * values.length)]!;
}

function getConfiguredItemFilePaths(): string[] {
  const configured = (process.env.PRICE_CODE_TEST_ITEMS_FILES || process.env.PRICE_CODE_TEST_ITEMS_FILE || '')
    .split(';')
    .map((file) => file.trim())
    .filter(Boolean);
  if (configured.length > 0) return configured;

  const sharedDirectory = resolve(process.cwd(), '../test-data/shared/item-pricing');
  if (!existsSync(sharedDirectory)) return [];
  return readdirSync(sharedDirectory)
    .filter((file) => /\.csv$/i.test(file))
    .map((file) => resolve(sharedDirectory, file));
}

function getConfiguredItemIds(): string[] {
  const files = getConfiguredItemFilePaths();
  if (files.length > 0) {
    const file = randomValue(files, 'item CSV file');
    const path = resolve(process.cwd(), file);
    if (!existsSync(path)) throw new Error(`Item CSV file was not found: ${file}`);
    return readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .slice(1)
      .map((line) => line.split(',')[0]?.trim().replace(/^"|"$/g, '') ?? '')
      .filter((item) => /^[A-Za-z0-9-]+$/.test(item));
  }

  const configured = process.env.PRICE_CODE_TEST_ITEMS?.trim();
  if (configured) {
    return configured.split(',').map((item) => item.trim()).filter((item) => /^[A-Za-z0-9-]+$/.test(item));
  }

  const item = process.env.PRICE_CODE_TEST_ITEM?.trim();
  return item ? [item] : [];
}

export function getPriceCodeItemData(): string {
  return randomValue(getConfiguredItemIds(), 'item');
}

export function hasPriceCodeSearchData(): boolean {
  return hasPriceCodeItemData() && Boolean(process.env.PRICE_CODE_TEST_CATEGORY?.trim() || process.env.PRICE_CODE_TEST_CATEGORIES?.trim());
}

export function getPriceCodeSearchAttempts(): number {
  const configured = Number.parseInt(process.env.PRICE_CODE_TEST_SEARCH_ATTEMPTS || '5', 10);
  return Number.isInteger(configured) && configured > 0 ? Math.min(configured, 20) : 5;
}

export function getPriceCodeSearchData(): PriceCodeSearchData {
  const categories = (process.env.PRICE_CODE_TEST_CATEGORIES || process.env.PRICE_CODE_TEST_CATEGORY || '')
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);

  return {
    item: getPriceCodeItemData(),
    categoryCode: randomValue(categories, 'category code'),
    categoryCodes: categories,
  };
}

export function getPriceCodeCategoryData(): string {
  return requiredRuntime('PRICE_CODE_TEST_CATEGORY');
}

export function getPriceCodeExistingCode(): string {
  return requiredRuntime('PRICE_CODE_TEST_CODE');
}

export function getPriceCodeInvalidData(): PriceCodeInvalidData {
  return {
    code: requiredRuntime('PRICE_CODE_TEST_INVALID_CODE'),
    description: process.env.PRICE_CODE_TEST_INVALID_DESCRIPTION?.trim() || '',
  };
}

export function hasPriceCodeInvalidData(): boolean {
  return Boolean(process.env.PRICE_CODE_TEST_INVALID_CODE?.trim());
}

export function getPriceCodeDuplicateCode(): string {
  return process.env.PRICE_CODE_TEST_DUPLICATE_CODE?.trim() || process.env.PRICE_CODE_TEST_CODE?.trim() || '';
}

export function hasPriceCodeDuplicateData(): boolean {
  const duplicateCode = process.env.PRICE_CODE_TEST_DUPLICATE_CODE?.trim() || process.env.PRICE_CODE_TEST_CODE?.trim() || '';
  return Boolean(
    duplicateCode && !duplicateCode.includes('*') &&
    process.env.PRICE_CODE_TEST_DUPLICATE_EXPECTATION?.trim(),
  );
}

export function getPriceCodeDuplicateExpectation(): 'reject' | 'warning' {
  const value = requiredRuntime('PRICE_CODE_TEST_DUPLICATE_EXPECTATION').toLowerCase();
  if (value !== 'reject' && value !== 'warning') {
    throw new Error('PRICE_CODE_TEST_DUPLICATE_EXPECTATION must be reject or warning.');
  }
  return value;
}

export function getPriceCodeEffectiveDate(): string {
  return requiredRuntime('PRICE_CODE_TEST_EFFECTIVE_DATE');
}

function configuredArchiveCode(primaryName: string, legacyName: string): string {
  return process.env[primaryName]?.trim() || process.env[legacyName]?.trim() || '';
}

export function getPriceCodeArchiveCodes(): PriceCodeArchiveCodes {
  return {
    archive: configuredArchiveCode('PRICE_CODE_TEST_ARCHIVE_CODE', 'PRICE_CODE_TEST_ARCHIVE'),
    cancel: configuredArchiveCode('PRICE_CODE_TEST_ARCHIVE_CANCEL_CODE', 'PRICE_CODE_TEST_ARCHIVE_CANCEL'),
    continue: configuredArchiveCode('PRICE_CODE_TEST_ARCHIVE_CONTINUE_CODE', 'PRICE_CODE_TEST_ARCHIVE_CONTINUE'),
  };
}

export function hasPriceCodeArchiveData(): boolean {
  const codes = getPriceCodeArchiveCodes();
  return [codes.archive, codes.cancel, codes.continue].every((code) => Boolean(code) && !code.includes('*'));
}

function requiredRuntime(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required runtime test-data variable: ${name}`);
  return value;
}

function required(name: (typeof names)[number]): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required runtime test-data variable: ${name}`);
  return value;
}

export function getPriceCodeMutationData(): PriceCodeMutationData {
  const identity = process.env.PRICE_CODE_TEST_CODE?.trim() || '';
  return {
    code: identity,
    description: process.env.PRICE_CODE_TEST_DESCRIPTION?.trim() || 'AUTOMATION DESCRIPTION',
    currency: required('PRICE_CODE_TEST_CURRENCY'),
    categoryCode: required('PRICE_CODE_TEST_CATEGORY'),
    includeVat: required('PRICE_CODE_TEST_INCLUDE_VAT').toLowerCase() === 'true',
    vatOption: required('PRICE_CODE_TEST_VAT_OPTION'),
    environment: required('PRICE_CODE_TEST_ENVIRONMENT'),
    basePrice: required('PRICE_CODE_TEST_BASE_PRICE'),
  };
}

export function hasPriceCodeExistingUpdateData(): boolean {
  const code = process.env.PRICE_CODE_TEST_CODE?.trim() || '';
  return Boolean(
    code && !code.includes('*') &&
    process.env.PRICE_CODE_TEST_CATEGORY?.trim() &&
      process.env.PRICE_CODE_TEST_VAT_OPTION?.trim() &&
      /^(true|false)$/i.test(process.env.PRICE_CODE_TEST_BASE_PRICE?.trim() || ''),
  );
}

export function getPriceCodeExistingUpdateData(): PriceCodeExistingUpdateData {
  return {
    code: process.env.PRICE_CODE_TEST_CODE?.trim() || '',
    categoryCode: requiredRuntime('PRICE_CODE_TEST_CATEGORY'),
    vatOption: requiredRuntime('PRICE_CODE_TEST_VAT_OPTION'),
    basePrice: requiredRuntime('PRICE_CODE_TEST_BASE_PRICE'),
  };
}

export function getPriceCodeCreateData(): PriceCodeMutationData {
  const identity = process.env.PRICE_CODE_TEST_CREATE_CODE?.trim() || generatedTestIdentity();
  const protectedCodes = [
    process.env.PRICE_CODE_TEST_CODE?.trim(),
    process.env.PRICE_CODE_TEST_DUPLICATE_CODE?.trim(),
  ].filter(Boolean);
  if (protectedCodes.includes(identity)) {
    throw new Error(`PRICE_CODE_TEST_CREATE_CODE must be different from the existing/duplicate Price Code: ${identity}`);
  }
  return {
    code: identity,
    description: process.env.PRICE_CODE_TEST_CREATE_DESCRIPTION?.trim() || `${identity} DESCRIPTION`,
    currency: required('PRICE_CODE_TEST_CURRENCY'),
    categoryCode: required('PRICE_CODE_TEST_CATEGORY'),
    includeVat: required('PRICE_CODE_TEST_INCLUDE_VAT').toLowerCase() === 'true',
    vatOption: required('PRICE_CODE_TEST_VAT_OPTION'),
    environment: required('PRICE_CODE_TEST_ENVIRONMENT'),
    basePrice: required('PRICE_CODE_TEST_BASE_PRICE'),
  };
}
