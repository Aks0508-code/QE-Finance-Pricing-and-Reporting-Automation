import { expect, test } from '@playwright/test';
import {
  calculateRoundedAdjustment,
  effectiveQuantity,
  isDateWithinInclusiveRange,
  isOutsideTimeFence,
  type SurchargeOrderRequest,
  type SurchargeRequest,
  type SurchargeResponse,
  validateSurchargeRequest,
  validateSurchargeResponse,
} from '../../config/surcharge-contract';

const baseOrder: SurchargeOrderRequest = {
  customer_id: 'CUSTOMER-AUTOMATION',
  ship_to: '',
  order_date: '2026-01-15',
  items: [{ item_id: 'ITEM-AUTOMATION', price: 100 }],
};

function requestWith(overrides: Partial<SurchargeOrderRequest> = {}): SurchargeRequest {
  return { orders: [{ ...baseOrder, ...overrides }] };
}

test.describe('Surcharge regression request matrix', () => {
  const cases: Array<[string, unknown, boolean]> = [
    ['accepts bill-to processing with blank ship-to', requestWith(), true],
    ['accepts an order identifier', requestWith({ order_id: 'ORD-001' }), true],
    ['accepts an estimated ship date', requestWith({ est_ship_date: '2026-01-18T10:00:00Z' }), true],
    ['accepts an invoice date', requestWith({ invoice_date: '2026-01-20T10:00:00Z' }), true],
    ['accepts a warehouse qualifier', requestWith({ warehouse_id: '005' }), true],
    ['accepts an explicit quantity', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', quantity: 10, price: 442.5 }] }), true],
    ['accepts a null quantity default', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', quantity: null, price: 29.99 }] }), true],
    ['accepts a zero quantity boundary', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', quantity: 0, price: 0 }] }), true],
    ['accepts a zero price boundary', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', quantity: 1, price: 0 }] }), true],
    ['accepts a decimal price', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', quantity: 1, price: 29.99 }] }), true],
    ['accepts multiple items on one order', requestWith({ items: [...baseOrder.items, { item_id: 'ITEM-B', quantity: 2, price: 49.99 }] }), true],
    ['accepts a high quantity without changing the contract', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', quantity: 100, price: 15000 }] }), true],
    ['rejects a blank customer', requestWith({ customer_id: '' }), false],
    ['rejects a non-ISO order date', requestWith({ order_date: '10-05-2025' }), false],
    ['rejects an impossible order date', requestWith({ order_date: '2026-02-30' }), false],
    ['rejects an empty item list', requestWith({ items: [] }), false],
    ['rejects a negative item price', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', price: -1 }] }), false],
    ['rejects a negative item quantity', requestWith({ items: [{ item_id: 'ITEM-AUTOMATION', quantity: -1, price: 1 }] }), false],
  ];

  for (const [title, request, valid] of cases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(validateSurchargeRequest(request)).toHaveLength(valid ? 0 : 1));
  }
});

test.describe('Surcharge regression date and time-fence matrix', () => {
  const rangeCases: Array<[string, string, string, string, boolean]> = [
    ['accepts the first order date', '2026-01-01', '2026-01-01', '2026-01-31', true],
    ['accepts the last order date', '2026-01-31', '2026-01-01', '2026-01-31', true],
    ['accepts a date inside the effectivity range', '2026-01-15', '2026-01-01', '2026-01-31', true],
    ['rejects a date before the effectivity range', '2025-12-31', '2026-01-01', '2026-01-31', false],
    ['rejects a date after the effectivity range', '2026-02-01', '2026-01-01', '2026-01-31', false],
    ['rejects an invalid order date', '2026-02-30', '2026-01-01', '2026-01-31', false],
  ];

  for (const [title, value, from, to, expected] of rangeCases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(isDateWithinInclusiveRange(value, from, to)).toBe(expected));
  }

  const fenceCases: Array<[string, string, string, number, boolean]> = [
    ['rejects the fence date itself', '2026-01-08', '2026-01-01', 7, false],
    ['accepts the first date beyond a seven-day fence', '2026-01-09', '2026-01-01', 7, true],
    ['accepts a date well beyond the fence', '2026-02-01', '2026-01-01', 7, true],
    ['rejects a date before today', '2025-12-31', '2026-01-01', 7, false],
    ['supports a zero-day fence', '2026-01-02', '2026-01-01', 0, true],
    ['rejects a negative time fence', '2026-01-09', '2026-01-01', -1, false],
  ];

  for (const [title, value, today, days, expected] of fenceCases) {
    test(`@surcharge @regression @contract ${title}`, () => expect(isOutsideTimeFence(value, today, days)).toBe(expected));
  }
});

test.describe('Surcharge regression calculation matrix', () => {
  const cases: Array<[string, number, number, 'PERCENT' | 'DOLLAR', number, number]> = [
    ['percent five on one item', 29.99, 1, 'PERCENT', 5, 2],
    ['percent five on ten items', 257.5, 10, 'PERCENT', 5, 20],
    ['percent six on ten items', 442.5, 10, 'PERCENT', 6, 30],
    ['percent two on ten items', 257.5, 10, 'PERCENT', 2, 10],
    ['percent zero', 100, 1, 'PERCENT', 0, 0],
    ['percent one hundred', 100, 1, 'PERCENT', 100, 100],
    ['percent on a fractional unit', 11.99, 1, 'PERCENT', 5, 1],
    ['percent extends rounded unit amount', 99.98, 2, 'PERCENT', 5, 6],
    ['percent zero price', 0, 1, 'PERCENT', 5, 0],
    ['percent zero quantity', 100, 0, 'PERCENT', 5, 0],
    ['dollar one per unit', 100, 2, 'DOLLAR', 1, 100],
    ['dollar fractional unit', 25, 2, 'DOLLAR', 1.5, 38],
    ['dollar zero value', 100, 2, 'DOLLAR', 0, 0],
    ['dollar zero price', 0, 1, 'DOLLAR', 2, 0],
    ['dollar zero quantity', 100, 0, 'DOLLAR', 2, 0],
    ['dollar extended quantity', 49.99, 3, 'DOLLAR', 1, 51],
    ['percent quantity one default equivalent', 29.99, 1, 'PERCENT', 5, 2],
    ['percent price supplied as extended total', 59.97, 3, 'PERCENT', 5, 3],
    ['percent rounding remains upward', 442.5, 10, 'PERCENT', 6, 30],
    ['dollar rounds each unit before extension', 10, 3, 'DOLLAR', 0.5, 6],
  ];

  for (const [title, price, quantity, type, value, expected] of cases) {
    test(`@surcharge @regression @functional ${title}`, () => expect(calculateRoundedAdjustment(price, quantity, type, value)).toBe(expected));
  }
});

function responseFixture(status: '0' | '1' | '2' = '2'): SurchargeResponse {
  return {
    orders: [{
      order_id: 'ORD-001', customer_id: 'CUSTOMER-AUTOMATION', ship_to: '', total_surcharge: status === '2' ? 5 : 0,
      adjustments: [{ item_id: 'ITEM-AUTOMATION', quantity: 1, price: 29.99, status, adjustment_details: status === '2' ? [{
        credit_code: 'TSC', adjustment_name: 'TSC TEST', adjustment_amount: 5, invoice_level: '1', taxable: 'N', commissionable: 'N', quantity: 1,
        calculation_value: 5, calculation_type: 'PERCENT', applied_level: 'ITEMCLASS', applied_level_value: 'CLASS-A', charge: true,
      }] : [] }],
    }],
  };
}

test.describe('Surcharge regression response and status matrix', () => {
  const request = requestWith({ order_id: 'ORD-001', items: [{ item_id: 'ITEM-AUTOMATION', price: 29.99 }] });
  const cases: Array<[string, (response: SurchargeResponse) => void]> = [
    ['returns status zero with no details', response => { response.orders[0]!.adjustments[0] = responseFixture('0').orders[0]!.adjustments[0]!; }],
    ['returns status one with no details', response => { response.orders[0]!.adjustments[0] = responseFixture('1').orders[0]!.adjustments[0]!; }],
    ['returns status two with details', response => { response.orders[0]!.adjustments[0] = responseFixture('2').orders[0]!.adjustments[0]!; }],
    ['echoes the order id', response => { response.orders[0]!.order_id = 'ORD-001'; }],
    ['echoes the customer id', response => { response.orders[0]!.customer_id = 'CUSTOMER-AUTOMATION'; }],
    ['echoes a blank ship-to', response => { response.orders[0]!.ship_to = ''; }],
    ['returns a numeric order total', response => { response.orders[0]!.total_surcharge = 5; }],
    ['returns a numeric adjustment amount', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.adjustment_amount = 5; }],
    ['supports line-item invoice level', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.invoice_level = '1'; }],
    ['supports order-level invoice level', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.invoice_level = '2'; }],
    ['returns the taxable flag', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.taxable = 'N'; }],
    ['returns the commissionable flag', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.commissionable = 'N'; }],
    ['returns a boolean charge flag', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.charge = true; }],
    ['returns the calculation metadata', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.calculation_type = 'PERCENT'; }],
    ['returns the applied item-class value', response => { response.orders[0]!.adjustments[0]!.adjustment_details[0]!.applied_level_value = 'CLASS-A'; }],
  ];

  for (const [title, mutate] of cases) {
    test(`@surcharge @regression @contract ${title}`, () => {
      const response = responseFixture();
      mutate(response);
      expect(validateSurchargeResponse(response, request)).toEqual([]);
    });
  }
});

