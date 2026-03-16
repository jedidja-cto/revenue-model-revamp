import {
  calculateBreakEvenRevenue,
  calculateBreakEvenUnits,
} from './breakEven.js';
import { calculateCumulativeProfit, calculateRunway } from './cashflow.js';
import { resolveSimulationEngineConfig } from './config.js';
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
import type { SimulationEngineConfig } from './config.js';
import type { SimulationEngineInput, SimulationResult } from './types.js';

export function runSimulation(
  input: SimulationEngineInput,
  config?: Partial<SimulationEngineConfig>,
): SimulationResult {
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
  const runway = calculateRunway(
    monthlyProjection.map((projection) => projection.profit),
  );

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
  };
}
