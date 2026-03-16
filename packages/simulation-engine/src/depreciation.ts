export function calculateDepreciation(capex: number, months: number): number[] {
  const normalizedMonths = Math.max(0, Math.floor(months));

  if (normalizedMonths === 0) {
    return [];
  }

  const monthlyDepreciation = Math.max(0, capex) / normalizedMonths;
  return Array(normalizedMonths).fill(monthlyDepreciation);
}
