import { expect, test } from '@playwright/test';
import {
  calculateRoundedAdjustment,
  effectiveQuantity,
  isIso8601Date,
  type SurchargeRequest,
  type SurchargeResponse,
  validateSurchargeRequest,
  validateSurchargeResponse,
} from '../../config/surcharge-contract';

const validRequest: SurchargeRequest = {
  orders: [{
    order_id: 'ORD-AUTOMATION',
    customer_id: 'CUSTOMER-AUTOMATION',
    ship_to: '',
    order_date: '2026-01-15',
    items: [{ item_id: 'ITEM-AUTOMATION', quantity: 10, price: 442.5 }],
  }],
};

function responseFor(request: SurchargeRequest, status: '0' | '1' | '2' = '1'): SurchargeResponse {
  return {
    orders: request.orders.map(order => ({
      order_id: order.order_id || '',
      customer_id: order.customer_id,
      ship_to: order.ship_to,
      total_surcharge: status === '2' ? 30 : 0,
      adjustments: order.items.map(item => ({
        item_id: item.item_id,
        quantity: effectiveQuantity(item.quantity),
        price: item.price,
        status,
        adjustment_details: status === '2' ? [{
          credit_code: 'TSC',
          adjustment_name: 'TSC TEST SURCHARGE',
          adjustment_amount: 30,
          invoice_level: '1',
          taxable: 'N',
          commissionable: 'N',
          quantity: effectiveQuantity(item.quantity),
          calculation_value: 6,
          calculation_type: 'PERCENT',
          applied_level: 'ITEMCLASS',
          applied_level_value: 'CLASS-A',
          charge: true,
        }] : [],
      })),
    })),
  };
}

test.describe('Surcharge microservice request contract', () => {
  const baseOrder = validRequest.orders[0]!;
  const { order_id: _omittedOrderId, ...requestWithoutOrderId } = baseOrder;
  const { ship_to: _omittedShipTo, ...requestWithoutShipTo } = baseOrder;

  const validCases: Array<[string, SurchargeRequest]> = [
    ['accepts an order with a blank ship-to for bill-to processing', validRequest],
    ['accepts an order with an omitted order id', { orders: [requestWithoutOrderId] }],
    ['accepts optional estimated ship and invoice dates', { orders: [{ ...baseOrder, est_ship_date: '2026-01-18T10:00:00Z', invoice_date: '2026-01-20T10:00:00Z' }] }],
    ['accepts an optional warehouse id', { orders: [{ ...baseOrder, warehouse_id: '005' }] }],
    ['accepts more than one item on an order', { orders: [{ ...baseOrder, items: [...baseOrder.items, { item_id: 'ITEM-B', quantity: 2, price: 49.99 }] }] }],
  ];

  for (const [title, request] of validCases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(validateSurchargeRequest(request)).toEqual([]));
  }

  const invalidCases: Array<[string, unknown, string]> = [
    ['rejects a missing orders array', {}, 'orders must be an array'],
    ['rejects a missing customer', { orders: [{ ...validRequest.orders[0], customer_id: '' }] }, 'customer_id is required'],
    ['rejects a missing ship-to property', { orders: [requestWithoutShipTo] }, 'ship_to is required'],
    ['rejects a missing order date', { orders: [{ ...validRequest.orders[0], order_date: '' }] }, 'order_date must be ISO 8601'],
    ['rejects an empty item list', { orders: [{ ...validRequest.orders[0], items: [] }] }, 'items must contain at least one item'],
    ['rejects a missing item id', { orders: [{ ...validRequest.orders[0], items: [{ item_id: '', price: 1 }] }] }, 'item_id is required'],
    ['rejects a negative price', { orders: [{ ...validRequest.orders[0], items: [{ item_id: 'ITEM', price: -1 }] }] }, 'price must be a non-negative number'],
    ['rejects a negative quantity', { orders: [{ ...validRequest.orders[0], items: [{ item_id: 'ITEM', quantity: -1, price: 1 }] }] }, 'quantity must be a non-negative number'],
  ];

  for (const [title, request, expected] of invalidCases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(validateSurchargeRequest(request).some(error => error.includes(expected))).toBe(true));
  }
});

