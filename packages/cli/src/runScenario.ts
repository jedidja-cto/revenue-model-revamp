import { resolve } from 'node:path';

import { runSimulation } from '@revenue-model-revamp/simulation-engine';
import type {
  SimulationEngineInput,
  SimulationResult,
} from '@revenue-model-revamp/simulation-engine';

import { loadYamlScenario } from './loadYamlScenario.js';

function formatCurrency(value: number): string {
  return value.toFixed(2);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatSeries(values: number[]): string {
  return values.map((value) => formatCurrency(value)).join(', ');
}

export function formatSimulationSummary(
  input: SimulationEngineInput,
  result: SimulationResult,
): string {
  return [
    `Business: ${input.business.name}`,
    '',
    `Revenue: ${formatCurrency(result.revenue)}`,
    `Gross Profit: ${formatCurrency(result.grossProfit)}`,
    `Operating Expenses: ${formatCurrency(result.operatingExpenses)}`,
    `Net Profit: ${formatCurrency(result.netProfit)}`,
    `Gross Margin: ${formatPercent(result.grossMargin)}`,
    `Profit Margin: ${formatPercent(result.profitMargin)}`,
    '',
    `Break-even Units: ${formatCurrency(result.breakEvenUnits)}`,
    `Break-even Revenue: ${formatCurrency(result.breakEvenRevenue)}`,
    `Runway: ${result.runway} months`,
    '',
    `Tax Paid: ${formatSeries(result.taxPaid)}`,
    `Profit After Tax: ${formatSeries(result.profitAfterTax)}`,
    `Depreciation: ${formatSeries(result.depreciation)}`,
    `Net Cashflow: ${formatSeries(result.netCashflow)}`,
    `Cumulative Profit: ${formatSeries(result.cumulativeProfit)}`,
  ].join('\n');
}

export function runScenarioFile(filePath: string): string {
  const { input, config } = loadYamlScenario(resolve(filePath));
  const result = runSimulation(input, config);
  return formatSimulationSummary(input, result);
}
