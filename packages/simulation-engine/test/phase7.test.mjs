import test from 'node:test';
import assert from 'node:assert/strict';

import {
  calculateDepreciation,
  calculateTax,
  runSimulation,
} from '../dist/src/index.js';

const baseInput = {
  business: {
    id: 'business-1',
    name: 'Sample Business',
    industry: 'Retail',
    currency: 'NAD',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
  products: [
    {
      id: 'product-1',
      businessId: 'business-1',
      name: 'Widget',
      category: 'Core',
      costPrice: 40,
      sellingPrice: 100,
      estimatedMonthlyUnits: 10,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  expenses: [
    {
      id: 'expense-1',
      businessId: 'business-1',
      name: 'Rent',
      category: 'rent',
      amountMonthly: 100,
      fixed: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    },
  ],
  scenario: {
    id: 'scenario-1',
    businessId: 'business-1',
    name: 'Baseline',
    priceChangePercent: 0,
    costChangePercent: 0,
    demandChangePercent: 0,
    expenseChangePercent: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  },
};

test('calculateTax applies the configured tax rate and never returns negative tax', () => {
  assert.equal(calculateTax(100, 0.2), 20);
  assert.equal(calculateTax(-100, 0.2), 0);
});

test('calculateDepreciation creates a straight-line monthly schedule', () => {
  assert.deepEqual(calculateDepreciation(1200, 3), [400, 400, 400]);
  assert.deepEqual(calculateDepreciation(1200, 0), []);
});

test('runSimulation preserves existing metrics while adding tax and cashflow outputs', () => {
  const result = runSimulation(baseInput, {
    projectionMonths: 3,
    taxRate: 0.2,
    capexSchedule: {
      capex: 1200,
      months: 3,
    },
  });

  assert.equal(result.revenue, 1000);
  assert.equal(result.grossProfit, 600);
  assert.equal(result.operatingExpenses, 100);
  assert.equal(result.netProfit, 500);
  assert.equal(result.grossMargin, 0.6);
  assert.equal(result.profitMargin, 0.5);
  assert.equal(result.monthlyProjection.length, 3);
  assert.deepEqual(result.cumulativeProfit, [500, 1000, 1500]);
  assert.deepEqual(result.taxPaid, [100, 100, 100]);
  assert.deepEqual(result.profitAfterTax, [400, 400, 400]);
  assert.deepEqual(result.depreciation, [400, 400, 400]);
  assert.deepEqual(result.netCashflow, [0, 0, 0]);
  assert.equal(result.runway, 3);
});
