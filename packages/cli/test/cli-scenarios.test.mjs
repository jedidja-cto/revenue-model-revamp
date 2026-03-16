import test from 'node:test';
import assert from 'node:assert/strict';

import { runSimulation } from '../../simulation-engine/dist/src/index.js';
import { loadYamlScenario } from '../dist/loadYamlScenario.js';
import { formatSimulationSummary, runScenarioFile } from '../dist/runScenario.js';

test('YAML loader produces a valid simulation input and config for the coffee shop', () => {
  const loaded = loadYamlScenario('scenarios/coffee-shop.yaml');

  assert.equal(loaded.input.business.name, 'Downtown Coffee');
  assert.equal(loaded.input.products.length, 2);
  assert.equal(loaded.input.expenses.length, 3);
  assert.equal(loaded.config?.projectionMonths, 6);
  assert.equal(loaded.config?.taxRate, 0.2);
});

test('CLI summary output stays consistent with runSimulation results', () => {
  const loaded = loadYamlScenario('scenarios/retail-store.yaml');
  const result = runSimulation(loaded.input, loaded.config);
  const summary = formatSimulationSummary(loaded.input, result);

  assert.match(summary, /Business: Main Street Retail/);
  assert.match(summary, new RegExp(`Revenue: ${result.revenue.toFixed(2)}`));
  assert.match(summary, new RegExp(`Net Profit: ${result.netProfit.toFixed(2)}`));
  assert.match(summary, new RegExp(`Runway: ${result.runway} months`));
});

test('CLI runner can execute the SaaS scenario file', () => {
  const summary = runScenarioFile('scenarios/saas-product.yaml');

  assert.match(summary, /Business: FocusFlow/);
  assert.match(summary, /Tax Paid:/);
  assert.match(summary, /Depreciation:/);
  assert.match(summary, /Net Cashflow:/);
  assert.match(summary, /Cumulative Profit:/);
});
