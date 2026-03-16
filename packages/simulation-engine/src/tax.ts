export function calculateTax(netProfit: number, taxRate: number): number {
  return Math.max(0, netProfit * taxRate);
}
