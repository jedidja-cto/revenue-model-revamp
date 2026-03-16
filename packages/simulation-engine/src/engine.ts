import {
  calculateCostOfGoods,
  calculateGrossProfit,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateRevenue,
} from './financialCalculations.js';
import { applyScenarioTransform } from './scenarioTransform.js';
import type { SimulationEngineInput, SimulationResult } from './types.js';

export function runSimulation(input: SimulationEngineInput): SimulationResult {
  const transformedInput = applyScenarioTransform(input);
  const revenue = calculateRevenue(transformedInput.products);
  const costOfGoods = calculateCostOfGoods(transformedInput.products);
  const grossProfit = calculateGrossProfit(revenue, costOfGoods);
  const operatingExpenses = calculateOperatingExpenses(transformedInput.expenses);
  const netProfit = calculateNetProfit(grossProfit, operatingExpenses);

  return {
    revenue,
    costOfGoods,
    grossProfit,
    operatingExpenses,
    netProfit,
  };
}

