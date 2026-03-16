import type { Product } from './types.js';

function calculateAverageContributionMargin(products: Product[]): number {
  const totalUnits = products.reduce(
    (sum, product) => sum + product.estimatedMonthlyUnits,
    0,
  );

  if (totalUnits === 0) {
    return 0;
  }

  const totalContribution = products.reduce(
    (sum, product) =>
      sum +
      (product.sellingPrice - product.costPrice) * product.estimatedMonthlyUnits,
    0,
  );

  return totalContribution / totalUnits;
}

function calculateAverageSellingPrice(products: Product[]): number {
  const totalUnits = products.reduce(
    (sum, product) => sum + product.estimatedMonthlyUnits,
    0,
  );

  if (totalUnits === 0) {
    return 0;
  }

  const weightedRevenue = products.reduce(
    (sum, product) => sum + product.sellingPrice * product.estimatedMonthlyUnits,
    0,
  );

  return weightedRevenue / totalUnits;
}

export function calculateBreakEvenUnits(
  fixedExpenses: number,
  products: Product[],
): number {
  const averageContributionMargin = calculateAverageContributionMargin(products);

  if (averageContributionMargin <= 0) {
    return 0;
  }

  return fixedExpenses / averageContributionMargin;
}

export function calculateBreakEvenRevenue(
  fixedExpenses: number,
  products: Product[],
): number {
  const breakEvenUnits = calculateBreakEvenUnits(fixedExpenses, products);
  const averageSellingPrice = calculateAverageSellingPrice(products);

  if (averageSellingPrice <= 0) {
    return 0;
  }

  return breakEvenUnits * averageSellingPrice;
}
