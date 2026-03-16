export function calculateCumulativeProfit(monthlyProfits: number[]): number[] {
  let runningTotal = 0;

  return monthlyProfits.map((profit) => {
    runningTotal += profit;
    return runningTotal;
  });
}

export function calculateRunway(monthlyProfits: number[]): number {
  let cumulativeProfit = 0;

  for (let monthIndex = 0; monthIndex < monthlyProfits.length; monthIndex += 1) {
    cumulativeProfit += monthlyProfits[monthIndex];

    if (cumulativeProfit < 0) {
      return monthIndex + 1;
    }
  }

  return monthlyProfits.length;
}
