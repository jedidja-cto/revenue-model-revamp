import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { runSimulation } from '../../simulation-engine/dist/src/index.js';
import { loadYamlScenario } from '../dist/loadYamlScenario.js';
import {
  formatConsolidatedReport,
  formatSimulationSummary,
  runScenarioFile,
  runScenarioFiles,
  writeConsolidatedCsv,
} from '../dist/runScenario.js';

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

test('batch scenario runner includes a consolidated report for multiple YAML files', () => {
  const summary = runScenarioFiles([
    'scenarios/coffee-shop.yaml',
    'scenarios/retail-store.yaml',
    'scenarios/saas-product.yaml',
  ]);

  assert.match(summary, /Business: Downtown Coffee/);
  assert.match(summary, /Business: Main Street Retail/);
  assert.match(summary, /Business: FocusFlow/);
  assert.match(summary, /Consolidated Report/);
});

test('consolidated report totals stay consistent with runSimulation output', () => {
  const retail = loadYamlScenario('scenarios/retail-store.yaml');
  const retailResult = runSimulation(retail.input, retail.config);
  const report = formatConsolidatedReport([
    {
      filePath: 'scenarios/retail-store.yaml',
      input: retail.input,
      result: retailResult,
    },
  ]);

  assert.match(report, /Business: Main Street Retail/);
  assert.match(report, new RegExp(`Revenue: ${retailResult.revenue.toFixed(2)}`));
  assert.match(
    report,
    new RegExp(
      `Final Cumulative Profit: ${retailResult.cumulativeProfit.at(-1).toFixed(2)}`,
    ),
  );
});

test('batch runner can export a consolidated CSV report', () => {
  const csvPath = join(tmpdir(), 'revrem-cli-scenarios.csv');

  writeConsolidatedCsv(csvPath, [
    {
      filePath: 'scenarios/coffee-shop.yaml',
      ...loadYamlScenario('scenarios/coffee-shop.yaml'),
      result: runSimulation(
        loadYamlScenario('scenarios/coffee-shop.yaml').input,
        loadYamlScenario('scenarios/coffee-shop.yaml').config,
      ),
    },
  ]);

  const csvContents = readFileSync(csvPath, 'utf8');

  assert.match(csvContents, /businessName,revenue,grossProfit,netProfit/);
  assert.match(csvContents, /Downtown Coffee/);

  rmSync(csvPath, { force: true });
});
