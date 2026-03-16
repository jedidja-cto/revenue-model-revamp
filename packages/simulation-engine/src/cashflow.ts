export function calculateCumulativeProfit(monthlyProfits: number[]): number[] {
  let runningTotal = 0;

  return monthlyProfits.map((profit) => {
    runningTotal += profit;
    return runningTotal;
  });
}

export function calculateNetCashflow(
  profitAfterTax: number[],
  depreciation: number[],
): number[] {
  return profitAfterTax.map(
    (profit, index) => profit - (depreciation[index] ?? 0),
  );
}

export function calculateCashShortfall(monthlyCashflow: number[]): number {
  let cumulativeCash = 0;
  let minimumCash = 0;

  monthlyCashflow.forEach((cashflow) => {
    cumulativeCash += cashflow;
    minimumCash = Math.min(minimumCash, cumulativeCash);
  });

  return Math.abs(minimumCash);
}

export function calculateRunway(monthlyCashflow: number[]): number {
  let cumulativeCash = 0;

  for (let monthIndex = 0; monthIndex < monthlyCashflow.length; monthIndex += 1) {
    cumulativeCash += monthlyCashflow[monthIndex];

    if (cumulativeCash < 0) {
      return monthIndex + 1;
    }
  }

  return monthlyCashflow.length;
}
