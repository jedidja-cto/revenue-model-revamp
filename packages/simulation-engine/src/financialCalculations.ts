import type { Expense, Product } from './types.js';

export function calculateRevenue(products: Product[]): number {
  return products.reduce(
    (total, product) => total + product.sellingPrice * product.estimatedMonthlyUnits,
    0,
  );
}

export function calculateCostOfGoods(products: Product[]): number {
  return products.reduce(
    (total, product) => total + product.costPrice * product.estimatedMonthlyUnits,
    0,
  );
}

export function calculateGrossProfit(
  revenue: number,
  costOfGoods: number,
): number {
  return revenue - costOfGoods;
}

export function calculateOperatingExpenses(expenses: Expense[]): number {
  return expenses.reduce((total, expense) => total + expense.amountMonthly, 0);
}

export function calculateNetProfit(
  grossProfit: number,
  operatingExpenses: number,
): number {
  return grossProfit - operatingExpenses;
}
