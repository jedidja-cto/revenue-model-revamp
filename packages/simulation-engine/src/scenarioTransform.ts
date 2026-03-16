import type { Expense, Product, SimulationEngineInput } from './types.js';

function applyPercentChange(value: number, percentChange: number): number {
  return Math.max(0, value * (1 + percentChange / 100));
}

function transformProduct(product: Product, input: SimulationEngineInput): Product {
  return {
    ...product,
    sellingPrice: applyPercentChange(
      product.sellingPrice,
      input.scenario.priceChangePercent,
    ),
    costPrice: applyPercentChange(product.costPrice, input.scenario.costChangePercent),
    estimatedMonthlyUnits: applyPercentChange(
      product.estimatedMonthlyUnits,
      input.scenario.demandChangePercent,
    ),
  };
}

function transformExpense(expense: Expense, input: SimulationEngineInput): Expense {
  return {
    ...expense,
    amountMonthly: applyPercentChange(
      expense.amountMonthly,
      input.scenario.expenseChangePercent,
    ),
  };
}

export function applyScenarioTransform(
  input: SimulationEngineInput,
): SimulationEngineInput {
  return {
    ...input,
    products: input.products.map((product) => transformProduct(product, input)),
    expenses: input.expenses.map((expense) => transformExpense(expense, input)),
  };
}
