import type { SimulationEngineInput } from './types.js';

function assertPercentageRange(label: string, value: number): void {
  if (value < -100 || value > 100) {
    throw new Error(`${label} must be between -100 and 100.`);
  }
}

export function validateSimulationInput(input: SimulationEngineInput): void {
  input.products.forEach((product) => {
    if (product.sellingPrice < 0) {
      throw new Error(`Product "${product.name}" has a negative selling price.`);
    }

    if (product.costPrice < 0) {
      throw new Error(`Product "${product.name}" has a negative cost price.`);
    }

    if (product.estimatedMonthlyUnits < 0) {
      throw new Error(
        `Product "${product.name}" has a negative estimated monthly unit value.`,
      );
    }
  });

  input.expenses.forEach((expense) => {
    if (expense.amountMonthly < 0) {
      throw new Error(`Expense "${expense.name}" has a negative monthly amount.`);
    }
  });

  assertPercentageRange('Scenario priceChangePercent', input.scenario.priceChangePercent);
  assertPercentageRange('Scenario costChangePercent', input.scenario.costChangePercent);
  assertPercentageRange(
    'Scenario demandChangePercent',
    input.scenario.demandChangePercent,
  );
  assertPercentageRange(
    'Scenario expenseChangePercent',
    input.scenario.expenseChangePercent,
  );
}