test.describe('Surcharge regression customer/item scenario matrix', () => {
  const cases: Array<[string, SurchargeRequest]> = [
    ['global detail with customer and blank warehouse', requestWith({ customer_id: 'CUSTOMER-A', ship_to: '01', warehouse_id: '' })],
    ['global detail with customer ship-to and warehouse', requestWith({ customer_id: 'CUSTOMER-A', ship_to: '01', warehouse_id: '335' })],
    ['customer inclusion with blank warehouse', requestWith({ customer_id: 'CUSTOMER-A', ship_to: '01', warehouse_id: '' })],
    ['customer exclusion with explicit warehouse', requestWith({ customer_id: 'CUSTOMER-EXCLUDED', ship_to: '01', warehouse_id: '335' })],
    ['customer exclusion with blank ship-to', requestWith({ customer_id: 'CUSTOMER-EXCLUDED', ship_to: '', warehouse_id: '335' })],
    ['customer override for one item', requestWith({ customer_id: 'CUSTOMER-OVERRIDE', items: [{ item_id: 'ITEM-A', quantity: 10, price: 257.5 }] })],
    ['item exclusion with matching item', requestWith({ items: [{ item_id: 'ITEM-EXCLUDED', quantity: 1, price: 100 }] })],
    ['item exclusion with a second non-excluded item', requestWith({ items: [{ item_id: 'ITEM-EXCLUDED', price: 100 }, { item_id: 'ITEM-INCLUDED', price: 100 }] })],
    ['detail at order-date start boundary', requestWith({ order_date: '2026-01-01' })],
    ['detail at order-date end boundary', requestWith({ order_date: '2026-12-31' })],
    ['multiple orders in one request', { orders: [baseOrder, { ...baseOrder, order_id: 'ORD-002', customer_id: 'CUSTOMER-B', items: [{ item_id: 'ITEM-B', price: 49.99 }] }] }],
    ['invalid-item regression input remains schema-valid', requestWith({ items: [{ item_id: 'ZZZZZ', quantity: 5, price: 33.55 }] })],
  ];

  for (const [title, request] of cases) {
    test(`@surcharge @regression @functional ${title}`, () => expect(validateSurchargeRequest(request)).toEqual([]));
  }
});