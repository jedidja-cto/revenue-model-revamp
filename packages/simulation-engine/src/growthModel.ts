export function applyDemandGrowth(
  baseDemand: number,
  growthRate: number,
  month: number,
): number {
  return Math.max(0, baseDemand * Math.pow(1 + growthRate, month));
}

export function applyCostInflation(
  baseCost: number,
  inflationRate: number,
  month: number,
): number {
  return Math.max(0, baseCost * Math.pow(1 + inflationRate, month));
}

export function applyPriceGrowth(
  basePrice: number,
  growthRate: number,
  month: number,
): number {
  return Math.max(0, basePrice * Math.pow(1 + growthRate, month));
}
