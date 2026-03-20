// packages/simulation-engine/src/breakEven.ts
function calculateAverageContributionMargin(products) {
  const totalUnits = products.reduce(
    (sum, product) => sum + product.estimatedMonthlyUnits,
    0
  );
  if (totalUnits === 0) {
    return 0;
  }
  const totalContribution = products.reduce(
    (sum, product) => sum + (product.sellingPrice - product.costPrice) * product.estimatedMonthlyUnits,
    0
  );
  return totalContribution / totalUnits;
}
function calculateAverageSellingPrice(products) {
  const totalUnits = products.reduce(
    (sum, product) => sum + product.estimatedMonthlyUnits,
    0
  );
  if (totalUnits === 0) {
    return 0;
  }
  const weightedRevenue = products.reduce(
    (sum, product) => sum + product.sellingPrice * product.estimatedMonthlyUnits,
    0
  );
  return weightedRevenue / totalUnits;
}
function calculateBreakEvenUnits(fixedExpenses, products) {
  const averageContributionMargin = calculateAverageContributionMargin(products);
  if (averageContributionMargin <= 0) {
    return 0;
  }
  return fixedExpenses / averageContributionMargin;
}
function calculateBreakEvenRevenue(fixedExpenses, products) {
  const breakEvenUnits = calculateBreakEvenUnits(fixedExpenses, products);
  const averageSellingPrice = calculateAverageSellingPrice(products);
  if (averageSellingPrice <= 0) {
    return 0;
  }
  return breakEvenUnits * averageSellingPrice;
}

// packages/simulation-engine/src/cashflow.ts
function calculateCumulativeProfit(monthlyProfits) {
  let runningTotal = 0;
  return monthlyProfits.map((profit) => {
    runningTotal += profit;
    return runningTotal;
  });
}
function calculateNetCashflow(profitAfterTax, depreciation) {
  return profitAfterTax.map(
    (profit, index) => profit - (depreciation[index] ?? 0)
  );
}
function calculateCashShortfall(monthlyCashflow) {
  let cumulativeCash = 0;
  let minimumCash = 0;
  monthlyCashflow.forEach((cashflow) => {
    cumulativeCash += cashflow;
    minimumCash = Math.min(minimumCash, cumulativeCash);
  });
  return Math.abs(minimumCash);
}
function calculateRunway(monthlyCashflow) {
  let cumulativeCash = 0;
  for (let monthIndex = 0; monthIndex < monthlyCashflow.length; monthIndex += 1) {
    cumulativeCash += monthlyCashflow[monthIndex];
    if (cumulativeCash < 0) {
      return monthIndex + 1;
    }
  }
  return monthlyCashflow.length;
}

// packages/simulation-engine/src/config.ts
var DEFAULT_SIMULATION_ENGINE_CONFIG = {
  projectionMonths: 12,
  taxRate: 0.2
};
function resolveSimulationEngineConfig(config) {
  return {
    ...DEFAULT_SIMULATION_ENGINE_CONFIG,
    ...config
  };
}

// packages/simulation-engine/src/depreciation.ts
function calculateDepreciation(capex, months) {
  const normalizedMonths = Math.max(0, Math.floor(months));
  if (normalizedMonths === 0) {
    return [];
  }
  const monthlyDepreciation = Math.max(0, capex) / normalizedMonths;
  return Array(normalizedMonths).fill(monthlyDepreciation);
}

// packages/simulation-engine/src/financialCalculations.ts
function calculateRevenue(products) {
  return products.reduce(
    (total, product) => total + product.sellingPrice * product.estimatedMonthlyUnits,
    0
  );
}
function calculateCostOfGoods(products) {
  return products.reduce(
    (total, product) => total + product.costPrice * product.estimatedMonthlyUnits,
    0
  );
}
function calculateGrossProfit(revenue, costOfGoods) {
  return revenue - costOfGoods;
}
function calculateOperatingExpenses(expenses) {
  return expenses.reduce((total, expense) => total + expense.amountMonthly, 0);
}
function calculateNetProfit(grossProfit, operatingExpenses) {
  return grossProfit - operatingExpenses;
}

