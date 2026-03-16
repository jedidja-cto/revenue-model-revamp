import {
  calculateBreakEvenRevenue,
  calculateBreakEvenUnits,
} from './breakEven.js';
import {
  calculateCumulativeProfit,
  calculateNetCashflow,
  calculateRunway,
} from './cashflow.js';
import { resolveSimulationEngineConfig } from './config.js';
import { calculateDepreciation } from './depreciation.js';
import {
  calculateCostOfGoods,
  calculateGrossProfit,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateRevenue,
} from './financialCalculations.js';
import { calculateGrossMargin, calculateProfitMargin } from './metrics.js';
import { projectMonthlyFinancials } from './projection.js';
import { applyScenarioTransform } from './scenarioTransform.js';
import { calculateTax } from './tax.js';
import { validateSimulationInput } from './validation.js';
import type { SimulationEngineConfig } from './config.js';
import type { SimulationEngineInput, SimulationResult } from './types.js';

function resolveDepreciationSchedule(
  projectionMonths: number,
  config: ReturnType<typeof resolveSimulationEngineConfig>,
): number[] {
  if (!config.capexSchedule) {
    return Array(projectionMonths).fill(0);
  }

  const schedule = calculateDepreciation(
    config.capexSchedule.capex,
    config.capexSchedule.months,
  );

  return Array.from({ length: projectionMonths }, (_, index) => schedule[index] ?? 0);
}

export function runSimulation(
  input: SimulationEngineInput,
  config?: Partial<SimulationEngineConfig>,
): SimulationResult {
  validateSimulationInput(input);
  const resolvedConfig = resolveSimulationEngineConfig(config);
  const transformedInput = applyScenarioTransform(input);
  const revenue = calculateRevenue(transformedInput.products);
  const costOfGoods = calculateCostOfGoods(transformedInput.products);
  const grossProfit = calculateGrossProfit(revenue, costOfGoods);
  const operatingExpenses = calculateOperatingExpenses(transformedInput.expenses);
  const netProfit = calculateNetProfit(grossProfit, operatingExpenses);
  const grossMargin = calculateGrossMargin(revenue, grossProfit);
  const profitMargin = calculateProfitMargin(revenue, netProfit);
  const breakEvenUnits = calculateBreakEvenUnits(
    operatingExpenses,
    transformedInput.products,
  );
  const breakEvenRevenue = calculateBreakEvenRevenue(
    operatingExpenses,
    transformedInput.products,
  );
  const monthlyProjection = projectMonthlyFinancials(
    transformedInput,
    transformedInput.business ? resolvedConfig.projectionMonths : 0,
  );
  const cumulativeProfit = calculateCumulativeProfit(
    monthlyProjection.map((projection) => projection.profit),
  );
  const taxPaid = monthlyProjection.map((projection) =>
    calculateTax(projection.profit, resolvedConfig.taxRate),
  );
  const profitAfterTax = monthlyProjection.map(
    (projection, index) => projection.profit - taxPaid[index],
  );
  const depreciation = resolveDepreciationSchedule(
    monthlyProjection.length,
    resolvedConfig,
  );
  const netCashflow = calculateNetCashflow(profitAfterTax, depreciation);
  const runway = calculateRunway(netCashflow);

  return {
    revenue,
    costOfGoods,
    grossProfit,
    operatingExpenses,
    netProfit,
    grossMargin,
    profitMargin,
    breakEvenUnits,
    breakEvenRevenue,
    monthlyProjection,
    cumulativeProfit,
    runway,
    taxPaid,
    profitAfterTax,
    depreciation,
    netCashflow,
  };
}
