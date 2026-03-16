import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { runSimulation } from '@revenue-model-revamp/simulation-engine';
import type {
  SimulationEngineInput,
  SimulationResult,
} from '@revenue-model-revamp/simulation-engine';

import { loadYamlScenario } from './loadYamlScenario.js';

export interface ScenarioExecution {
  filePath: string;
  input: SimulationEngineInput;
  result: SimulationResult;
}

function formatCurrency(value: number): string {
  return value.toFixed(2);
}

function formatPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function formatSeries(values: number[]): string {
  return values.map((value) => formatCurrency(value)).join(', ');
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function getFinalCumulativeProfit(result: SimulationResult): number {
  return result.cumulativeProfit.at(-1) ?? 0;
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

export function executeScenarioFile(filePath: string): ScenarioExecution {
  const { input, config } = loadYamlScenario(resolve(filePath));
  const result = runSimulation(input, config);
  return {
    filePath,
    input,
    result,
  };
}

export function executeScenarioFiles(filePaths: string[]): ScenarioExecution[] {
  return filePaths.map((filePath) => executeScenarioFile(filePath));
}

export function formatConsolidatedReport(executions: ScenarioExecution[]): string {
  const lines = ['Consolidated Report', ''];

  executions.forEach(({ input, result }) => {
    lines.push(`Business: ${input.business.name}`);
    lines.push(`Revenue: ${formatCurrency(result.revenue)}`);
    lines.push(`Gross Profit: ${formatCurrency(result.grossProfit)}`);
    lines.push(`Net Profit: ${formatCurrency(result.netProfit)}`);
    lines.push(
      `Final Cumulative Profit: ${formatCurrency(getFinalCumulativeProfit(result))}`,
    );
    lines.push(`Runway: ${result.runway} months`);
    lines.push(`Tax Paid: ${formatCurrency(sum(result.taxPaid))}`);
    lines.push(`Depreciation: ${formatCurrency(sum(result.depreciation))}`);
    lines.push(`Net Cashflow: ${formatCurrency(sum(result.netCashflow))}`);
    lines.push('');
  });

  return lines.join('\n').trimEnd();
}

export function formatScenarioBatchOutput(executions: ScenarioExecution[]): string {
  if (executions.length === 1) {
    const { input, result } = executions[0];
    return formatSimulationSummary(input, result);
  }

  const individualSummaries = executions.map(({ input, result }) =>
    formatSimulationSummary(input, result),
  );

  return [
    ...individualSummaries,
    '',
    formatConsolidatedReport(executions),
  ].join('\n\n');
}

export function writeConsolidatedCsv(
  outputPath: string,
  executions: ScenarioExecution[],
): void {
  const resolvedOutputPath = resolve(outputPath);
  const rows = [
    [
      'businessName',
      'revenue',
      'grossProfit',
      'netProfit',
      'finalCumulativeProfit',
      'runwayMonths',
      'taxPaid',
      'depreciation',
      'netCashflow',
    ].join(','),
    ...executions.map(({ input, result }) =>
      [
        input.business.name,
        formatCurrency(result.revenue),
        formatCurrency(result.grossProfit),
        formatCurrency(result.netProfit),
        formatCurrency(getFinalCumulativeProfit(result)),
        result.runway,
        formatCurrency(sum(result.taxPaid)),
        formatCurrency(sum(result.depreciation)),
        formatCurrency(sum(result.netCashflow)),
      ].join(','),
    ),
  ];

  mkdirSync(dirname(resolvedOutputPath), { recursive: true });
  writeFileSync(resolvedOutputPath, rows.join('\n'), 'utf8');
}

export function runScenarioFile(filePath: string): string {
  return formatScenarioBatchOutput([executeScenarioFile(filePath)]);
}

export function runScenarioFiles(filePaths: string[], csvPath?: string): string {
  const executions = executeScenarioFiles(filePaths);

  if (csvPath) {
    writeConsolidatedCsv(csvPath, executions);
  }

  return formatScenarioBatchOutput(executions);
}