// packages/simulation-engine/src/growthModel.ts
function applyDemandGrowth(baseDemand, growthRate, month) {
  return Math.max(0, baseDemand * Math.pow(1 + growthRate, month));
}
function applyCostInflation(baseCost, inflationRate, month) {
  return Math.max(0, baseCost * Math.pow(1 + inflationRate, month));
}
function applyPriceGrowth(basePrice, growthRate, month) {
  return Math.max(0, basePrice * Math.pow(1 + growthRate, month));
}

// packages/simulation-engine/src/metrics.ts
function calculateGrossMargin(revenue, grossProfit) {
  if (revenue === 0) {
    return 0;
  }
  return grossProfit / revenue;
}
function calculateProfitMargin(revenue, netProfit) {
  if (revenue === 0) {
    return 0;
  }
  return netProfit / revenue;
}

// packages/simulation-engine/src/projection.ts
function projectProduct(product, transformedInput, month) {
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
      month
    )
  };
}
function projectExpense(expense, transformedInput, month) {
  const expenseGrowthRate = transformedInput.scenario.expenseChangePercent / 100;
  return {
    ...expense,
    amountMonthly: applyCostInflation(
      expense.amountMonthly,
      expenseGrowthRate,
      month
    )
  };
}
function projectMonthlyFinancials(transformedInput, months) {
  const normalizedMonths = Math.max(0, Math.floor(months));
  return Array.from({ length: normalizedMonths }, (_, index) => {
    const month = index + 1;
    const projectedProducts = transformedInput.products.map(
      (product) => projectProduct(product, transformedInput, month)
    );
    const projectedExpenses = transformedInput.expenses.map(
      (expense) => projectExpense(expense, transformedInput, month)
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
      profit: netProfit
    };
  });
}

// packages/simulation-engine/src/scenarioTransform.ts
function applyPercentChange(value, percentChange) {
  return Math.max(0, value * (1 + percentChange / 100));
}
function transformProduct(product, input) {
  return {
    ...product,
    sellingPrice: applyPercentChange(
      product.sellingPrice,
      input.scenario.priceChangePercent
    ),
    costPrice: applyPercentChange(product.costPrice, input.scenario.costChangePercent),
    estimatedMonthlyUnits: applyPercentChange(
      product.estimatedMonthlyUnits,
      input.scenario.demandChangePercent
    )
  };
}
function transformExpense(expense, input) {
  return {
    ...expense,
    amountMonthly: applyPercentChange(
      expense.amountMonthly,
      input.scenario.expenseChangePercent
    )
  };
}
function applyScenarioTransform(input) {
  return {
    ...input,
    products: input.products.map((product) => transformProduct(product, input)),
    expenses: input.expenses.map((expense) => transformExpense(expense, input))
  };
}

// packages/simulation-engine/src/tax.ts
function calculateTax(netProfit, taxRate) {
  return Math.max(0, netProfit * taxRate);
}

// packages/simulation-engine/src/validation.ts
function assertPercentageRange(label, value) {
  if (value < -100 || value > 100) {
    throw new Error(`${label} must be between -100 and 100.`);
  }
}
function validateSimulationInput(input) {
  input.products.forEach((product) => {
    if (product.sellingPrice < 0) {
      throw new Error(`Product "${product.name}" has a negative selling price.`);
    }
    if (product.costPrice < 0) {
      throw new Error(`Product "${product.name}" has a negative cost price.`);
    }
    if (product.estimatedMonthlyUnits < 0) {
      throw new Error(
        `Product "${product.name}" has a negative estimated monthly unit value.`
      );
    }
  });
  input.expenses.forEach((expense) => {
    if (expense.amountMonthly < 0) {
      throw new Error(`Expense "${expense.name}" has a negative monthly amount.`);
    }
  });
  assertPercentageRange("Scenario priceChangePercent", input.scenario.priceChangePercent);
  assertPercentageRange("Scenario costChangePercent", input.scenario.costChangePercent);
  assertPercentageRange(
    "Scenario demandChangePercent",
    input.scenario.demandChangePercent
  );
  assertPercentageRange(
    "Scenario expenseChangePercent",
    input.scenario.expenseChangePercent
  );
}