test.describe('Surcharge microservice date and quantity rules', () => {
  const dateCases: Array<[string, string, boolean]> = [
    ['accepts an ISO date-only value', '2026-01-15', true],
    ['accepts an ISO UTC timestamp', '2026-01-15T10:30:00Z', true],
    ['accepts an ISO timestamp with an offset', '2026-01-15T10:30:00-05:00', true],
    ['rejects a display-format date', '15/01/2026', false],
    ['rejects a month-first non-ISO date', '01-15-2026', false],
    ['rejects an impossible calendar date', '2026-02-30', false],
  ];

  for (const [title, value, expected] of dateCases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(isIso8601Date(value)).toBe(expected));
  }

  const quantityCases: Array<[string, number | null | undefined, number]> = [
    ['defaults an omitted quantity to one', undefined, 1],
    ['defaults a null quantity to one', null, 1],
    ['preserves an explicit quantity of one', 1, 1],
    ['preserves an extended quantity', 10, 10],
    ['preserves a zero quantity for boundary validation', 0, 0],
  ];

  for (const [title, value, expected] of quantityCases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(effectiveQuantity(value)).toBe(expected));
  }
});

test.describe('Surcharge microservice calculation rules', () => {
  const calculationCases: Array<[string, number, number, 'PERCENT' | 'DOLLAR', number, number]> = [
    ['extends a six percent surcharge after rounding each unit', 442.5, 10, 'PERCENT', 6, 30],
    ['calculates a one-unit percentage adjustment', 29.99, 1, 'PERCENT', 5, 2],
    ['calculates a two-unit percentage adjustment from extended price', 99.98, 2, 'PERCENT', 5, 6],
    ['returns zero for a zero quantity boundary', 25.75, 0, 'PERCENT', 5, 0],
    ['calculates a dollar adjustment using the unit value', 100, 2, 'DOLLAR', 1, 100],
    ['rounds a fractional percentage surcharge upward', 11.99, 1, 'PERCENT', 5, 1],
    ['extends a rounded surcharge across three units', 59.97, 3, 'PERCENT', 5, 3],
    ['returns zero when the base price is zero', 0, 1, 'PERCENT', 5, 0],
  ];

  for (const [title, price, quantity, type, value, expected] of calculationCases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(calculateRoundedAdjustment(price, quantity, type, value)).toBe(expected));
  }
});

test.describe('Surcharge microservice response contract', () => {
  for (const status of ['0', '1', '2'] as const) {
    test(`@surcharge @regression @contract accepts documented status ${status}`, () => {
      const response = responseFor(validRequest, status);
      expect(validateSurchargeResponse(response, validRequest)).toEqual([]);
    });
  }

  test('@surcharge @regression @contract status 0 represents API off and has no details', () => {
    const response = responseFor(validRequest, '0');
    expect(response.orders[0]?.adjustments[0]?.adjustment_details).toEqual([]);
  });

  test('@surcharge @regression @contract status 1 represents no applied adjustment and has no details', () => {
    const response = responseFor(validRequest, '1');
    expect(response.orders[0]?.total_surcharge).toBe(0);
    expect(response.orders[0]?.adjustments[0]?.adjustment_details).toEqual([]);
  });

  test('@surcharge @regression @contract status 2 returns an adjustment detail', () => {
    const response = responseFor(validRequest, '2');
    expect(response.orders[0]?.adjustments[0]?.adjustment_details).toHaveLength(1);
    expect(validateSurchargeResponse(response, validRequest)).toEqual([]);
  });

  const invalidResponseCases: Array<[string, (response: SurchargeResponse) => void, string]> = [
    ['rejects an invalid status', response => { response.orders[0]!.adjustments[0]!.status = '9' as '0'; }, 'status is invalid'],
    ['rejects details for status one', response => { response.orders[0]!.adjustments[0]!.status = '1'; response.orders[0]!.adjustments[0]!.adjustment_details = [{ ...response.orders[0]!.adjustments[0]!.adjustment_details[0]! }]; }, 'must not return details'],
    ['rejects a non-numeric total', response => { response.orders[0]!.total_surcharge = Number.NaN; }, 'total_surcharge must be numeric'],
    ['rejects a non-echoed item id', response => { response.orders[0]!.adjustments[0]!.item_id = 'OTHER'; }, 'item_id was not echoed'],
    ['rejects a non-boolean charge flag', response => { response.orders[0]!.adjustments[0]!.adjustment_details = [{ ...response.orders[0]!.adjustments[0]!.adjustment_details[0]!, charge: 'true' as unknown as boolean }]; }, 'charge must be boolean'],
  ];

  for (const [title, mutate, expected] of invalidResponseCases) {
    test(`@surcharge @regression @contract ${title}`, () => {
      const response = responseFor(validRequest, expected.includes('details') || expected.includes('charge') ? '2' : '1');
      mutate(response);
      expect(validateSurchargeResponse(response, validRequest).some(error => error.includes(expected))).toBe(true);
    });
  }
});