export type CalculationType = 'PERCENT' | 'DOLLAR';
export type SurchargeStatus = '0' | '1' | '2';

export interface SurchargeItemRequest {
  item_id: string;
  quantity?: number | null;
  price: number;
}

export interface SurchargeOrderRequest {
  order_id?: string;
  customer_id: string;
  ship_to: string;
  order_date: string;
  est_ship_date?: string;
  invoice_date?: string;
  warehouse_id?: string;
  items: SurchargeItemRequest[];
}

export interface SurchargeRequest {
  orders: SurchargeOrderRequest[];
}

export interface SurchargeAdjustmentDetail {
  credit_code: string;
  adjustment_name: string;
  adjustment_amount: number;
  invoice_level: '1' | '2';
  taxable: 'Y' | 'N';
  commissionable: 'B' | 'I' | 'N';
  quantity: number;
  calculation_value: number;
  calculation_type: string;
  applied_level: string;
  applied_level_value: string;
  charge: boolean;
}

export interface SurchargeAdjustment {
  item_id: string;
  quantity: number;
  price: number;
  status: SurchargeStatus;
  adjustment_details: SurchargeAdjustmentDetail[];
}

export interface SurchargeOrderResponse {
  order_id: string;
  customer_id: string;
  ship_to: string;
  total_surcharge: number;
  adjustments: SurchargeAdjustment[];
}

export interface SurchargeResponse {
  orders: SurchargeOrderResponse[];
}

export function effectiveQuantity(quantity: number | null | undefined): number {
  return quantity ?? 1;
}

export function isIso8601Date(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})(T.*)?$/.exec(value);
  if (!match) return false;
  const calendarDate = new Date(`${match[1]}-${match[2]}-${match[3]}T00:00:00Z`);
  if (calendarDate.getUTCFullYear() !== Number(match[1]) ||
    calendarDate.getUTCMonth() + 1 !== Number(match[2]) ||
    calendarDate.getUTCDate() !== Number(match[3])) return false;
  return !Number.isNaN(Date.parse(value));
}

export function isDateWithinInclusiveRange(value: string, from: string, to: string): boolean {
  if (!isIso8601Date(value) || !isIso8601Date(from) || !isIso8601Date(to)) return false;
  const valueTime = Date.parse(value);
  return valueTime >= Date.parse(from) && valueTime <= Date.parse(to);
}

export function isOutsideTimeFence(value: string, today: string, fenceDays: number): boolean {
  if (!isIso8601Date(value) || !isIso8601Date(today) || !Number.isInteger(fenceDays) || fenceDays < 0) return false;
  const firstAllowed = new Date(`${today.slice(0, 10)}T00:00:00Z`);
  firstAllowed.setUTCDate(firstAllowed.getUTCDate() + fenceDays);
  return Date.parse(value) > firstAllowed.getTime();
}

export function validateSurchargeRequest(request: unknown): string[] {
  if (!request || typeof request !== 'object' || !Array.isArray((request as { orders?: unknown }).orders)) {
    return ['orders must be an array'];
  }

  const errors: string[] = [];
  for (const [orderIndex, order] of (request as { orders: unknown[] }).orders.entries()) {
    if (!order || typeof order !== 'object') {
      errors.push(`orders[${orderIndex}] must be an object`);
      continue;
    }
    const candidate = order as Partial<SurchargeOrderRequest>;
    if (!candidate.customer_id) errors.push(`orders[${orderIndex}].customer_id is required`);
    if (!('ship_to' in candidate)) errors.push(`orders[${orderIndex}].ship_to is required`);
    if (!candidate.order_date || !isIso8601Date(candidate.order_date)) {
      errors.push(`orders[${orderIndex}].order_date must be ISO 8601`);
    }
    if (!Array.isArray(candidate.items) || candidate.items.length === 0) {
      errors.push(`orders[${orderIndex}].items must contain at least one item`);
      continue;
    }
    for (const [itemIndex, item] of candidate.items.entries()) {
      if (!item || typeof item !== 'object') {
        errors.push(`orders[${orderIndex}].items[${itemIndex}] must be an object`);
        continue;
      }
      const candidateItem = item as Partial<SurchargeItemRequest>;
      if (!candidateItem.item_id) errors.push(`orders[${orderIndex}].items[${itemIndex}].item_id is required`);
      if (typeof candidateItem.price !== 'number' || !Number.isFinite(candidateItem.price) || candidateItem.price < 0) {
        errors.push(`orders[${orderIndex}].items[${itemIndex}].price must be a non-negative number`);
      }
      if (candidateItem.quantity !== undefined && candidateItem.quantity !== null &&
        (typeof candidateItem.quantity !== 'number' || !Number.isFinite(candidateItem.quantity) || candidateItem.quantity < 0)) {
        errors.push(`orders[${orderIndex}].items[${itemIndex}].quantity must be a non-negative number`);
      }
    }
  }
  return errors;
}