// packages/simulation-engine/src/engine.ts
function resolveDepreciationSchedule(projectionMonths, config) {
  if (!config.capexSchedule) {
    return Array(projectionMonths).fill(0);
  }
  const schedule = calculateDepreciation(
    config.capexSchedule.capex,
    config.capexSchedule.months
  );
  return Array.from({ length: projectionMonths }, (_, index) => schedule[index] ?? 0);
}
function runSimulation(input, config) {
  validateSimulationInput(input);
  const resolvedConfig = resolveSimulationEngineConfig(config);
  const transformedInput = applyScenarioTransform(input);
  const revenue = calculateRevenue(transformedInput.products);
  const costOfGoods = calculateCostOfGoods(transformedInput.products);
  const grossProfit = calculateGrossProfit(revenue, costOfGoods);
  const operatingExpenses = calculateOperatingExpenses(transformedInput.expenses);
  const netProfit = calculateNetProfit(grossProfit, operatingExpenses);
  const grossMargin = calculateGrossMargin(revenue, grossProfit);
  const profitMargin = calculateProfitMargin(revenue, netProfit);
  const breakEvenUnits = calculateBreakEvenUnits(
    operatingExpenses,
    transformedInput.products
  );
  const breakEvenRevenue = calculateBreakEvenRevenue(
    operatingExpenses,
    transformedInput.products
  );
  const monthlyProjection = projectMonthlyFinancials(
    transformedInput,
    transformedInput.business ? resolvedConfig.projectionMonths : 0
  );
  const cumulativeProfit = calculateCumulativeProfit(
    monthlyProjection.map((projection) => projection.profit)
  );
  const taxPaid = monthlyProjection.map(
    (projection) => calculateTax(projection.profit, resolvedConfig.taxRate)
  );
  const profitAfterTax = monthlyProjection.map(
    (projection, index) => projection.profit - taxPaid[index]
  );
  const depreciation = resolveDepreciationSchedule(
    monthlyProjection.length,
    resolvedConfig
  );
  const netCashflow = calculateNetCashflow(profitAfterTax, depreciation);
  const runway = calculateRunway(netCashflow);
  return {
    revenue,
    costOfGoods,
    grossProfit,
    operatingExpenses,
    netProfit,
    grossMargin,
    profitMargin,
    breakEvenUnits,
    breakEvenRevenue,
    monthlyProjection,
    cumulativeProfit,
    runway,
    taxPaid,
    profitAfterTax,
    depreciation,
    netCashflow
  };
}

// packages/simulation-engine/src/scenarioPresets.ts
function createScenarioPreset(businessId, id, name, priceChangePercent, costChangePercent, demandChangePercent, expenseChangePercent) {
  return {
    id,
    businessId,
    name,
    priceChangePercent,
    costChangePercent,
    demandChangePercent,
    expenseChangePercent,
    createdAt: /* @__PURE__ */ new Date()
  };
}
function steadyGrowth(businessId) {
  return createScenarioPreset(
    businessId,
    "steady-growth",
    "Steady Growth",
    2,
    1,
    3,
    1
  );
}
function optimisticGrowth(businessId) {
  return createScenarioPreset(
    businessId,
    "optimistic-growth",
    "Optimistic Growth",
    4,
    1,
    8,
    2
  );
}
function inflationSpike(businessId) {
  return createScenarioPreset(
    businessId,
    "inflation-spike",
    "Inflation Spike",
    1,
    10,
    -3,
    8
  );
}
function marketCrash(businessId) {
  return createScenarioPreset(
    businessId,
    "market-crash",
    "Market Crash",
    -10,
    -5,
    -25,
    -10
  );
}

// packages/simulation-engine/src/index.ts
var SIMULATION_ENGINE_VERSION = "0.7.0";
export {
  DEFAULT_SIMULATION_ENGINE_CONFIG,
  SIMULATION_ENGINE_VERSION,
  applyCostInflation,
  applyDemandGrowth,
  applyPriceGrowth,
  applyScenarioTransform,
  calculateBreakEvenRevenue,
  calculateBreakEvenUnits,
  calculateCashShortfall,
  calculateCostOfGoods,
  calculateCumulativeProfit,
  calculateDepreciation,
  calculateGrossMargin,
  calculateGrossProfit,
  calculateNetCashflow,
  calculateNetProfit,
  calculateOperatingExpenses,
  calculateProfitMargin,
  calculateRevenue,
  calculateRunway,
  calculateTax,
  inflationSpike,
  marketCrash,
  optimisticGrowth,
  projectMonthlyFinancials,
  resolveSimulationEngineConfig,
  runSimulation,
  steadyGrowth,
  validateSimulationInput
};
