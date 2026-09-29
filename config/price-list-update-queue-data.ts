export interface PriceListUpdateQueueData {
  environment: string;
  currency: string;
  priceCode: string;
  basePrice: string;
}

export function hasPriceListUpdateQueueData(): boolean {
  return Boolean(process.env.PRICE_LIST_UQ_PRICE_CODE?.trim());
}

export function getPriceListUpdateQueueData(): PriceListUpdateQueueData {
  const priceCode = process.env.PRICE_LIST_UQ_PRICE_CODE?.trim();
  if (!priceCode) throw new Error('PRICE_LIST_UQ_PRICE_CODE is required for Update Queue tests.');

  return {
    environment: process.env.PRICE_LIST_UQ_ENVIRONMENT?.trim() || 'AFI',
    currency: process.env.PRICE_LIST_UQ_CURRENCY?.trim() || 'USD',
    priceCode,
    basePrice: process.env.PRICE_LIST_UQ_BASE_PRICE?.trim() || '',
  };
}

export function hasPriceListUpdateQueueMutationData(): boolean {
  return process.env.PRICE_LIST_UQ_MUTATION_ENABLED === 'true' &&
    Boolean(process.env.PRICE_LIST_UQ_ORIGINAL_PRICE?.trim()) &&
    Boolean(process.env.PRICE_LIST_UQ_TEST_PRICE?.trim());
}

export function getPriceListUpdateQueueMutationData(): { originalPrice: string; testPrice: string } {
  const originalPrice = process.env.PRICE_LIST_UQ_ORIGINAL_PRICE?.trim();
  const testPrice = process.env.PRICE_LIST_UQ_TEST_PRICE?.trim();
  if (!originalPrice || !testPrice) {
    throw new Error('PRICE_LIST_UQ_ORIGINAL_PRICE and PRICE_LIST_UQ_TEST_PRICE are required for mutation tests.');
  }
  return { originalPrice, testPrice };
}