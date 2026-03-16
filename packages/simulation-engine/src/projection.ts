import {
  calculateCostOfGoods,
  calculateGrossProfit,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateRevenue,
} from './financialCalculations.js';
import { applyScenarioTransform } from './scenarioTransform.js';
import type { MonthlyProjection, SimulationEngineInput } from './types.js';

export function projectMonthlyFinancials(
  input: SimulationEngineInput,
  months: number,
): MonthlyProjection[] {
  const normalizedMonths = Math.max(0, Math.floor(months));
  const transformedInput = applyScenarioTransform(input);
  const revenue = calculateRevenue(transformedInput.products);
  const costOfGoods = calculateCostOfGoods(transformedInput.products);
  const grossProfit = calculateGrossProfit(revenue, costOfGoods);
  const operatingExpenses = calculateOperatingExpenses(transformedInput.expenses);
  const netProfit = calculateNetProfit(grossProfit, operatingExpenses);

  return Array.from({ length: normalizedMonths }, (_, index) => ({
    month: index + 1,
    revenue,
    expenses: operatingExpenses,
    profit: netProfit,
  }));
}
