import {
  calculateCostOfGoods,
  calculateGrossProfit,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateRevenue,
} from './financialCalculations.js';
import {
  applyCostInflation,
  applyDemandGrowth,
  applyPriceGrowth,
} from './growthModel.js';
import type {
  Expense,
  MonthlyProjection,
  Product,
  SimulationEngineInput,
} from './types.js';

function projectProduct(
  product: Product,
  transformedInput: SimulationEngineInput,
  month: number,
): Product {
  const priceGrowthRate = transformedInput.scenario.priceChangePercent / 100;
  const costInflationRate = transformedInput.scenario.costChangePercent / 100;
  const demandGrowthRate = transformedInput.scenario.demandChangePercent / 100;

  return {
    ...product,
    sellingPrice: applyPriceGrowth(product.sellingPrice, priceGrowthRate, month),
    costPrice: applyCostInflation(product.costPrice, costInflationRate, month),
    estimatedMonthlyUnits: applyDemandGrowth(
      product.estimatedMonthlyUnits,
      demandGrowthRate,
      month,
    ),
  };
}

function projectExpense(
  expense: Expense,
  transformedInput: SimulationEngineInput,
  month: number,
): Expense {
  const expenseGrowthRate = transformedInput.scenario.expenseChangePercent / 100;

  return {
    ...expense,
    amountMonthly: applyCostInflation(
      expense.amountMonthly,
      expenseGrowthRate,
      month,
    ),
  };
}

export function projectMonthlyFinancials(
  transformedInput: SimulationEngineInput,
  months: number,
): MonthlyProjection[] {
  const normalizedMonths = Math.max(0, Math.floor(months));

  return Array.from({ length: normalizedMonths }, (_, index) => {
    const month = index + 1;
    const projectedProducts = transformedInput.products.map((product) =>
      projectProduct(product, transformedInput, month),
    );
    const projectedExpenses = transformedInput.expenses.map((expense) =>
      projectExpense(expense, transformedInput, month),
    );
    const revenue = calculateRevenue(projectedProducts);
    const costOfGoods = calculateCostOfGoods(projectedProducts);
    const grossProfit = calculateGrossProfit(revenue, costOfGoods);
    const operatingExpenses = calculateOperatingExpenses(projectedExpenses);
    const netProfit = calculateNetProfit(grossProfit, operatingExpenses);

    return {
      month,
      revenue,
      expenses: operatingExpenses,
      profit: netProfit,
    };
  });
}
