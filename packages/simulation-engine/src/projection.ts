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

function projectProduct(product: Product, input: SimulationEngineInput, month: number): Product {
  const priceGrowthRate = input.scenario.priceChangePercent / 100;
  const costInflationRate = input.scenario.costChangePercent / 100;
  const demandGrowthRate = input.scenario.demandChangePercent / 100;

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
  input: SimulationEngineInput,
  month: number,
): Expense {
  const expenseGrowthRate = input.scenario.expenseChangePercent / 100;

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
  input: SimulationEngineInput,
  months: number,
): MonthlyProjection[] {
  const normalizedMonths = Math.max(0, Math.floor(months));

  return Array.from({ length: normalizedMonths }, (_, index) => {
    const month = index + 1;
    const projectedProducts = input.products.map((product) =>
      projectProduct(product, input, month),
    );
    const projectedExpenses = input.expenses.map((expense) =>
      projectExpense(expense, input, month),
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
