export function calculateGrossMargin(
  revenue: number,
  grossProfit: number,
): number {
  if (revenue === 0) {
    return 0;
  }

  return grossProfit / revenue;
}

export function calculateProfitMargin(revenue: number, netProfit: number): number {
  if (revenue === 0) {
    return 0;
  }

  return netProfit / revenue;
}
