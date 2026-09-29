import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export interface SurchargeData {
  environment: string;
  readOnlyAdjustmentId: string;
  deleteAdjustmentId: string;
  testCreditCode: string;
  customer: string;
  shipTo: string;
  item: string;
  orderDate: string;
  price: string;
  quantity: string;
  approvedUploadFile: string;
}

export function getSurchargeData(): SurchargeData {
  return {
    environment: process.env.SURCHARGE_ENVIRONMENT?.trim() || 'AFI',
    readOnlyAdjustmentId: process.env.SURCHARGE_READ_ONLY_ADJUSTMENT_ID?.trim() || '0',
    deleteAdjustmentId: process.env.SURCHARGE_DELETE_ADJUSTMENT_ID?.trim() || '',
    testCreditCode: process.env.SURCHARGE_TEST_CREDIT_CODE?.trim() || '',
    customer: process.env.SURCHARGE_TEST_CUSTOMER?.trim() || '',
    shipTo: process.env.SURCHARGE_TEST_SHIP_TO?.trim() || '',
    item: process.env.SURCHARGE_TEST_ITEM?.trim() || '',
    orderDate: process.env.SURCHARGE_TEST_ORDER_DATE?.trim() || '',
    price: process.env.SURCHARGE_TEST_PRICE?.trim() || '',
    quantity: process.env.SURCHARGE_TEST_QUANTITY?.trim() || '',
    approvedUploadFile: process.env.SURCHARGE_APPROVED_UPLOAD_FILE?.trim() || '',
  };
}

export function isSurchargeCreateEnabled(): boolean {
  return process.env.SURCHARGE_CREATE_ENABLED?.trim().toLowerCase() === 'true' &&
    process.env.STAGE_BASE_URL?.trim().toLowerCase().includes('stage.ashleynet.com') !== false;
}

export function hasSurchargeCreateData(): boolean {
  const data = getSurchargeData();
  return isSurchargeCreateEnabled() && Boolean(data.testCreditCode) && data.testCreditCode !== '0';
}

export function isProtectedSurchargeHeader(adjustmentId: string): boolean {
  return ['0', '1'].includes(adjustmentId.trim());
}

export function isSurchargeDeleteEnabled(): boolean {
  return process.env.SURCHARGE_DELETE_ENABLED?.trim().toLowerCase() === 'true' &&
    process.env.STAGE_BASE_URL?.trim().toLowerCase().includes('stage.ashleynet.com') !== false;
}

export function hasSurchargeDeleteData(): boolean {
  const id = getSurchargeData().deleteAdjustmentId;
  return isSurchargeDeleteEnabled() && Boolean(id) && !isProtectedSurchargeHeader(id);
}

export function hasSurchargeCalculatorData(): boolean {
  const data = getSurchargeData();
  return Boolean(data.customer && data.item && data.price && data.orderDate);
}

export function hasSurchargeUploadData(): boolean {
  const file = getSurchargeData().approvedUploadFile;
  return hasSurchargeCreateData() && Boolean(file) && existsSync(resolve(process.cwd(), file));
}

export function isSurchargeUploadValidationEnabled(): boolean {
  return process.env.SURCHARGE_UPLOAD_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}

export function isSurchargeValidationEnabled(): boolean {
  return process.env.SURCHARGE_VALIDATION_ENABLED?.trim().toLowerCase() === 'true';
}

export function isSurchargeApiEnabled(): boolean {
  return process.env.SURCHARGE_API_TEST_ENABLED?.trim().toLowerCase() === 'true' &&
    (process.env.SURCHARGE_API_BASE_URL?.trim() || '').toLowerCase().includes('stage.');
}

export function hasSurchargeApiData(): boolean {
  const data = getSurchargeData();
  return isSurchargeApiEnabled() && Boolean(data.customer && data.item && data.price && data.orderDate);
}