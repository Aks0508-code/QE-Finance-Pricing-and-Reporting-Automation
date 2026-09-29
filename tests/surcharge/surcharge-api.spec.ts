import { expect, test } from '@playwright/test';
import { getSurchargeData, hasSurchargeApiData, isSurchargeApiEnabled } from '../../config/surcharge-data';
import {
  type SurchargeItemRequest,
  type SurchargeRequest,
  validateSurchargeResponse,
} from '../../config/surcharge-contract';

function apiRequest(): SurchargeRequest {
  const data = getSurchargeData();
  const item: SurchargeItemRequest = { item_id: data.item, price: Number(data.price) };
  if (data.quantity) item.quantity = Number(data.quantity);
  return {
    orders: [{
      order_id: process.env.SURCHARGE_API_TEST_ORDER_ID?.trim() || 'AUTOMATION-READONLY',
      customer_id: data.customer,
      ship_to: data.shipTo,
      order_date: data.orderDate,
      items: [item],
    }],
  };
}

function apiURL(): string {
  return process.env.SURCHARGE_API_BASE_URL?.trim() || 'https://adjustment-microservice.stage.finance.ashleyfurniture.com/Adjustment/Orders';
}

test.describe('Surcharge Adjustment microservice Stage contract', () => {
  test.beforeEach(() => {
    test.skip(!hasSurchargeApiData(), 'Stage API probes require explicit enablement and approved runtime data.');
  });

  test('@surcharge @api @e2e @regression posts the approved minimal request to Stage', async ({ request }) => {
    const response = await request.post(apiURL(), { data: apiRequest(), headers: { accept: 'application/json' } });
    expect(response.ok()).toBeTruthy();
    expect(validateSurchargeResponse(await response.json(), apiRequest())).toEqual([]);
  });

  test('@surcharge @api @regression echoes customer and ship-to values', async ({ request }) => {
    const input = apiRequest();
    const response = await request.post(apiURL(), { data: input });
    expect(response.ok()).toBeTruthy();
    const output = await response.json() as { orders: Array<{ customer_id: string; ship_to: string }> };
    expect(output.orders[0]?.customer_id).toBe(input.orders[0]?.customer_id);
    expect(output.orders[0]?.ship_to).toBe(input.orders[0]?.ship_to);
  });

  test('@surcharge @api @regression echoes the optional automation order id', async ({ request }) => {
    const input = apiRequest();
    const response = await request.post(apiURL(), { data: input });
    expect(response.ok()).toBeTruthy();
    const output = await response.json() as { orders: Array<{ order_id: string }> };
    expect(output.orders[0]?.order_id).toBe(input.orders[0]?.order_id);
  });

  test('@surcharge @api @regression defaults an omitted quantity to one', async ({ request }) => {
    const input = apiRequest();
    delete input.orders[0]!.items[0]!.quantity;
    const response = await request.post(apiURL(), { data: input });
    expect(response.ok()).toBeTruthy();
    const output = await response.json() as { orders: Array<{ adjustments: Array<{ quantity: number }> }> };
    expect(output.orders[0]?.adjustments[0]?.quantity).toBe(1);
  });

  test('@surcharge @api @regression preserves an explicit approved quantity', async ({ request }) => {
    const input = apiRequest();
    input.orders[0]!.items[0]!.quantity = Number(process.env.SURCHARGE_API_TEST_QUANTITY || 2);
    const response = await request.post(apiURL(), { data: input });
    expect(response.ok()).toBeTruthy();
    const output = await response.json() as { orders: Array<{ adjustments: Array<{ quantity: number }> }> };
    expect(output.orders[0]?.adjustments[0]?.quantity).toBe(input.orders[0]?.items[0]?.quantity);
  });

  test('@surcharge @api @regression returns only documented item statuses', async ({ request }) => {
    const response = await request.post(apiURL(), { data: apiRequest() });
    expect(response.ok()).toBeTruthy();
    const output = await response.json() as { orders: Array<{ adjustments: Array<{ status: string; adjustment_details: unknown[] }> }> };
    const adjustment = output.orders[0]?.adjustments[0];
    expect(['0', '1', '2']).toContain(adjustment?.status);
    if (adjustment?.status === '0' || adjustment?.status === '1') expect(adjustment.adjustment_details).toEqual([]);
  });

  test('@surcharge @api @regression returns an order total equal to its detail amounts', async ({ request }) => {
    const response = await request.post(apiURL(), { data: apiRequest() });
    expect(response.ok()).toBeTruthy();
    const output = await response.json() as { orders: Array<{ total_surcharge: number; adjustments: Array<{ adjustment_details: Array<{ adjustment_amount: number }> }> }> };
    const order = output.orders[0]!;
    const detailTotal = order.adjustments.flatMap(item => item.adjustment_details).reduce((sum, detail) => sum + detail.adjustment_amount, 0);
    expect(order.total_surcharge).toBeCloseTo(detailTotal, 2);
  });

  test('@surcharge @api @regression supports an approved second item when configured', async ({ request }) => {
    test.skip(!process.env.SURCHARGE_API_TEST_ITEM_2?.trim(), 'A second approved item is not configured.');
    const input = apiRequest();
    input.orders[0]!.items.push({ item_id: process.env.SURCHARGE_API_TEST_ITEM_2!.trim(), price: Number(process.env.SURCHARGE_API_TEST_PRICE_2 || input.orders[0]!.items[0]!.price) });
    const response = await request.post(apiURL(), { data: input });
    expect(response.ok()).toBeTruthy();
    const output = await response.json() as { orders: Array<{ adjustments: unknown[] }> };
    expect(output.orders[0]?.adjustments).toHaveLength(2);
  });
});

test.describe('Surcharge Adjustment microservice negative contract probes', () => {
  test.beforeEach(() => {
    test.skip(!isSurchargeApiEnabled() || process.env.SURCHARGE_API_NEGATIVE_TEST_ENABLED?.trim().toLowerCase() !== 'true', 'Negative Stage API probes require separate explicit approval.');
  });

  const negativeCases: Array<[string, (input: SurchargeRequest) => void]> = [
    ['rejects a missing customer', input => { input.orders[0]!.customer_id = ''; }],
    ['rejects a missing order date', input => { input.orders[0]!.order_date = ''; }],
    ['rejects a non-ISO order date', input => { input.orders[0]!.order_date = '10-05-2025'; }],
    ['rejects a negative price', input => { input.orders[0]!.items[0]!.price = -1; }],
  ];

  for (const [title, mutate] of negativeCases) {
    test(`@surcharge @api @regression @negative ${title}`, async ({ request }) => {
      const input = apiRequest();
      mutate(input);
      const response = await request.post(apiURL(), { data: input });
      expect([400, 422]).toContain(response.status());
    });
  }
});