export function calculateRoundedAdjustment(
  price: number,
  quantity: number,
  calculationType: CalculationType,
  calculationValue: number,
): number {
  if (quantity === 0) return 0;
  const unitValue = price / quantity;
  const surchargeEach = calculationType === 'PERCENT'
    ? unitValue * calculationValue * 0.01
    : unitValue * calculationValue;
  return Math.ceil(surchargeEach) * quantity;
}

export function validateSurchargeResponse(response: unknown, request: SurchargeRequest): string[] {
  if (!response || typeof response !== 'object' || !Array.isArray((response as { orders?: unknown }).orders)) {
    return ['orders must be an array'];
  }
  const result = response as SurchargeResponse;
  const errors: string[] = [];
  if (result.orders.length !== request.orders.length) errors.push('response order count does not match request');

  for (const [orderIndex, order] of result.orders.entries()) {
    const requestedOrder = request.orders[orderIndex];
    if (!requestedOrder) continue;
    if (order.order_id !== (requestedOrder.order_id || '')) errors.push(`orders[${orderIndex}].order_id was not echoed`);
    if (order.customer_id !== requestedOrder.customer_id) errors.push(`orders[${orderIndex}].customer_id was not echoed`);
    if (order.ship_to !== requestedOrder.ship_to) errors.push(`orders[${orderIndex}].ship_to was not echoed`);
    if (typeof order.total_surcharge !== 'number' || !Number.isFinite(order.total_surcharge)) errors.push(`orders[${orderIndex}].total_surcharge must be numeric`);
    if (!Array.isArray(order.adjustments)) {
      errors.push(`orders[${orderIndex}].adjustments must be an array`);
      continue;
    }
    for (const [itemIndex, adjustment] of order.adjustments.entries()) {
      const requestedItem = requestedOrder.items[itemIndex];
      if (!requestedItem) continue;
      if (adjustment.item_id !== requestedItem.item_id) errors.push(`adjustments[${itemIndex}].item_id was not echoed`);
      if (adjustment.quantity !== effectiveQuantity(requestedItem.quantity)) errors.push(`adjustments[${itemIndex}].quantity default is incorrect`);
      if (adjustment.price !== requestedItem.price) errors.push(`adjustments[${itemIndex}].price was not echoed`);
      if (!['0', '1', '2'].includes(adjustment.status)) errors.push(`adjustments[${itemIndex}].status is invalid`);
      if (!Array.isArray(adjustment.adjustment_details)) errors.push(`adjustments[${itemIndex}].adjustment_details must be an array`);
      if ((adjustment.status === '0' || adjustment.status === '1') && adjustment.adjustment_details.length > 0) {
        errors.push(`adjustments[${itemIndex}] status ${adjustment.status} must not return details`);
      }
      for (const [detailIndex, detail] of adjustment.adjustment_details.entries()) {
        if (!detail.credit_code || !detail.adjustment_name) errors.push(`detail ${itemIndex}/${detailIndex} must identify the adjustment`);
        if (typeof detail.adjustment_amount !== 'number') errors.push(`detail ${itemIndex}/${detailIndex} amount must be numeric`);
        if (!['1', '2'].includes(detail.invoice_level)) errors.push(`detail ${itemIndex}/${detailIndex} invoice level is invalid`);
        if (!['Y', 'N'].includes(detail.taxable)) errors.push(`detail ${itemIndex}/${detailIndex} taxable flag is invalid`);
        if (!['B', 'I', 'N'].includes(detail.commissionable)) errors.push(`detail ${itemIndex}/${detailIndex} commissionable flag is invalid`);
        if (typeof detail.charge !== 'boolean') errors.push(`detail ${itemIndex}/${detailIndex} charge must be boolean`);
      }
    }
  }
  return errors;
}