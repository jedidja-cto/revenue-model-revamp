import {
  calculateBreakEvenRevenue,
  calculateBreakEvenUnits,
} from './breakEven.js';
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
import type { SimulationEngineInput, SimulationResult } from './types.js';

export function runSimulation(input: SimulationEngineInput): SimulationResult {
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
    input,
    input.business ? 12 : 0,
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
  };
}
